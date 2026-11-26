import { useCallback, useEffect, useMemo, useState } from "react";
import { productosService } from "../services/productos.js";
import { categoriasService } from "../services/categorias.js";
import { authService } from "../services/auth.js";
import { ordenesService } from "../services/ordenes.js";
import { usuariosService } from "../services/usuarios.js";
import {
  AUTH_EXPIRED_EVENT,
  actualizarUsuarioLocal,
  guardarSesion,
  leerSesion,
  limpiarSesion,
} from "../services/authStorage.js";
import { validarRegistro } from "../logica/validaciones.js";
import {
  ROLES,
  esAdmin,
  esCliente,
  esVendedor,
  puedeComprarConRol,
  rutaPermitida,
  rutaPorDefecto,
} from "../logica/roles.js";

const QUINCE_MINUTOS = 15 * 60 * 1000;
const DETALLE_ID_KEY = "gamehubProductoDetalleId";
const PEDIDO_FINAL_KEY = "gamehubPedidoFinal";
const CART_GUEST_KEY = "gamehubCart_guest";

function claveCarritoDeUsuario(sesion) {
  if (!sesion) return CART_GUEST_KEY;
  if (!esCliente(sesion.rol)) return null;
  const identificador = sesion.id ?? sesion.email;
  if (!identificador) return CART_GUEST_KEY;
  return `gamehubCart_${String(identificador).trim().toLowerCase()}`;
}

function leerCarritoInicial(sesion) {
  const clave = claveCarritoDeUsuario(sesion);
  if (!clave) return [];
  return leerStorage(localStorage, clave, []);
}

function fusionarCarritos(base = [], invitado = []) {
  if (!invitado.length) return base;
  const mapa = new Map(base.map((item) => [item.id, { ...item }]));
  for (const item of invitado) {
    const existente = mapa.get(item.id);
    if (existente) {
      mapa.set(item.id, {
        ...existente,
        cantidad: existente.cantidad + item.cantidad,
      });
    } else {
      mapa.set(item.id, { ...item });
    }
  }
  return Array.from(mapa.values());
}

const leerStorage = (storage, clave, inicial) => {
  try {
    return JSON.parse(storage.getItem(clave)) ?? inicial;
  } catch {
    return inicial;
  }
};

export const formatoPrecio = (n) =>
  "$" + Number(n || 0).toLocaleString("es-CL");

function adaptarProducto(producto, nombresCategoria, stockPorId = new Map()) {
  const idCat = Number(producto.idCategory);
  const idProd = Number(producto.idProduct);
  const precioBase = Number(producto.precio);
  const precioOferta =
    producto.precioOferta != null ? Number(producto.precioOferta) : null;
  const ofertaActiva =
    Boolean(producto.enOferta) &&
    precioOferta != null &&
    precioOferta > 0 &&
    precioOferta < precioBase;
  const stockReal = stockPorId.has(idProd) ? stockPorId.get(idProd) : null;

  return {
    id: producto.idProduct,
    nombre: producto.nombreProduct,
    categoria:
      nombresCategoria.get(idCat) ?? `Categoría ${producto.idCategory}`,
    precio: ofertaActiva ? precioOferta : precioBase,
    precioBase,
    precioOferta,
    descripcion: producto.descripcion ?? "",
    imagen: producto.imagenUrl || "/img/teclado.jpg",
    imagenUrl: producto.imagenUrl || "",
    oferta: Boolean(producto.enOferta),
    stock: stockReal,
    caracteristicas: [
      producto.marca ? `Marca: ${producto.marca}` : null,
      producto.modelo ? `Modelo: ${producto.modelo}` : null,
      producto.mesesGarantia
        ? `Garantía: ${producto.mesesGarantia} meses`
        : null,
      stockReal != null ? `Stock disponible: ${stockReal} u.` : null,
    ].filter(Boolean),
    idCategory: producto.idCategory,
    marca: producto.marca ?? "",
    modelo: producto.modelo ?? "",
    estado: producto.estado ?? true,
  };
}

