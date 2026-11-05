import { useEffect, useMemo, useState } from "react";
import { productosService } from "../services/productos.js";
import { categoriasService } from "../services/categorias.js";
import { validarRegistro } from "../logica/validaciones.js";

const leerLocal = (clave, inicial) => {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? inicial;
  } catch {
    return inicial;
  }
};

export const formatoPrecio = (n) =>
  "$" + Number(n).toLocaleString("es-CL");

function adaptarProducto(producto, nombresCategoria) {
  return {
    id: producto.idProduct,
    nombre: producto.nombreProduct,
    categoria:
      nombresCategoria.get(producto.idCategory) ??
      `Categoría ${producto.idCategory}`,
    precio: Number(producto.precio),
    descripcion: producto.descripcion ?? "",
    imagen: producto.imagenUrl || "/img/teclado.jpg",
    oferta: false,
    caracteristicas: [producto.marca, producto.modelo].filter(Boolean),

    // Conservamos estos campos para usarlos al integrar el formulario Admin.
    idCategory: producto.idCategory,
    marca: producto.marca,
    modelo: producto.modelo,
    estado: producto.estado,
  };
}

function mensajeDeError(error) {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

export function useGameHub() {
  const [pagina, setPagina] = useState(() => {
    const ruta = location.hash.slice(1) || "inicio";
    return ruta === "categorias" ? "catalogo" : ruta;
  });

  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState("");
  const [categoriasApi, setCategoriasApi] = useState([]);
  const [errorCategorias, setErrorCategorias] = useState("");

  const [carrito, setCarrito] = useState(() =>
    leerLocal("gamehubCarrito", []),
  );
  const [usuario, setUsuario] = useState(() =>
    leerLocal("gamehubUsuario", null),
  );
  const [modal, setModal] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [productoEditando, setProductoEditando] = useState(null);
  const [pedidoFinal, setPedidoFinal] = useState(() =>
    leerLocal("gamehubPedidoFinal", null),
  );
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    const control = new AbortController();
    const opciones = { signal: control.signal };

    async function cargarDatos() {
      const [resultadoProductos, resultadoCategorias] =
        await Promise.allSettled([
          productosService.listar(opciones),
          categoriasService.listar(opciones),
        ]);

      if (control.signal.aborted) return;

      if (resultadoProductos.status === "rejected") {
        setErrorProductos(mensajeDeError(resultadoProductos.reason));
        setCargandoProductos(false);
        return;
      }

      const listaCategorias =
        resultadoCategorias.status === "fulfilled"
          ? resultadoCategorias.value
          : [];

      if (resultadoCategorias.status === "rejected") {
        setErrorCategorias(mensajeDeError(resultadoCategorias.reason));
      }

      setCategoriasApi(listaCategorias);

      const nombresCategoria = new Map(
        listaCategorias.map((item) => [
          item.idCategory,
          item.nombreCategory,
        ]),
      );

      setProductos(
        resultadoProductos.value.map((producto) =>
          adaptarProducto(producto, nombresCategoria),
        ),
      );
      setCargandoProductos(false);
    }

    cargarDatos().catch((error) => {
      if (!control.signal.aborted) {
        setErrorProductos(mensajeDeError(error));
        setCargandoProductos(false);
      }
    });

    return () => control.abort();
  }, []);

  // Se conserva localStorage para estos datos mientras no estén conectados al backend.
  useEffect(() => {
    localStorage.setItem("gamehubCarrito", JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    localStorage.setItem("gamehubUsuario", JSON.stringify(usuario));
  }, [usuario]);

  useEffect(() => {
    localStorage.setItem("gamehubPedidoFinal", JSON.stringify(pedidoFinal));
  }, [pedidoFinal]);

  useEffect(() => {
    if (!mensaje) return undefined;

    const temporizador = window.setTimeout(() => setMensaje(""), 3000);
    return () => window.clearTimeout(temporizador);
  }, [mensaje]);

  useEffect(() => {
    const sincronizar = () => {
      const ruta = location.hash.slice(1) || "inicio";
      setPagina(ruta === "categorias" ? "catalogo" : ruta);
    };

    window.addEventListener("hashchange", sincronizar);
    return () => window.removeEventListener("hashchange", sincronizar);
  }, []);

  const navegar = (nuevaPagina) => {
    setPagina(nuevaPagina);
    setMensaje("");
    location.hash = nuevaPagina;
    window.scrollTo(0, 0);
  };

  const agregar = (producto) => {
    setCarrito((actual) => {
      const existe = actual.find((item) => item.id === producto.id);

      return existe
        ? actual.map((item) =>
            item.id === producto.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item,
          )
        : [...actual, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, cambio) => {
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

  const vaciarCarrito = () => setCarrito([]);

  const cantidadTotal = carrito.reduce(
    (suma, item) => suma + item.cantidad,
    0,
  );

  const total = carrito.reduce(
    (suma, item) => suma + item.precio * item.cantidad,
    0,
  );

  const categorias = [
    "Todas",
    ...new Set(productos.map((producto) => producto.categoria)),
  ];

  const productosVisibles = useMemo(
    () =>
      productos.filter(
        (producto) =>
          (categoria === "Todas" || producto.categoria === categoria) &&
          producto.nombre.toLowerCase().includes(busqueda.toLowerCase()),
      ),
    [productos, categoria, busqueda],
  );

  // Estos manejadores aún usan la lógica local; se conectarán al API después.
 const guardarProducto = async (evento) => {
  evento.preventDefault();

  const formulario = evento.currentTarget;
  const form = new FormData(formulario);
  const idCategory = Number(form.get("idCategory"));

  if (!idCategory) {
    setMensaje("Selecciona una categoría válida.");
    return;
  }

  const productoApi = {
    nombreProduct: String(form.get("nombre")).trim(),
    precio: Number(form.get("precio")),
    descripcion: String(form.get("descripcion")).trim(),
    idCategory,
    marca: productoEditando?.marca ?? "",
    modelo: productoEditando?.modelo ?? "",
    estado: productoEditando?.estado ?? "ACTIVO",
  };

  try {
    if (productoEditando) {
      await productosService.actualizar(productoEditando.id, productoApi);
    } else {
      await productosService.crear(productoApi);
    }

    // Vuelve a consultar al backend para que la pantalla muestre
    // los datos realmente guardados en la base de datos.
    const productosApi = await productosService.listar();
    const nombresCategoria = new Map(
      categoriasApi.map((item) => [
        Number(item.idCategory),
        item.nombreCategory,
      ]),
    );

    setProductos(
      productosApi.map((producto) =>
        adaptarProducto(producto, nombresCategoria),
      ),
    );

    setProductoEditando(null);
    formulario.reset();
    setMensaje(
      productoEditando
        ? "Producto actualizado correctamente."
        : "Producto creado correctamente.",
    );
  } catch (error) {
    setMensaje(error.message || "No se pudo guardar el producto.");
  }
};

const eliminarProductoPorId = async (id) => {
  try {
    await productosService.eliminar(id);

    const productosApi = await productosService.listar();
    const nombresCategoria = new Map(
      categoriasApi.map((item) => [
        Number(item.idCategory),
        item.nombreCategory,
      ]),
    );

    setProductos(
      productosApi.map((producto) =>
        adaptarProducto(producto, nombresCategoria),
      ),
    );

    setMensaje("Producto eliminado.");
  } catch (error) {
    setMensaje(error.message || "No se pudo eliminar el producto.");
  }
};

  const registrar = (evento) => {
    evento.preventDefault();

    const form = new FormData(evento.currentTarget);
    const datos = {
      nombre: String(form.get("nombre")).trim(),
      email: String(form.get("email")).trim(),
      clave: String(form.get("clave")),
      confirmar: String(form.get("confirmar")),
    };

    if (!validarRegistro(datos)) {
      setMensaje(
        "Revisa el correo y la contraseña: mínimo 6 caracteres y ambas claves iguales.",
      );
      return;
    }

    setUsuario({ nombre: datos.nombre, email: datos.email });
    evento.currentTarget.reset();
    setMensaje("Registro completado. Ya puedes ver tu perfil.");
  };

  const finalizarCompra = (evento) => {
    evento.preventDefault();

    if (!carrito.length) {
      setMensaje("Agrega al menos un producto antes de continuar.");
      return;
    }

    const form = new FormData(evento.currentTarget);
    const pedido = {
      numero: `GH-${Date.now().toString().slice(-7)}`,
      cliente: Object.fromEntries(form.entries()),
      productos: carrito,
      total,
      fecha: new Date().toLocaleString("es-CL"),
    };

    const exitoso = form.get("resultadoPago") !== "fallido";

    setPedidoFinal({ ...pedido, exitoso });
    if (exitoso) setCarrito([]);
    navegar("resultado");
  };

  const enviarContacto = (evento) => {
    evento.preventDefault();
    evento.currentTarget.reset();
    setMensaje("¡Mensaje validado! Esta demo no envía correos reales.");
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setMensaje("Se cerró el perfil local.");
  };


  const abrirEdicion = (producto) => {
    setProductoEditando(producto);
    window.scrollTo(0, 0);
  };

  const verDetalle = (producto) => {
    setProductoSeleccionado(producto);
    navegar("detalle");
  };

  const cancelarEdicion = () => setProductoEditando(null);

  const agregarDesdeModal = () => {
    if (modal) agregar(modal);
    setModal(null);
  };

  return {
    pagina,
    productos,
    cargandoProductos,
    errorProductos,
    categoriasApi,
    errorCategorias,
    carrito,
    usuario,
    productoSeleccionado,
    modal,
    setModal,
    mensaje,
    setMensaje,
    busqueda,
    setBusqueda,
    categoria,
    setCategoria,
    productoEditando,
    pedidoFinal,
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
    guardarProducto,
    registrar,
    finalizarCompra,
    enviarContacto,
    cerrarSesion,
    eliminarProductoPorId,
    abrirEdicion,
    cancelarEdicion,
    agregarDesdeModal,
  };
}