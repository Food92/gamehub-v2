// src/components/Carrito.jsx

import React from "react";
import "./Carrito.css";

function Carrito({
  items,
  restarItem,
  agregarItem,
  eliminarItem,
  vaciarCarrito,
  totalPrecio,
}) {
  if (!items.length) {
    return (
      <div className="aviso-box">
        <h3>Tu carrito está vacío</h3>
        <p>Explora el catálogo y agrega tus productos favoritos.</p>
      </div>
    );
  }

  return (
    <section className="carrito">
      <h2>Mi Carrito</h2>
      <div className="lista-carrito">
        {items.map((p) => (
          <article key={p.id} className="item-carrito">
            <img src={p.imagen} alt={p.nombre} />
            <div>
              <h3>{p.nombre}</h3>
              <p>${p.precio} c/u</p>
            </div>
            <div className="controles-cantidad">
              <button onClick={() => restarItem(p.id)}>−</button>
              <span>{p.cantidad}</span>
              <button onClick={() => agregarItem(p)}>+</button>
            </div>
            <strong>${p.precio * p.cantidad}</strong>
            <button onClick={() => eliminarItem(p.id)}>Eliminar</button>
          </article>
        ))}
      </div>
      <section className="resumen-carrito">
        <h3>Total: ${totalPrecio}</h3>
        <button onClick={vaciarCarrito}>Confirmar compra</button>
      </section>
    </section>
  );
}

export default Carrito;
