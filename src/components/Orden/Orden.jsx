import { useState } from "react";
import "./Orden.css";

export default function Orden({
  pedidoFinal,
  carrito,
  total,
  usuario,
  cuponValidado = null,
  validarCuponCheckout,
  finalizarCompra,
  procesandoCompra = false,
  mensaje = "",
  navegar,
  formatoPrecio,
}) {
  const [codigoCupon, setCodigoCupon] = useState(cuponValidado?.codigo ?? "");
  const descuentoEstimado = cuponValidado?.descuento ?? 0;
  const totalEstimado = Math.max(total - descuentoEstimado, 0);
  if (pedidoFinal) {
    return (
      <section className="form-card">
        <h1>
          {pedidoFinal.exitoso
            ? "✓ Orden registrada en el servidor"
            : "✕ No se pudo registrar la orden"}
        </h1>
        <p>
          <strong>Pedido:</strong> {pedidoFinal.numero}
        </p>
        {pedidoFinal.estado && (
          <p>
            <strong>Estado:</strong>{" "}
            <span className="pill">{pedidoFinal.estado}</span>
          </p>
        )}
        <p>
          <strong>Cliente:</strong> {pedidoFinal.cliente?.nombre}{" "}
          {pedidoFinal.cliente?.apellido}
        </p>
        <p>
          <strong>Dirección:</strong> {pedidoFinal.cliente?.calle},{" "}
          {pedidoFinal.cliente?.comuna}, {pedidoFinal.cliente?.region}
        </p>
        <p>
          <strong>Entrega:</strong> {pedidoFinal.cliente?.entrega}
        </p>
        {pedidoFinal.descuento > 0 && (
          <p>
            <strong>Descuento:</strong> -{formatoPrecio(pedidoFinal.descuento)}
          </p>
        )}
        <h2>Total: {formatoPrecio(pedidoFinal.total)}</h2>
        <h3>Resumen de productos</h3>
        {(pedidoFinal.productos || []).map((x) => (
          <p key={x.id}>
            {x.nombre} × {x.cantidad} — {formatoPrecio(x.precio * x.cantidad)}
          </p>
        ))}
        {!pedidoFinal.exitoso && (
          <button
            className="btn"
            type="button"
            onClick={() => navegar("checkout")}
          >
            Volver a intentar
          </button>
        )}
        <button
          className="btn secondary full"
          type="button"
          onClick={() => navegar("catalogo")}
        >
          Seguir comprando
        </button>
      </section>
    );
  }

  return (
    <section className="form-card">
      <h1>Finalizar compra</h1>
      <p className="muted">
        Subtotal: <strong>{formatoPrecio(total)}</strong>
        {descuentoEstimado > 0
          ? ` · Descuento (${cuponValidado.codigo}): -${formatoPrecio(descuentoEstimado)} · Total estimado: `
          : " · Total del pedido: "}
        <strong>{formatoPrecio(totalEstimado)}</strong>. Completa los datos de
        entrega para generar tu orden en el backend.
      </p>

      {!usuario && (
        <p className="success" role="alert">
          Debes iniciar sesión con tu cuenta para registrar una compra.{" "}
          <button
            className="linkbtn"
            type="button"
            onClick={() => navegar("perfil")}
          >
            Iniciar sesión
          </button>
        </p>
      )}

      {!carrito.length && (
        <p className="success">
          Tu carrito está vacío.{" "}
          <button
            className="linkbtn"
            type="button"
            onClick={() => navegar("catalogo")}
          >
            Volver al catálogo
          </button>
        </p>
      )}

      <form onSubmit={finalizarCompra}>
        <div className="checkout-grid">
          {[
            ["nombre", "Nombre"],
            ["apellido", "Apellido"],
            ["email", "Correo electrónico"],
            ["rut", "RUT (ej: 12345678-9)"],
            ["telefono", "Teléfono (ej: +56 912345678)"],
            ["calle", "Dirección de entrega"],
            ["region", "Región"],
            ["comuna", "Comuna"],
          ].map(([name, label]) => (
            <label key={name}>
              {label} *
              <input
                name={name}
                type={name === "email" ? "email" : "text"}
                required
                defaultValue={
                  usuario && name === "nombre"
                    ? usuario.nombre
                    : usuario && name === "apellido"
                      ? usuario.apellido || ""
                      : usuario && name === "email"
                        ? usuario.email
                        : usuario && name === "rut"
                          ? usuario.rut || ""
                          : usuario && name === "telefono"
                            ? usuario.telefono || ""
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
            Código de promoción (opcional)
            <input
              name="promotionCode"
              type="text"
              placeholder="Ej: GAMER10"
              value={codigoCupon}
              onChange={(e) => setCodigoCupon(e.target.value)}
            />
          </label>
          {validarCuponCheckout && (
            <label>
              Validar descuento
              <button
                className="btn secondary full"
                type="button"
                disabled={!carrito.length || !codigoCupon.trim()}
                onClick={() => validarCuponCheckout(codigoCupon)}
              >
                Validar cupón
              </button>
            </label>
          )}
          <label>
            Indicaciones (opcional)
            <textarea name="indicaciones" rows="2" />
          </label>
        </div>

        <button
          className="btn full"
          type="submit"
          disabled={!carrito.length || !usuario || procesandoCompra}
        >
          {procesandoCompra ? "Procesando orden..." : "Confirmar compra"}
        </button>
      </form>

      {mensaje && (
        <p className="success" role="status">
          {mensaje}
        </p>
      )}
    </section>
  );
}
