import { useRef } from "react";
import "./Perfil.css";
import { etiquetaRol, esCliente } from "../../logica/roles.js";

export default function Perfil({
  usuario,
  misOrdenes = [],
  simularPagoOrden,
  pagandoOrdenId = null,
  iniciarSesion,
  cerrarSesion,
  navegar,
  mensaje,
  errorAuth,
  autenticando = false,
  formatoPrecio,
}) {
  const formRef = useRef(null);

  const manejarLogin = async (evento) => {
    const ok = await iniciarSesion(evento);
    if (ok) {
      formRef.current?.reset();
    }
  };

  if (!usuario) {
    return (
      <section className="form-card profile">
        <div className="avatar">GH</div>
        <h1>Iniciar sesión</h1>
        <p className="muted">
          Autentícate con tu cuenta de GameHub Store (JWT).
        </p>

        <form ref={formRef} onSubmit={manejarLogin}>
          <label>
            Correo electrónico *
            <input
              name="email"
              type="email"
              required
              placeholder="usuario@gamehub.com"
            />
          </label>
          <label>
            Contraseña *
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
            />
          </label>
          <button className="btn full" type="submit" disabled={autenticando}>
            {autenticando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <button
          className="btn secondary full"
          type="button"
          onClick={() => navegar("registro")}
        >
          Crear cuenta nueva
        </button>

        {errorAuth && (
          <p className="muted" role="alert">
            {errorAuth}
          </p>
        )}
        {mensaje && (
          <p className="success" role="status">
            {mensaje}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="form-card profile">
      <div className="avatar">GH</div>
      <h1>Mi perfil</h1>
      <h2>{usuario.nombre}</h2>
      <p className="muted">{usuario.email}</p>
      <span className="pill">Rol: {etiquetaRol(usuario.rol)}</span>

      {esCliente(usuario.rol) && misOrdenes.length > 0 && (
        <div className="table-wrap">
          <h3>Mis compras recientes</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Orden #</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {misOrdenes.map((orden) => {
                const pendiente =
                  String(orden.estado ?? "").toUpperCase() === "PENDIENTE_PAGO";
                const pagando =
                  pagandoOrdenId != null &&
                  Number(pagandoOrdenId) === Number(orden.orderId);
                return (
                  <tr key={orden.orderId}>
                    <td>#{orden.orderId}</td>
                    <td>{orden.fecha ?? "—"}</td>
                    <td>
                      <span className="pill">{orden.estado}</span>
                    </td>
                    <td>{formatoPrecio(orden.total)}</td>
                    <td>
                      {pendiente && simularPagoOrden ? (
                        <button
                          type="button"
                          className="btn"
                          disabled={pagando}
                          onClick={() =>
                            simularPagoOrden(orden.orderId, {
                              monto: orden.total,
                            })
                          }
                        >
                          {pagando ? "Pagando..." : "Simular pago"}
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <button
        className="btn secondary full"
        type="button"
        onClick={cerrarSesion}
      >
        Cerrar sesión
      </button>

      {mensaje && (
        <p className="success" role="status">
          {mensaje}
        </p>
      )}
    </section>
  );
}
