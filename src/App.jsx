import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  productosIniciales,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "./data/productos.js";

const precio = (n) => "$" + Number(n).toLocaleString("es-CL");

// Leemos lo guardado con cuidado: si el navegador tiene datos dañados, la tienda igual abre.
function leerLocal(clave, valorInicial) {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? valorInicial;
  } catch {
    return valorInicial;
  }
}

function App() {
  const [pagina, setPagina] = useState(
    () => location.hash.slice(1) || "inicio",
  );
  const [productos, setProductos] = useState(() =>
    leerLocal("gamehubProductos", productosIniciales),
  );
  const [carrito, setCarrito] = useState(() => leerLocal("gamehubCarrito", []));
  const [usuario, setUsuario] = useState(() =>
    leerLocal("gamehubUsuario", null),
  );
  const [modal, setModal] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [productoEditando, setProductoEditando] = useState(null);
  const [datosEntrega, setDatosEntrega] = useState({
    nombre: "",
    apellido: "",
    email: "",
    calle: "",
    region: "",
    comuna: "",
    entrega: "Estándar",
    indicaciones: "",
  });
  const [pedidoFinal, setPedidoFinal] = useState(null);

  // Conservamos la información de demostración entre recargas en este navegador.
  useEffect(() => {
    localStorage.setItem("gamehubProductos", JSON.stringify(productos));
  }, [productos]);
  useEffect(() => {
    localStorage.setItem("gamehubCarrito", JSON.stringify(carrito));
  }, [carrito]);
  useEffect(() => {
    localStorage.setItem("gamehubUsuario", JSON.stringify(usuario));
  }, [usuario]);

  // Los avisos son útiles, pero no deben quedarse pegados en pantalla.
  // Cada mensaje desaparece solo después de unos segundos.
  useEffect(() => {
    if (!mensaje) return undefined;
    const temporizador = window.setTimeout(() => setMensaje(""), 3000);
    return () => window.clearTimeout(temporizador);
  }, [mensaje]);
  useEffect(() => {
    const sincronizar = () => setPagina(location.hash.slice(1) || "inicio");
    addEventListener("hashchange", sincronizar);
    return () => removeEventListener("hashchange", sincronizar);
  }, []);

  const navegar = (nuevaPagina) => {
    setPagina(nuevaPagina);
    setMensaje("");
    location.hash = nuevaPagina;
    window.scrollTo(0, 0);
  };
  // Actualizamos el carrito creando un array nuevo, que es la forma recomendada en React.
  const agregar = (producto) =>
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
  const cambiarCantidad = (id, cambio) =>
    setCarrito((actual) =>
      actual
        .map((item) =>
          item.id === id ? { ...item, cantidad: item.cantidad + cambio } : item,
        )
        .filter((item) => item.cantidad > 0),
    );
  const cantidadTotal = carrito.reduce((suma, item) => suma + item.cantidad, 0);
  const total = carrito.reduce(
    (suma, item) => suma + item.precio * item.cantidad,
    0,
  );
  const categorias = ["Todas", ...new Set(productos.map((p) => p.categoria))];
  const productosVisibles = useMemo(
    () =>
      productos.filter(
        (p) =>
          (categoria === "Todas" || p.categoria === categoria) &&
          p.nombre.toLowerCase().includes(busqueda.toLowerCase()),
      ),
    [productos, categoria, busqueda],
  );

  const guardarProducto = (evento) => {
    evento.preventDefault();
    const form = new FormData(evento.currentTarget);
    const nuevo = {
      id:
        productoEditando?.id ?? Math.max(0, ...productos.map((p) => p.id)) + 1,
      nombre: String(form.get("nombre")).trim(),
      categoria: String(form.get("categoria")).trim(),
      precio: Number(form.get("precio")),
      descripcion: String(form.get("descripcion")).trim(),
      imagen: productoEditando?.imagen || "/src/assets/img/teclado.jpg",
      oferta: form.get("oferta") === "on",
      caracteristicas: productoEditando?.caracteristicas || [],
    };
    try {
      setProductos(
        productoEditando
          ? actualizarProducto(productos, productoEditando.id, nuevo)
          : crearProducto(productos, nuevo),
      );
      setProductoEditando(null);
      setMensaje("Producto guardado correctamente.");
      evento.currentTarget.reset();
    } catch (error) {
      setMensaje(error.message || "No se pudo guardar el producto.");
    }
  };

  const registrar = (evento) => {
    evento.preventDefault();
    const form = new FormData(evento.currentTarget);
    const nombre = String(form.get("nombre")).trim();
    const email = String(form.get("email")).trim();
    const clave = String(form.get("clave"));
    if (
      !nombre ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      clave.length < 6 ||
      clave !== form.get("confirmar")
    ) {
      setMensaje(
        "Revisa el correo y la contraseña: mínimo 6 caracteres y ambas claves iguales.",
      );
      return;
    }
    // Solo guardamos el nombre y correo de esta demostración; nunca almacenamos la contraseña.
    setUsuario({ nombre, email });
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
    // La evaluación pide mostrar resultados de compra; este flujo es simulado y no cobra dinero.
    if (form.get("resultadoPago") === "fallido") {
      setPedidoFinal({ ...pedido, exitoso: false });
      navegar("resultado");
      return;
    }
    setPedidoFinal({ ...pedido, exitoso: true });
    setCarrito([]);
    navegar("resultado");
  };

  const encabezado = (
    <header>
      <a className="logo" href="#inicio">
        <span>GAME</span>
        <b>HUB</b>
        <small>STORE</small>
      </a>
      <nav aria-label="Navegación principal">
        {[
          ["inicio", "Inicio"],
          ["catalogo", "Catálogo"],
          ["categorias", "Categorías"],
          ["ofertas", "Ofertas"],
          ["carrito", "Carrito"],
          ["perfil", "Perfil"],
          ["contacto", "Contacto"],
          ["admin", "Administración"],
        ].map(([ruta, texto]) => (
          <a
            key={ruta}
            className={pagina === ruta ? "active" : ""}
            href={`#${ruta}`}
          >
            {texto}
          </a>
        ))}
      </nav>
    </header>
  );
  const pie = (
    <footer>
      <strong>GameHub Store</strong> © 2026 · Proyecto académico de frontend
    </footer>
  );
  const tarjetas = (lista) => (
    <div className="grid">
      {lista.map((p) => (
        <article className="product" key={p.id}>
          <img src={p.imagen} alt={p.nombre} />
          {p.oferta && <span className="pill">Oferta</span>}
          <span className="eyebrow">{p.categoria}</span>
          <h3>{p.nombre}</h3>
          <p className="muted">{p.descripcion}</p>
          <strong className="price">{precio(p.precio)}</strong>
          <button className="btn secondary full" onClick={() => setModal(p)}>
            Ver características
          </button>
          <button
            className="btn full"
            onClick={() => {
              agregar(p);
              setMensaje(`${p.nombre} se agregó al carrito.`);
            }}
          >
            Agregar al carrito
          </button>
        </article>
      ))}
    </div>
  );

  let contenido;
  if (pagina === "catalogo" || pagina === "categorias") {
    contenido = (
      <>
        <p className="eyebrow center">EQUIPAMIENTO SELECCIONADO</p>
        <h1 className="section-title">
          {pagina === "categorias"
            ? "Productos por categoría"
            : "Catálogo gamer"}
        </h1>
        <div className="filters">
          <input
            aria-label="Buscar productos"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select
            aria-label="Filtrar por categoría"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            {categorias.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        {tarjetas(productosVisibles)}
      </>
    );
  } else if (pagina === "ofertas") {
    contenido = (
      <>
        <p className="eyebrow center">OPORTUNIDADES GAMER</p>
        <h1 className="section-title">Productos en oferta</h1>
        {tarjetas(productos.filter((p) => p.oferta))}
      </>
    );
  } else if (pagina === "carrito") {
    contenido = (
      <>
        <h1 className="section-title">Mi carrito</h1>
        {!carrito.length ? (
          <div className="notice">
            <h3>Tu carrito está vacío</h3>
            <p className="muted">
              Explora el catálogo y agrega tus productos favoritos.
            </p>
            <button className="btn" onClick={() => navegar("catalogo")}>
              Ir al catálogo
            </button>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {carrito.map((p) => (
                <article className="cart-item" key={p.id}>
                  <img src={p.imagen} alt={p.nombre} />
                  <div>
                    <h3>{p.nombre}</h3>
                    <p className="muted">{precio(p.precio)} por unidad</p>
                  </div>
                  <div className="qty">
                    <button
                      aria-label={`Restar ${p.nombre}`}
                      onClick={() => cambiarCantidad(p.id, -1)}
                    >
                      −
                    </button>
                    <span>{p.cantidad}</span>
                    <button
                      aria-label={`Sumar ${p.nombre}`}
                      onClick={() => cambiarCantidad(p.id, 1)}
                    >
                      +
                    </button>
                  </div>
                  <strong>{precio(p.precio * p.cantidad)}</strong>
                  <button
                    className="remove"
                    onClick={() =>
                      setCarrito((actual) =>
                        actual.filter((i) => i.id !== p.id),
                      )
                    }
                  >
                    Eliminar
                  </button>
                </article>
              ))}
            </div>
            <div className="summary">
              <h2>Total: {precio(total)}</h2>
              <button className="btn" onClick={() => navegar("checkout")}>
                Continuar con la compra
              </button>
            </div>
          </>
        )}
        {mensaje && <p className="success">{mensaje}</p>}
      </>
    );
  } else if (pagina === "checkout") {
    contenido = (
      <section className="form-card">
        <h1>Finalizar compra</h1>
        <p className="muted">
          Total del pedido: <strong>{precio(total)}</strong>. Completa los datos
          de entrega.
        </p>
        {!carrito.length && (
          <p className="success">
            Tu carrito está vacío.{" "}
            <button className="linkbtn" onClick={() => navegar("catalogo")}>
              Volver al catálogo
            </button>
          </p>
        )}
        <form onSubmit={finalizarCompra}>
          <div className="checkout-grid">
            {[
              ["nombre", "Nombre", true],
              ["apellido", "Apellido", true],
              ["email", "Correo electrónico", true],
              ["calle", "Dirección de entrega", true],
              ["region", "Región", true],
              ["comuna", "Comuna", true],
            ].map(([name, label, required]) => (
              <label key={name}>
                {label} *
                <input
                  name={name}
                  type={name === "email" ? "email" : "text"}
                  required={required}
                  defaultValue={
                    usuario && name === "nombre"
                      ? usuario.nombre
                      : usuario && name === "email"
                        ? usuario.email
                        : ""
                  }
                />
              </label>
            ))}
            <label>
              Tipo de entrega
              <select name="entrega">
                <option>Estándar</option>
                <option>Express</option>
                <option>Retiro en tienda</option>
              </select>
            </label>
            <label>
              Indicaciones (opcional)
              <textarea name="indicaciones" rows="2" />
            </label>
            <label>
              Resultado de pago para probar el flujo
              <select name="resultadoPago">
                <option value="exitoso">Simular pago exitoso</option>
                <option value="fallido">Simular pago fallido</option>
              </select>
            </label>
          </div>
          <button className="btn full" disabled={!carrito.length}>
            Confirmar pedido de demostración
          </button>
        </form>
        <p className="muted">
          Esta pantalla no procesa pagos reales ni envía datos a un servidor.
        </p>
      </section>
    );
  } else if (pagina === "resultado") {
    contenido = (
      <section className="form-card">
        <h1>
          {pedidoFinal?.exitoso
            ? "✓ Compra realizada"
            : "✕ No se pudo realizar el pago"}
        </h1>
        {pedidoFinal ? (
          <>
            <p>Pedido: {pedidoFinal.numero}</p>
            <p>
              Cliente: {pedidoFinal.cliente.nombre}{" "}
              {pedidoFinal.cliente.apellido}
            </p>
            <p>
              Dirección: {pedidoFinal.cliente.calle},{" "}
              {pedidoFinal.cliente.comuna}, {pedidoFinal.cliente.region}
            </p>
            <p>Entrega: {pedidoFinal.cliente.entrega}</p>
            <h2>Total: {precio(pedidoFinal.total)}</h2>
            <h3>Resumen de productos</h3>
            {pedidoFinal.productos.map((p) => (
              <p key={p.id}>
                {p.nombre} × {p.cantidad} — {precio(p.precio * p.cantidad)}
              </p>
            ))}
          </>
        ) : (
          <p>No hay un pedido reciente para mostrar.</p>
        )}
        {!pedidoFinal?.exitoso && (
          <button className="btn" onClick={() => navegar("checkout")}>
            Volver a intentar
          </button>
        )}
        <button
          className="btn secondary full"
          onClick={() => navegar("catalogo")}
        >
          Seguir comprando
        </button>
      </section>
    );
  } else if (pagina === "admin") {
    contenido = (
      <section>
        <h1 className="section-title">Administración de productos</h1>
        <p className="muted center">
          Panel académico: crea, edita y elimina productos del catálogo local.
        </p>
        <form className="form-card" onSubmit={guardarProducto}>
          <h2>{productoEditando ? "Editar producto" : "Nuevo producto"}</h2>
          <label>
            Nombre *
            <input
              name="nombre"
              required
              defaultValue={productoEditando?.nombre || ""}
            />
          </label>
          <label>
            Categoría *
            <input
              name="categoria"
              required
              defaultValue={productoEditando?.categoria || ""}
            />
          </label>
          <label>
            Precio (CLP) *
            <input
              name="precio"
              type="number"
              min="0"
              required
              defaultValue={productoEditando?.precio ?? ""}
            />
          </label>
          <label>
            Descripción
            <input
              name="descripcion"
              defaultValue={productoEditando?.descripcion || ""}
            />
          </label>
          <label className="check-label">
            <input
              name="oferta"
              type="checkbox"
              defaultChecked={productoEditando?.oferta || false}
            />{" "}
            Mostrar como oferta
          </label>
          <button className="btn full">
            {productoEditando ? "Guardar cambios" : "Crear producto"}
          </button>
          {productoEditando && (
            <button
              type="button"
              className="btn secondary full"
              onClick={() => setProductoEditando(null)}
            >
              Cancelar edición
            </button>
          )}
          {mensaje && <p className="success">{mensaje}</p>}
        </form>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.categoria}</td>
                  <td>{precio(p.precio)}</td>
                  <td>
                    <button
                      className="btn secondary"
                      onClick={() => {
                        setProductoEditando(p);
                        window.scrollTo(0, 0);
                      }}
                    >
                      Editar
                    </button>{" "}
                    <button
                      className="btn danger"
                      onClick={() => {
                        setProductos((actuales) =>
                          eliminarProducto(actuales, p.id),
                        );
                        setMensaje("Producto eliminado.");
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  } else if (pagina === "registro") {
    contenido = (
      <section className="form-card">
        <h1>Crear cuenta</h1>
        <form onSubmit={registrar}>
          <label>
            Nombre completo *
            <input name="nombre" required placeholder="Tu nombre" />
          </label>
          <label>
            Correo electrónico *
            <input
              name="email"
              type="email"
              required
              placeholder="usuario@correo.com"
            />
          </label>
          <label>
            Contraseña *
            <input name="clave" type="password" minLength="6" required />
          </label>
          <label>
            Confirmar contraseña *
            <input name="confirmar" type="password" required />
          </label>
          <button className="btn full">Registrarme</button>
        </form>
        {mensaje && <p className="success">{mensaje}</p>}
      </section>
    );
  } else if (pagina === "perfil") {
    contenido = (
      <section className="form-card profile">
        <div className="avatar">GH</div>
        <h1>Mi perfil</h1>
        {usuario ? (
          <>
            <h2>{usuario.nombre}</h2>
            <p className="muted">{usuario.email}</p>
            <span className="pill">Miembro GameHub</span>
            <button
              className="btn secondary full"
              onClick={() => {
                setUsuario(null);
                setMensaje("Se cerró el perfil local.");
              }}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <p className="muted">Aún no tienes una cuenta registrada.</p>
            <button className="btn" onClick={() => navegar("registro")}>
              Crear cuenta
            </button>
          </>
        )}
        {mensaje && <p className="success">{mensaje}</p>}
      </section>
    );
  } else if (pagina === "contacto") {
    contenido = (
      <section className="form-card">
        <h1>Contacto y soporte</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.currentTarget.reset();
            setMensaje("¡Mensaje validado! Esta demo no envía correos reales.");
          }}
        >
          <label>
            Nombre *<input required name="nombre" />
          </label>
          <label>
            Correo electrónico *<input required type="email" name="email" />
          </label>
          <label>
            Mensaje *<textarea required name="mensaje" rows="4" />
          </label>
          <button className="btn full">Enviar mensaje</button>
        </form>
        {mensaje && <p className="success">{mensaje}</p>}
      </section>
    );
  } else {
    contenido = (
      <>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">HARDWARE · CONSOLAS · PERIFÉRICOS</p>
            <h1>
              Juega sin <span>límites.</span>
            </h1>
            <p className="hero-desc">
              Arma el setup que imaginas con tecnología seleccionada para rendir
              al máximo.
            </p>
            <div className="actions">
              <button className="btn" onClick={() => navegar("catalogo")}>
                Explorar catálogo →
              </button>
              <button
                className="btn secondary"
                onClick={() => navegar("perfil")}
              >
                Mi perfil / Crear cuenta
              </button>
            </div>
            <div className="stats">
              <div>
                <b>{productos.length}</b>
                <small>productos en catálogo</small>
              </div>
              <div>
                <b>24/7</b>
                <small>tienda de demostración</small>
              </div>
              <div>
                <b>100%</b>
                <small>frontend académico</small>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="orb" />
            <div className="hero-panel">
              <span>GH</span>
              <small>PERFORMANCE UNLOCKED</small>
            </div>
          </div>
        </section>
        <p className="eyebrow center">SELECCIÓN DESTACADA</p>
        <h2 className="section-title">Potencia tu próximo nivel</h2>
        {tarjetas(productos.slice(0, 3))}
      </>
    );
  }

  return (
    <>
      {encabezado}
      <main className="container-fluid">{contenido}</main>
      {pie}
      <a
        href="#carrito"
        className="floating-cart"
        aria-label="Ver carrito de compras"
      >
        🛒 <span>{cantidadTotal}</span>
      </a>
      {modal && (
        <div
          className="modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            className="modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal"
          >
            <button
              className="close"
              onClick={() => setModal(null)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <h2 id="titulo-modal">{modal.nombre}</h2>
            <ul>
              {(modal.caracteristicas || []).map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <button
              className="btn full"
              onClick={() => {
                agregar(modal);
                setModal(null);
              }}
            >
              Agregar al carrito
            </button>
          </section>
        </div>
      )}
    </>
  );
}

export default App;
