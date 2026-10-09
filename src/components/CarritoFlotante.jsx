import React from "react";
import "./CarritoFlotante.css";

function CarritoFlotante({ cantidadTotal }) {
  return (
    <a
      href="/carrito"
      className="carrito-flotante"
      aria-label="Ver carrito de compras"
    >
      🛒 <span className="carrito-contador">{cantidadTotal}</span>
    </a>
  );
}

export default CarritoFlotante;
