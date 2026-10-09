import React, { useState } from "react";
import "./Catalogo.css";

function Catalogo({ agregarItem }) {
  const [productos] = useState([
    { id: 1, nombre: "Monitor", precio: 120000 },
    { id: 2, nombre: "PS5", precio: 650000 },
    { id: 3, nombre: "Notebook", precio: 450000 },
    { id: 4, nombre: "RTX 4070", precio: 700000 },
  ]);

  return (
    <section className="catalogo">
      <h2>Catálogo de Productos</h2>
      <div className="productos">
        {productos.map((p) => (
          <div key={p.id} className="producto">
            <h3>{p.nombre}</h3>
            <p>${p.precio}</p>
            <button onClick={() => agregarItem(p)}>Agregar al carrito</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Catalogo;
