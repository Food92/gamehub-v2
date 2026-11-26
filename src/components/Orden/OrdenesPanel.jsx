import { useState } from "react";
import { formatoPrecio } from "../../hooks/useGameHub.js";

const ESTADOS_FILTRO = [
  "TODAS",
  "PENDIENTE_PAGO",
  "PAGADA",
  "EN_DESPACHO",
  "ENTREGADA",
  "CANCELADA",
];

/**
 * Vista de Órdenes (lista y detalle).
 * - VENDEDOR: solo lectura (lista + detalle de cada orden, sin botones de mutación).
 * - ADMIN: lista + detalle + gestión de estados y cancelación.
 */
export default function OrdenesPanel({
  ordenes = [],
  cargandoOrdenes = false,
  errorOrdenes = "",
  ordenSeleccionada = null,
  onVerDetalle,
  onCerrarDetalle,
  onRecargar,
  puedeGestionar = false,
  onCambiarEstado,
  onSimularPago,
  pagandoOrdenId = null,
  onCancelarOrden,
  mensaje = "",
}) {
  const [filtroEstado, setFiltroEstado] = useState("TODAS");
  const ordenesVisibles =
    filtroEstado === "TODAS"
      ? ordenes
      : ordenes.filter(
          (o) => String(o.estado ?? "").toUpperCase() === filtroEstado,
        );
  if (ordenSeleccionada) {
    const detalles = ordenSeleccionada.details || [];
    return (
      <section className="form-card">
        <button
          type="button"
          className="btn secondary"
          onClick={onCerrarDetalle}
        >
          ← Volver a órdenes
        </button>

        <p className="eyebrow">DETALLE DE ORDEN</p>
        <h1>Orden #{ordenSeleccionada.orderId}</h1>

        <p>
          <strong>Estado:</strong>{" "}
          <span className="pill">{ordenSeleccionada.estado}</span>
        </p>
        <p>
          <strong>ID Usuario:</strong> {ordenSeleccionada.userId}
        </p>
        {ordenSeleccionada.fecha && (
          <p>
            <strong>Fecha:</strong> {ordenSeleccionada.fecha}
          </p>
        )}
        {ordenSeleccionada.promotionCode && (
          <p>
            <strong>Cupón aplicado:</strong> {ordenSeleccionada.promotionCode}
          </p>
        )}
        <p>
          <strong>Subtotal:</strong> {formatoPrecio(ordenSeleccionada.subtotal)}
        </p>
        <p>
          <strong>Descuento:</strong>{" "}
          {formatoPrecio(ordenSeleccionada.descuento)}
        </p>
        <h2>Total: {formatoPrecio(ordenSeleccionada.total)}</h2>

        <h3>Productos de la orden</h3>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID Producto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Total línea</th>
              </tr>
            </thead>
            <tbody>
              {detalles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="muted">
                    Sin líneas de detalle registradas.
                  </td>
                </tr>
              ) : (
                detalles.map((item, idx) => (
                  <tr key={`${item.idProducto ?? item.idProduct}-${idx}`}>
                    <td>#{item.idProducto ?? item.idProduct}</td>
                    <td>{item.cantidad}</td>
                    <td>{formatoPrecio(item.precioUnitario)}</td>
                    <td>{formatoPrecio(item.precioTotal)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {puedeGestionar && (
          <div className="actions">
            {String(ordenSeleccionada.estado ?? "").toUpperCase() ===
              "PENDIENTE_PAGO" &&
              onSimularPago && (
                <button
                  type="button"
                  className="btn"
                  disabled={
                    pagandoOrdenId != null &&
                    Number(pagandoOrdenId) === Number(ordenSeleccionada.orderId)
                  }
                  onClick={() =>
                    onSimularPago(ordenSeleccionada.orderId, {
                      monto: ordenSeleccionada.total,
                    })
                  }
                >
                  {pagandoOrdenId != null &&
                  Number(pagandoOrdenId) === Number(ordenSeleccionada.orderId)
                    ? "Procesando pago..."
                    : "Simular pago (APROBADO)"}
                </button>
              )}
            <button
              type="button"
              className="btn secondary"
              onClick={() =>
                onCambiarEstado(ordenSeleccionada.orderId, "PAGADA")
              }
            >
              Marcar PAGADA
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() =>
                onCambiarEstado(ordenSeleccionada.orderId, "EN_DESPACHO")
              }
            >
              Marcar EN_DESPACHO
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() =>
                onCambiarEstado(ordenSeleccionada.orderId, "ENTREGADA")
              }
            >
              Marcar ENTREGADA
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={() => onCancelarOrden(ordenSeleccionada.orderId)}
            >
              Cancelar orden
            </button>
          </div>
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
    <section>
      <p className="eyebrow center">CONSULTA DE PEDIDOS</p>
      <h1 className="section-title">Órdenes registradas</h1>
      <p className="muted center">
        {puedeGestionar
          ? "Visualiza el detalle y gestiona el estado de las órdenes del sistema."
          : "Vista de solo lectura: consulta el listado y detalle de órdenes."}
      </p>

      <div className="filters">
        <select
          aria-label="Filtrar órdenes por estado"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          {ESTADOS_FILTRO.map((estado) => (
            <option key={estado} value={estado}>
              {estado === "TODAS" ? "Todos los estados" : estado}
            </option>
          ))}
        </select>
        <button type="button" className="btn secondary" onClick={onRecargar}>
          Actualizar listado
        </button>
      </div>

      {mensaje && (
        <p className="success" role="status">
          {mensaje}
        </p>
      )}

      {cargandoOrdenes && (
        <div className="notice" role="status">
          <p>Cargando órdenes...</p>
        </div>
      )}

      {!cargandoOrdenes && errorOrdenes && (
        <div className="notice" role="alert">
          <h3>No se pudieron cargar las órdenes</h3>
          <p className="muted">{errorOrdenes}</p>
        </div>
      )}

      {!cargandoOrdenes && !errorOrdenes && ordenesVisibles.length === 0 && (
        <div className="notice">
          <h3>No hay órdenes registradas</h3>
          <p className="muted">
            {filtroEstado === "TODAS"
              ? "Cuando los clientes realicen compras aparecerán en este listado."
              : `No existen órdenes en estado ${filtroEstado}.`}
          </p>
        </div>
      )}

      {!cargandoOrdenes && !errorOrdenes && ordenesVisibles.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Orden #</th>
                <th>Usuario ID</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenesVisibles.map((orden) => (
                <tr key={orden.orderId}>
                  <td>#{orden.orderId}</td>
                  <td>{orden.userId}</td>
                  <td>{orden.fecha ?? "—"}</td>
                  <td>
                    <span className="pill">{orden.estado}</span>
                  </td>
                  <td>{formatoPrecio(orden.total)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => onVerDetalle(orden.orderId)}
                    >
                      Ver detalle
                    </button>
                    {puedeGestionar && (
                      <>
                        {" "}
                        <button
                          type="button"
                          className="btn danger"
                          onClick={() => onCancelarOrden(orden.orderId)}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
