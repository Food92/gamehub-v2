import React from "react";

/** Presentación del carrito. El estado permanece en App para compartirlo con checkout y resultado. */
function Carrito({ items = [], formatoPrecio, totalPrecio = 0, onRestar, onSumar, onEliminar, onVaciar, onCheckout, onCatalogo }) {
  if (!items.length) {
    return <div className="notice"><h3>Tu carrito está vacío</h3><p className="muted">Explora el catálogo y agrega tus productos favoritos.</p><button className="btn" type="button" onClick={onCatalogo}>Ir al catálogo</button></div>;
  }

  return (
    <>
      <div className="cart-list">
        {items.map((producto) => (
          <article className="cart-item" key={producto.id}>
            <img src={producto.imagen} alt={producto.nombre} loading="lazy" />
            <div><h3>{producto.nombre}</h3><p className="muted">{formatoPrecio(producto.precio)} por unidad</p></div>
            <div className="qty">
              <button type="button" aria-label={`Restar ${producto.nombre}`} onClick={() => onRestar(producto.id)}>−</button>
              <span aria-live="polite">{producto.cantidad}</span>
              <button type="button" aria-label={`Sumar ${producto.nombre}`} onClick={() => onSumar(producto)}>+</button>
            </div>
            <strong>{formatoPrecio(producto.precio * producto.cantidad)}</strong>
            <button className="remove" type="button" onClick={() => onEliminar(producto.id)}>Eliminar</button>
          </article>
        ))}
      </div>
      <div className="summary"><h2>Total: {formatoPrecio(totalPrecio)}</h2><div className="actions"><button className="btn secondary" type="button" onClick={onVaciar}>Vaciar carrito</button><button className="btn" type="button" onClick={onCheckout}>Continuar con la compra</button></div></div>
    </>
  );
}

export default Carrito;