function mensajeDeError(error) {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

function leerRutaHash() {
  const ruta = location.hash.slice(1) || "inicio";
  return ruta === "categorias" ? "catalogo" : ruta;
}

export function useGameHub() {
  const [usuario, setUsuario] = useState(() => leerSesion());
  const rol = usuario?.rol ?? null;
  const soloLecturaVendedor = esVendedor(rol);
  const puedeComprar = puedeComprarConRol(rol);

  const [paginaEstado, setPagina] = useState(() => {
    const inicial = leerRutaHash();
    const sesionInicial = leerSesion();
    const rolInicial = sesionInicial?.rol ?? null;
    return rutaPermitida(inicial, rolInicial)
      ? inicial
      : rutaPorDefecto(rolInicial);
  });
  const pagina = rutaPermitida(paginaEstado, rol)
    ? paginaEstado
    : rutaPorDefecto(rol);

  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState("");
  const [categoriasApi, setCategoriasApi] = useState([]);
  const [errorCategorias, setErrorCategorias] = useState("");

  const [ordenes, setOrdenes] = useState([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false);
  const [errorOrdenes, setErrorOrdenes] = useState("");
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [misOrdenes, setMisOrdenes] = useState([]);

  const [usuariosAdmin, setUsuariosAdmin] = useState([]);
  const [cuentasAdmin, setCuentasAdmin] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState("");

  const [carrito, setCarrito] = useState(() => leerCarritoInicial(leerSesion()));
  const [modal, setModal] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [errorAuth, setErrorAuth] = useState("");
  const [autenticando, setAutenticando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [productoEditando, setProductoEditando] = useState(null);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [pedidoFinal, setPedidoFinal] = useState(() =>
    leerStorage(sessionStorage, PEDIDO_FINAL_KEY, null),
  );
  const [cuponValidado, setCuponValidado] = useState(null);
  const [procesandoCompra, setProcesandoCompra] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const navegar = useCallback(
    (nuevaPagina) => {
      const destino = rutaPermitida(nuevaPagina, rol)
        ? nuevaPagina
        : rutaPorDefecto(rol);
      setPagina(destino);
      setMensaje("");
      setErrorAuth("");
      if (location.hash.slice(1) !== destino) {
        location.hash = destino;
      }
      window.scrollTo(0, 0);
    },
    [rol],
  );

  // Sincroniza el hash del navegador cuando la ruta derivada difiere del hash actual.
  useEffect(() => {
    if (location.hash.slice(1) !== pagina) {
      location.hash = pagina;
    }
  }, [pagina]);

  // Sincronización con cambios manuales en la barra de direcciones (#admin, #ordenes, etc.).
  useEffect(() => {
    const sincronizar = () => {
      const rutaSolicitada = leerRutaHash();
      if (!rutaPermitida(rutaSolicitada, rol)) {
        const destino = rutaPorDefecto(rol);
        setPagina(destino);
        if (location.hash.slice(1) !== destino) {
          location.hash = destino;
        }
        return;
      }
      setPagina(rutaSolicitada);
    };

    window.addEventListener("hashchange", sincronizar);
    return () => window.removeEventListener("hashchange", sincronizar);
  }, [rol]);

  // Escucha expiración o rechazo 401 emitido por el cliente HTTP.
  useEffect(() => {
    const alExpirar = (evento) => {
      setUsuario(null);
      setCarrito([]);
      setCuponValidado(null);
      setPedidoFinal(null);
      setOrdenes([]);
      setOrdenSeleccionada(null);
      setMisOrdenes([]);
      setUsuariosAdmin([]);
      setCuentasAdmin([]);
      try {
        localStorage.removeItem(CART_GUEST_KEY);
      } catch {
        // ignore
      }
      setErrorAuth(
        evento.detail?.motivo ||
          "Tu sesión expiró. Inicia sesión nuevamente.",
      );
      setPagina("perfil");
      location.hash = "perfil";
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, alExpirar);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, alExpirar);
  }, []);

  // Renovación proactiva del JWT antes de vencer (inspirado en AuthProvider de la referencia).
  useEffect(() => {
    if (!usuario?.expira) return undefined;
    const restante = usuario.expira - Date.now();
    if (restante <= 0) {
      limpiarSesion();
      setUsuario(null);
      setErrorAuth("Tu sesión expiró. Inicia sesión nuevamente.");
      return undefined;
    }

    const duracion = Math.max(
      usuario.expira - (usuario.emitido ?? usuario.expira - 3600 * 1000),
      60 * 1000,
    );
    const margen = Math.min(QUINCE_MINUTOS, duracion / 4);

    const temporizadorRenovar = window.setTimeout(async () => {
      try {
        const renovado = await authService.renovar();
        const sesionActualizada = guardarSesion(renovado, {
          nombre: usuario.nombre,
          email: usuario.email,
          userId: usuario.userId,
        });
        if (sesionActualizada) setUsuario(sesionActualizada);
      } catch {
        // Si respondió 401, solicitar() ya emitió AUTH_EXPIRED_EVENT.
      }
    }, Math.max(restante - margen, 0));

    const temporizadorVencer = window.setTimeout(() => {
      limpiarSesion();
      setUsuario(null);
      setErrorAuth("Tu sesión expiró. Inicia sesión nuevamente.");
      setPagina("perfil");
      location.hash = "perfil";
    }, restante);

    return () => {
      window.clearTimeout(temporizadorRenovar);
      window.clearTimeout(temporizadorVencer);
    };
  }, [usuario]);

  const recargarCatalogo = useCallback(async (opciones = {}) => {
    setCargandoProductos(true);
    setErrorProductos("");
    setErrorCategorias("");

    const [resultadoProductos, resultadoCategorias] =
      await Promise.allSettled([
        productosService.listar(opciones),
        categoriasService.listar(opciones),
      ]);

    if (opciones.signal?.aborted) return;

    if (resultadoProductos.status === "rejected") {
      setErrorProductos(mensajeDeError(resultadoProductos.reason));
      setCargandoProductos(false);
      return;
    }

    const listaCategorias =
      resultadoCategorias.status === "fulfilled" &&
      Array.isArray(resultadoCategorias.value)
        ? resultadoCategorias.value
        : [];

    if (resultadoCategorias.status === "rejected") {
      setErrorCategorias(mensajeDeError(resultadoCategorias.reason));
    }

    setCategoriasApi(listaCategorias);

    const nombresCategoria = new Map(
      listaCategorias.map((item) => [
        Number(item.idCategory),
        item.nombreCategory,
      ]),
    );

    const listaProductos = Array.isArray(resultadoProductos.value)
      ? resultadoProductos.value
      : [];

    // Enriquecimiento con stock real desde inventory-mscv (degrada graciosamente si no responde).
    const ids = listaProductos.map((p) => p.idProduct).filter(Boolean);
    const listaStock = await productosService
      .consultarStock(ids, opciones)
      .catch(() => []);

    if (opciones.signal?.aborted) return;

    const stockPorId = new Map(
      (Array.isArray(listaStock) ? listaStock : []).map((s) => [
        Number(s.idProducto),
        Number(s.stockDisponible ?? 0),
      ]),
    );

    const adaptados = listaProductos.map((producto) =>
      adaptarProducto(producto, nombresCategoria, stockPorId),
    );
    setProductos(adaptados);

    // Restaura producto en vista #detalle tras recarga (F5) usando sessionStorage.
    const ultimoDetalleId = leerStorage(sessionStorage, DETALLE_ID_KEY, null);
    if (ultimoDetalleId != null) {
      const encontrado = adaptados.find(
        (p) => Number(p.id) === Number(ultimoDetalleId),
      );
      if (encontrado) {
        setProductoSeleccionado((prev) => prev ?? encontrado);
      }
    }

    setCargandoProductos(false);
  }, []);

  useEffect(() => {
    const control = new AbortController();
    recargarCatalogo({ signal: control.signal }).catch((error) => {
      if (!control.signal.aborted) {
        setErrorProductos(mensajeDeError(error));
        setCargandoProductos(false);
      }
    });
    return () => control.abort();
  }, [recargarCatalogo]);

  const cargarOrdenes = useCallback(
    async (opciones = {}) => {
      if (!esAdmin(rol) && !esVendedor(rol)) {
        setOrdenes([]);
        return;
      }
      setCargandoOrdenes(true);
      setErrorOrdenes("");
      try {
        const lista = await ordenesService.listar(opciones);
        if (!opciones.signal?.aborted) {
          setOrdenes(Array.isArray(lista) ? lista : []);
        }
      } catch (error) {
        if (!opciones.signal?.aborted) {
          setErrorOrdenes(mensajeDeError(error));
        }
      } finally {
        if (!opciones.signal?.aborted) {
          setCargandoOrdenes(false);
        }
      }
    },
    [rol],
  );

  const verDetalleOrden = useCallback(async (orderId) => {
    setErrorOrdenes("");
    try {
      const detalle = await ordenesService.obtenerPorId(orderId);
      setOrdenSeleccionada(detalle);
    } catch (error) {
      setErrorOrdenes(mensajeDeError(error));
    }
  }, []);

  const cargarMisOrdenes = useCallback(async () => {
    if (!usuario?.email || (!esCliente(rol) && !esAdmin(rol))) {
      setMisOrdenes([]);
      return;
    }
    try {
      let idPerfil = usuario.userId;
      if (!idPerfil) {
        const perfilUser = await usuariosService.buscarPorCorreo(usuario.email);
        idPerfil = perfilUser?.userId ?? null;
        if (idPerfil) {
          const actualizado = actualizarUsuarioLocal({
            userId: idPerfil,
            nombre:
              `${perfilUser.nombreCompleto ?? ""} ${perfilUser.apellidoCompleto ?? ""}`.trim() ||
              usuario.nombre,
          });
          if (actualizado) setUsuario(actualizado);
        }
      }
      if (!idPerfil) {
        setMisOrdenes([]);
        return;
      }
      const lista = await ordenesService.listarPorUsuario(idPerfil);
      setMisOrdenes(Array.isArray(lista) ? lista : []);
    } catch {
      setMisOrdenes([]);
    }
  }, [usuario, rol]);

  const cargarUsuariosAdmin = useCallback(
    async (opciones = {}) => {
      if (!esAdmin(rol)) {
        setUsuariosAdmin([]);
        setCuentasAdmin([]);
        return;
      }
      setCargandoUsuarios(true);
      setErrorUsuarios("");
      try {
        const [resUsers, resCuentas] = await Promise.allSettled([
          usuariosService.listar(opciones),
          authService.listarCuentas(opciones),
        ]);
        if (opciones.signal?.aborted) return;

        if (resUsers.status === "fulfilled") {
          setUsuariosAdmin(Array.isArray(resUsers.value) ? resUsers.value : []);
        } else {
          setErrorUsuarios(mensajeDeError(resUsers.reason));
        }

        if (resCuentas.status === "fulfilled") {
          setCuentasAdmin(
            Array.isArray(resCuentas.value) ? resCuentas.value : [],
          );
        }
      } finally {
        if (!opciones.signal?.aborted) {
          setCargandoUsuarios(false);
        }
      }
    },
    [rol],
  );

  // Carga automática de órdenes cuando ADMIN o VENDEDOR abren #ordenes o #admin.
  useEffect(() => {
    if (
      (pagina === "ordenes" || pagina === "admin") &&
      (esAdmin(rol) || esVendedor(rol))
    ) {
      const control = new AbortController();
      cargarOrdenes({ signal: control.signal });
      return () => control.abort();
    }
    return undefined;
  }, [pagina, rol, cargarOrdenes]);

  // Carga automática de usuarios/cuentas cuando ADMIN entra a #admin.
  useEffect(() => {
    if (pagina === "admin" && esAdmin(rol)) {
      const control = new AbortController();
      cargarUsuariosAdmin({ signal: control.signal });
      return () => control.abort();
    }
    return undefined;
  }, [pagina, rol, cargarUsuariosAdmin]);

  // Carga historial propio del cliente al entrar a #perfil.
  useEffect(() => {
    if (pagina === "perfil" && usuario && (esCliente(rol) || esAdmin(rol))) {
      cargarMisOrdenes();
    }
  }, [pagina, usuario, rol, cargarMisOrdenes]);

  useEffect(() => {
    const clave = claveCarritoDeUsuario(usuario);
    if (!clave) return;
    try {
      localStorage.setItem(clave, JSON.stringify(carrito));
    } catch {
      // ignore
    }
  }, [carrito, usuario]);

  useEffect(() => {
    try {
      if (pedidoFinal) {
        sessionStorage.setItem(PEDIDO_FINAL_KEY, JSON.stringify(pedidoFinal));
      } else {
        sessionStorage.removeItem(PEDIDO_FINAL_KEY);
      }
    } catch {
      // ignore
    }
  }, [pedidoFinal]);

  useEffect(() => {
    if (!mensaje) return undefined;
    const temporizador = window.setTimeout(() => setMensaje(""), 4500);
    return () => window.clearTimeout(temporizador);
  }, [mensaje]);

  const agregar = (producto) => {
    if (!puedeComprar) return false;
    if (producto.stock != null && producto.stock <= 0) {
      setMensaje("Este producto no tiene stock disponible.");
      return false;
    }

    const existe = carrito.find((item) => item.id === producto.id);
    const nuevaCantidad = (existe?.cantidad ?? 0) + 1;
    if (producto.stock != null && nuevaCantidad > producto.stock) {
      setMensaje(`Solo quedan ${producto.stock} unidades disponibles de ${producto.nombre}.`);
      return false;
    }

    setCarrito((actual) => {
      const enCarrito = actual.find((item) => item.id === producto.id);
      return enCarrito
        ? actual.map((item) =>
            item.id === producto.id
              ? {
                  ...item,
                  cantidad: item.cantidad + 1,
                  precio: producto.precio,
                  stock: producto.stock ?? item.stock,
                }
              : item,
          )
        : [...actual, { ...producto, cantidad: 1 }];
    });
    return true;
  };

  const cambiarCantidad = (id, cambio) => {
    const actualItem = carrito.find((item) => item.id === id);
    if (!actualItem) return;
    const nuevaCantidad = actualItem.cantidad + cambio;
    if (
      cambio > 0 &&
      actualItem.stock != null &&
      nuevaCantidad > actualItem.stock
    ) {
      setMensaje(
        `Solo quedan ${actualItem.stock} unidades disponibles de ${actualItem.nombre}.`,
      );
      return;
    }

    setCarrito((actual) =>
      actual
        .map((item) =>
          item.id === id
            ? { ...item, cantidad: item.cantidad + cambio }
            : item,
        )
        .filter((item) => item.cantidad > 0),
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((actual) => actual.filter((item) => item.id !== id));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    setCuponValidado(null);
  };

  const cantidadTotal = carrito.reduce(
    (suma, item) => suma + item.cantidad,
    0,
  );

  const total = carrito.reduce(
    (suma, item) => suma + item.precio * item.cantidad,
    0,
  );

  const productosTienda = useMemo(
    () => productos.filter((producto) => producto.estado !== false),
    [productos],
  );

  const categorias = [
    "Todas",
    ...new Set(productosTienda.map((producto) => producto.categoria)),
  ];

  const productosVisibles = useMemo(
    () =>
      productosTienda.filter(
        (producto) =>
          (categoria === "Todas" || producto.categoria === categoria) &&
          producto.nombre.toLowerCase().includes(busqueda.toLowerCase()),
      ),
    [productosTienda, categoria, busqueda],
  );

  // --- AUTENTICACIÓN REAL CON SPRING SECURITY + JWT ---
  const iniciarSesion = async (evento) => {
    evento.preventDefault();
    setErrorAuth("");
    setMensaje("");

    const formulario = evento.currentTarget;
    const form = new FormData(formulario);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      setErrorAuth("Ingresa correo electrónico y contraseña.");
      return false;
    }

    setAutenticando(true);
    try {
      const auth = await authService.login({ email, password });
      let sesion = guardarSesion(auth, { email });

      if (sesion && (esCliente(sesion.rol) || esAdmin(sesion.rol))) {
        try {
          const perfilUser = await usuariosService.buscarPorCorreo(email);
          if (perfilUser?.userId) {
            sesion = actualizarUsuarioLocal({
              userId: perfilUser.userId,
              nombre:
                perfilUser.nombreCompleto ||
                sesion.nombre,
              apellido: perfilUser.apellidoCompleto || "",
              rut: perfilUser.rut || "",
              telefono: perfilUser.telefono || "",
            });
          }
        } catch {
          // La cuenta de acceso puede aún no tener fila en user-mscv.
        }
      }

      // Aislamiento estricto del carrito por cuenta y rol.
      if (sesion && esCliente(sesion.rol)) {
        const claveCliente = claveCarritoDeUsuario(sesion);
        const carritoCliente = claveCliente
          ? leerStorage(localStorage, claveCliente, [])
          : [];
        const carritoInvitado = leerStorage(localStorage, CART_GUEST_KEY, []);
        const carritoFinal = fusionarCarritos(carritoCliente, carritoInvitado);
        setCarrito(carritoFinal);
        try {
          if (claveCliente) {
            localStorage.setItem(claveCliente, JSON.stringify(carritoFinal));
          }
          localStorage.removeItem(CART_GUEST_KEY);
        } catch {
          // ignore
        }
      } else {
        // ADMIN y VENDEDOR nunca heredan el carrito de un invitado ni de otro usuario.
        setCarrito([]);
        setCuponValidado(null);
      }

      setUsuario(sesion);
      formulario?.reset();
      const destino = sesion?.rol === ROLES.ADMIN ? "admin" : "catalogo";
      setPagina(destino);
      location.hash = destino;
      setMensaje(`Sesión iniciada como ${sesion?.email} (${sesion?.rol}).`);
      return true;
    } catch (error) {
      if (error.status === 401) {
        setErrorAuth("Correo o contraseña incorrectos. Revisa tus datos.");
      } else if (error.status === 403) {
        setErrorAuth(
          "Tu cuenta se encuentra desactivada. Contacta a un administrador.",
        );
      } else {
        setErrorAuth(mensajeDeError(error));
      }
      return false;
    } finally {
      setAutenticando(false);
    }
  };

  const registrar = async (evento) => {
    evento.preventDefault();
    setErrorAuth("");
    setMensaje("");

    const formulario = evento.currentTarget;
    const form = new FormData(formulario);
    const datos = {
      nombre: String(form.get("nombre") ?? "").trim(),
      apellido: String(form.get("apellido") ?? "").trim() || "Cliente",
      rut: String(form.get("rut") ?? "").trim(),
      telefono: String(form.get("telefono") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      clave: String(form.get("clave") ?? ""),
      confirmar: String(form.get("confirmar") ?? ""),
    };

    if (!validarRegistro(datos)) {
      setErrorAuth(
        "Revisa el correo y la contraseña: mínimo 6 caracteres y ambas claves iguales.",
      );
      return;
    }

    setAutenticando(true);
    try {
      const auth = await authService.register({
        email: datos.email,
        password: datos.clave,
      });

      let sesion = guardarSesion(auth, {
        nombre: datos.nombre,
        apellido: datos.apellido,
        rut: datos.rut,
        telefono: datos.telefono,
        email: datos.email,
      });

      if (datos.rut && datos.telefono) {
        try {
          const userCreado = await usuariosService.crear({
            rut: datos.rut,
            nombreCompleto: datos.nombre,
            apellidoCompleto: datos.apellido,
            correo: datos.email,
            telefono: datos.telefono,
            estado: true,
          });
          if (userCreado?.userId) {
            sesion = actualizarUsuarioLocal({ userId: userCreado.userId });
          }
        } catch {
          try {
            const existente = await usuariosService.buscarPorCorreo(
              datos.email,
            );
            if (existente?.userId) {
              sesion = actualizarUsuarioLocal({ userId: existente.userId });
            }
          } catch {
            // Se resolverá al momento de comprar.
          }
        }
      }

      const claveCliente = claveCarritoDeUsuario(sesion);
      const carritoInvitado = leerStorage(localStorage, CART_GUEST_KEY, []);
      setCarrito(carritoInvitado);
      try {
        if (claveCliente) {
          localStorage.setItem(claveCliente, JSON.stringify(carritoInvitado));
        }
        localStorage.removeItem(CART_GUEST_KEY);
      } catch {
        // ignore
      }

      setUsuario(sesion);
      formulario?.reset();
      setPagina("catalogo");
      location.hash = "catalogo";
      setMensaje("Registro completado con JWT. Bienvenido a GameHub Store.");
    } catch (error) {
      setErrorAuth(mensajeDeError(error));
    } finally {
      setAutenticando(false);
    }
  };

  const cerrarSesion = () => {
    limpiarSesion();
    setUsuario(null);
    setCarrito([]);
    setCuponValidado(null);
    setPedidoFinal(null);
    setOrdenes([]);
    setOrdenSeleccionada(null);
    setMisOrdenes([]);
    setUsuariosAdmin([]);
    setCuentasAdmin([]);
    setProductoEditando(null);
    setCategoriaEditando(null);
    setUsuarioEditando(null);
    try {
      localStorage.removeItem(CART_GUEST_KEY);
      localStorage.removeItem("gamehubCarrito");
    } catch {
      // ignore
    }
    setPagina("inicio");
    location.hash = "inicio";
    setMensaje("Sesión cerrada correctamente.");
  };

  // --- CRUD PRODUCTOS (SOLO ADMIN) ---
  const guardarProducto = async (evento) => {
    evento.preventDefault();
    if (!esAdmin(rol)) {
      setMensaje("No tienes permisos para administrar productos (403).");
      return;
    }

    const formulario = evento.currentTarget;
    const form = new FormData(formulario);
    const idCategory = Number(form.get("idCategory"));
    const precio = Number(form.get("precio"));
    const enOferta = form.get("enOferta") === "on";
    const precioOfertaRaw = String(form.get("precioOferta") ?? "").trim();
    const precioOferta = precioOfertaRaw ? Number(precioOfertaRaw) : null;

    if (!idCategory) {
      setMensaje("Selecciona una categoría válida.");
      return;
    }
    if (!Number.isFinite(precio) || precio <= 0) {
      setMensaje("El precio debe ser mayor a 0.");
      return;
    }
    if (precioOferta != null && precioOferta >= precio) {
      setMensaje("El precio de oferta debe ser menor al precio normal.");
      return;
    }

    const imagenUrl = String(form.get("imagenUrl") ?? "").trim();
    const marca =
      String(form.get("marca") ?? "").trim() ||
      productoEditando?.marca ||
      "GameHub";
    const modelo =
      String(form.get("modelo") ?? "").trim() ||
      productoEditando?.modelo ||
      "Standard";
    const descripcion =
      String(form.get("descripcion") ?? "").trim() ||
      "Equipamiento gamer seleccionado";

    const productoApi = {
      nombreProduct: String(form.get("nombre") ?? "").trim(),
      marca,
      modelo,
      precio,
      descripcion,
      idCategory,
      imagenUrl: imagenUrl || "/img/teclado.jpg",
      mesesGarantia: 12,
      estado: productoEditando ? Boolean(productoEditando.estado) : true,
      enOferta,
      precioOferta,
    };

    try {
      if (productoEditando) {
        await productosService.actualizar(productoEditando.id, productoApi);
      } else {
        await productosService.crear(productoApi);
      }

      await recargarCatalogo();
      setProductoEditando(null);
      formulario?.reset();
      setMensaje(
        productoEditando
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente.",
      );
    } catch (error) {
      setMensaje(mensajeDeError(error));
    }
  };

  const cambiarActivoProducto = async (producto) => {
    if (!esAdmin(rol)) {
      setMensaje("No tienes permisos para cambiar el estado del producto (403).");
      return;
    }
    try {
      const nuevoEstado = !producto.estado;
      await productosService.cambiarActivo(producto.id, nuevoEstado);
      await recargarCatalogo();
      setMensaje(
        `${producto.nombre} quedó ${nuevoEstado ? "activo en la tienda" : "inactivo"}.`,
      );
    } catch (error) {
      setMensaje(mensajeDeError(error));
    }
  };

  const eliminarProductoPorId = async (id) => {
    if (!esAdmin(rol)) {
      setMensaje("No tienes permisos para eliminar productos (403).");
      return;
    }
    try {
      await productosService.eliminar(id);
      await recargarCatalogo();
      setMensaje("Producto eliminado.");
    } catch (error) {
      setMensaje(mensajeDeError(error));
    }
  };

  // --- CRUD CATEGORÍAS (SOLO ADMIN) ---
  const guardarCategoria = async (evento) => {
    evento.preventDefault();
    if (!esAdmin(rol)) {
      setMensaje("No tienes permisos para administrar categorías (403).");
      return;
    }

    const formulario = evento.currentTarget;
    const form = new FormData(formulario);
    const nombreCategory = String(form.get("nombreCategory") ?? "").trim();
    const descripcionCategory = String(
      form.get("descripcionCategory") ?? "",
    ).trim();

    const repetida = categoriasApi.find(
      (c) =>
        c.idCategory !== categoriaEditando?.idCategory &&
        String(c.nombreCategory ?? "").toLowerCase() ===
          nombreCategory.toLowerCase(),
    );
    if (repetida) {
      setMensaje(`La categoría "${repetida.nombreCategory}" ya existe.`);
      return;
    }

    const payload = {
      nombreCategory,
      descripcionCategory,
      estado: "ACTIVO",
    };

    try {
      if (categoriaEditando) {
        await categoriasService.actualizar(
          categoriaEditando.idCategory,
          payload,
        );
      } else {
        await categoriasService.crear(payload);
      }
      await recargarCatalogo();
      setCategoriaEditando(null);
      formulario?.reset();
      setMensaje(
        categoriaEditando
          ? "Categoría actualizada correctamente."
          : "Categoría creada correctamente.",
      );
    } catch (error) {
      setMensaje(mensajeDeError(error));
    }
  };

  const desactivarCategoriaPorId = async (id) => {
    if (!esAdmin(rol)) {
      setMensaje("No tienes permisos para desactivar categorías (403).");
      return;
    }
    try {
      await categoriasService.desactivar(id);
      await recargarCatalogo();
      setMensaje("Categoría desactivada.");
    } catch (error) {
      setMensaje(mensajeDeError(error));
    }
  };

  // --- GESTIÓN DE ÓRDENES (ADMIN) ---
  const actualizarEstadoOrden = async (orderId, nuevoEstado) => {
    if (!esAdmin(rol)) {
      setMensaje("No tienes permisos para modificar órdenes (403).");
      return;
    }
    try {
      await ordenesService.cambiarEstado(orderId, nuevoEstado);
      await cargarOrdenes();
      if (ordenSeleccionada?.orderId === orderId) {
        await verDetalleOrden(orderId);
      }
      setMensaje(`Orden #${orderId} actualizada a ${nuevoEstado}.`);
    } catch (error) {
      setMensaje(mensajeDeError(error));
    }
  };

  const cancelarOrdenPorId = async (orderId) => {
    if (!esAdmin(rol)) {
      setMensaje("No tienes permisos para cancelar órdenes (403).");
      return;
    }
    try {
      await ordenesService.cancelar(orderId);
      await cargarOrdenes();
      if (ordenSeleccionada?.orderId === orderId) {
        await verDetalleOrden(orderId);
      }
      setMensaje(`Orden #${orderId} cancelada.`);
    } catch (error) {
      setMensaje(mensajeDeError(error));
    }
  };

  // --- GESTIÓN DE USUARIOS Y CUENTAS (SOLO ADMIN) ---
  const guardarUsuarioAdmin = async (evento) => {
    evento.preventDefault();
    if (!esAdmin(rol)) {
      setMensaje("No tienes permisos para gestionar usuarios (403).");
      return;
    }

    const formulario = evento.currentTarget;
    const form = new FormData(formulario);
    const payload = {
      rut: String(form.get("rut") ?? "").trim(),
      nombreCompleto: String(form.get("nombreCompleto") ?? "").trim(),
      apellidoCompleto: String(form.get("apellidoCompleto") ?? "").trim(),
      correo: String(form.get("correo") ?? "").trim(),
      telefono: String(form.get("telefono") ?? "").trim(),
      estado: usuarioEditando ? Boolean(usuarioEditando.estado) : true,
    };

    try {
      if (usuarioEditando) {
        await usuariosService.actualizar(usuarioEditando.userId, payload);
      } else {
        await usuariosService.crear(payload);
      }
      await cargarUsuariosAdmin();
      setUsuarioEditando(null);
      formulario?.reset();
      setMensaje(
        usuarioEditando
          ? "Usuario actualizado correctamente."
          : "Usuario creado correctamente.",
      );
    } catch (error) {
      setMensaje(mensajeDeError(error));
    }
  };

  const eliminarUsuarioPorId = async (userId) => {
    if (!esAdmin(rol)) return;
    try {
      await usuariosService.eliminar(userId);
      await cargarUsuariosAdmin();
      setMensaje("Usuario eliminado.");
    } catch (error) {
      setMensaje(mensajeDeError(error));
    }
  };

  const cambiarRolCuenta = async (cuenta, nuevoRol) => {
    if (!esAdmin(rol)) return;
    try {
      await authService.actualizarCuenta(cuenta.id, {
        email: cuenta.email,
        password: "",
        rol: nuevoRol,
        estado: cuenta.estado,
      });
      await cargarUsuariosAdmin();
      setMensaje(`Rol de ${cuenta.email} actualizado a ${nuevoRol}.`);
    } catch (error) {
      setMensaje(mensajeDeError(error));
    }
  };

  const cambiarActivoCuenta = async (cuenta) => {
    if (!esAdmin(rol)) return;
    try {
      await authService.cambiarActivoCuenta(cuenta.id, !cuenta.estado);
      await cargarUsuariosAdmin();
      setMensaje(`Estado de ${cuenta.email} actualizado.`);
    } catch (error) {
      setMensaje(mensajeDeError(error));
    }
  };

  // --- VALIDACIÓN DE CUPÓN Y CHECKOUT REAL CON POST /api/v1/orders ---
  const validarCuponCheckout = async (codigo) => {
    const limpio = String(codigo ?? "").trim();
    if (!limpio) {
      setCuponValidado(null);
      setMensaje("Escribe un código de cupón para validar.");
      return;
    }
    try {
      const resultado = await ordenesService.validarCupon(limpio, total);
      if (!resultado?.valido) {
        setCuponValidado(null);
        setMensaje(resultado?.mensaje || "El cupón no es válido.");
        return;
      }
      setCuponValidado({
        codigo: resultado.codigo || limpio,
        descuento: Number(resultado.descuento ?? 0),
        mensaje: resultado.mensaje || "Cupón aplicado correctamente.",
      });
      setMensaje(
        `Cupón ${resultado.codigo || limpio} aplicado: descuento de ${formatoPrecio(resultado.descuento)}.`,
      );
    } catch (error) {
      setCuponValidado(null);
      setMensaje(mensajeDeError(error));
    }
  };

  const finalizarCompra = async (evento) => {
    evento.preventDefault();
    setMensaje("");

    if (!carrito.length) {
      setMensaje("Agrega al menos un producto antes de continuar.");
      return;
    }

    if (!usuario) {
      setMensaje("Debes iniciar sesión como cliente para confirmar tu compra.");
      navegar("perfil");
      return;
    }

    if (!esCliente(rol)) {
      setMensaje("Solo el rol Cliente puede realizar compras en la tienda (403).");
      return;
    }

    const form = new FormData(evento.currentTarget);
    const clienteForm = Object.fromEntries(form.entries());
    const promotionCode = String(form.get("promotionCode") ?? "").trim();

    setProcesandoCompra(true);
    try {
      // 1. Pre-valida stock y cupón contra POST /api/v1/orders/carrito/validar (como en la referencia).
      try {
        const validacion = await ordenesService.validarCarrito({
          items: carrito.map((item) => ({
            idProducto: Number(item.id),
            cantidad: Number(item.cantidad),
          })),
          promotionCode: promotionCode || null,
        });
        if (validacion && validacion.valido === false) {
          const detalleFallo = (validacion.items || [])
            .filter((it) => !it.disponible)
            .map(
              (it) =>
                `${it.nombreProducto || `Producto #${it.idProducto}`}: ${it.observacion || `stock disponible ${it.stockDisponible}`}`,
            )
            .join(" | ");
          throw new Error(
            detalleFallo ||
              validacion.mensajeCupon ||
              "El stock o el cupón cambiaron. Revisa tu carrito antes de confirmar.",
          );
        }
      } catch (errValidacion) {
        if (errValidacion.status !== 404 && errValidacion.status !== 503 && errValidacion.status !== 0) {
          throw errValidacion;
        }
      }

      // 2. Asegura que el comprador exista en user-mscv para la validación Feign de order-mscv.
      let idUsuario = usuario.userId;
      if (!idUsuario) {
        try {
          const perfilExistente = await usuariosService.buscarPorCorreo(
            usuario.email,
          );
          idUsuario = perfilExistente?.userId;
        } catch {
          const nuevoPerfil = await usuariosService.crear({
            rut: String(clienteForm.rut || "").trim() || "11111111-1",
            nombreCompleto:
              String(clienteForm.nombre || "").trim() || usuario.nombre,
            apellidoCompleto:
              String(clienteForm.apellido || "").trim() || "Cliente",
            correo: usuario.email,
            telefono:
              String(clienteForm.telefono || "").trim() || "+56 912345678",
            estado: true,
          });
          idUsuario = nuevoPerfil?.userId;
        }
        if (idUsuario) {
          const actualizado = actualizarUsuarioLocal({ userId: idUsuario });
          if (actualizado) setUsuario(actualizado);
        }
      }

      if (!idUsuario) {
        throw new Error(
          "No se pudo resolver tu perfil de comprador en user-mscv.",
        );
      }

      // 3. Crea la orden real en order-mscv (Saga de inventario y promoción).
      const ordenCreada = await ordenesService.crear({
        idUsuario,
        promotionCode: promotionCode || null,
        details: carrito.map((item) => ({
          idProduct: Number(item.id),
          cantidad: Number(item.cantidad),
        })),
      });

      setPedidoFinal({
        numero: `GH-${ordenCreada.orderId}`,
        orderId: ordenCreada.orderId,
        estado: ordenCreada.estado,
        cliente: clienteForm,
        productos: carrito,
        subtotal: ordenCreada.subtotal ?? total,
        descuento: ordenCreada.descuento ?? 0,
        total: ordenCreada.total ?? total,
        fecha: ordenCreada.fechaCreacion || new Date().toLocaleString("es-CL"),
        exitoso: true,
      });

      setCarrito([]);
      setCuponValidado(null);
      recargarCatalogo().catch(() => {});
      navegar("resultado");
    } catch (error) {
      setMensaje(mensajeDeError(error));
    } finally {
      setProcesandoCompra(false);
    }
  };

  const enviarContacto = (evento) => {
    evento.preventDefault();
    evento.currentTarget.reset();
    setMensaje("¡Mensaje enviado! Nuestro equipo responderá a la brevedad.");
  };

  const abrirEdicion = (producto) => {
    setProductoEditando(producto);
    window.scrollTo(0, 0);
  };

  const verDetalle = async (producto) => {
    setProductoSeleccionado(producto);
    try {
      sessionStorage.setItem(DETALLE_ID_KEY, JSON.stringify(producto.id));
    } catch {
      // ignore
    }
    navegar("detalle");
    try {
      const [fresco, stockArr] = await Promise.all([
        productosService.obtenerPorId(producto.id),
        productosService.consultarStock([producto.id]).catch(() => []),
      ]);
      if (fresco) {
        const nombresCategoria = new Map(
          categoriasApi.map((item) => [
            Number(item.idCategory),
            item.nombreCategory,
          ]),
        );
        const stockPorId = new Map(
          (Array.isArray(stockArr) ? stockArr : []).map((s) => [
            Number(s.idProducto),
            Number(s.stockDisponible ?? 0),
          ]),
        );
        setProductoSeleccionado(
          adaptarProducto(fresco, nombresCategoria, stockPorId),
        );
      }
    } catch {
      // Mantiene la copia en memoria si el endpoint individual falla momentáneamente.
    }
  };

  const cancelarEdicion = () => setProductoEditando(null);

  const agregarDesdeModal = () => {
    if (modal && puedeComprar) agregar(modal);
    setModal(null);
  };

  return {
    pagina,
    rol,
    soloLecturaVendedor,
    puedeComprar,
    productos,
    productosTienda,
    cargandoProductos,
    errorProductos,
    categoriasApi,
    errorCategorias,
    ordenes,
    cargandoOrdenes,
    errorOrdenes,
    ordenSeleccionada,
    setOrdenSeleccionada,
    verDetalleOrden,
    cargarOrdenes,
    misOrdenes,
    usuariosAdmin,
    cuentasAdmin,
    cargandoUsuarios,
    errorUsuarios,
    carrito,
    usuario,
    productoSeleccionado,
    modal,
    setModal,
    mensaje,
    setMensaje,
    errorAuth,
    autenticando,
    busqueda,
    setBusqueda,
    categoria,
    setCategoria,
    productoEditando,
    categoriaEditando,
    setCategoriaEditando,
    usuarioEditando,
    setUsuarioEditando,
    pedidoFinal,
    cuponValidado,
    validarCuponCheckout,
    procesandoCompra,
    navegar,
    verDetalle,
    agregar,
    cambiarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    cantidadTotal,
    total,
    categorias,
    productosVisibles,
    iniciarSesion,
    registrar,
    cerrarSesion,
    guardarProducto,
    cambiarActivoProducto,
    eliminarProductoPorId,
    abrirEdicion,
    cancelarEdicion,
    guardarCategoria,
    desactivarCategoriaPorId,
    actualizarEstadoOrden,
    cancelarOrdenPorId,
    guardarUsuarioAdmin,
    eliminarUsuarioPorId,
    cambiarRolCuenta,
    cambiarActivoCuenta,
    finalizarCompra,
    enviarContacto,
    agregarDesdeModal,
  };
}
