import React, { useState } from "react";
import "./Orden.css";

function Orden() {
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [errorProducto, setErrorProducto] = useState(false);
  const [errorCantidad, setErrorCantidad] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    let valido = true;

    if (!producto) {
      setErrorProducto(true);
      valido = false;
    } else setErrorProducto(false);

    if (cantidad < 1 || cantidad > 10) {
      setErrorCantidad(true);
      valido = false;
    } else setErrorCantidad(false);

    if (valido) {
      alert(`Orden confirmada: ${cantidad} unidad(es) de ${producto}`);
    }
  };

  return (
    <main>
      <div className="form-container">
        <h2>Formulario de Orden de Compra</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="orden-producto">Producto *</label>
            <select
              id="orden-producto"
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
            >
              <option value="">Seleccione un producto</option>
              <option value="Notebook Gamer Asus ROG Strix">
                Notebook Gamer Asus ROG Strix
              </option>
              <option value="NVIDIA GeForce RTX 4070 12GB">
                NVIDIA GeForce RTX 4070 12GB
              </option>
              <option value="Procesador AMD Ryzen 7 7800X3D">
                Procesador AMD Ryzen 7 7800X3D
              </option>
              <option value="Teclado Mecánico Redragon K552">
                Teclado Mecánico Redragon K552
              </option>
              <option value="Monitor Gamer Samsung Odyssey G5 27''">
                Monitor Gamer Samsung Odyssey G5 27''
              </option>
              <option value="Consola PlayStation 5 Slim 1TB">
                Consola PlayStation 5 Slim 1TB
              </option>
            </select>
            {errorProducto && (
              <span className="error-msg">Debe seleccionar un producto.</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="orden-cantidad">Cantidad (Entre 1 y 10) *</label>
            <input
              type="number"
              id="orden-cantidad"
              min="1"
              max="10"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
            />
            <span className="ayuda-texto">Máximo 10 unidades por pedido.</span>
            {errorCantidad && (
              <span className="error-msg">
                La cantidad debe estar entre 1 y 10.
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-full">
            Confirmar Orden
          </button>
        </form>
      </div>
    </main>
  );
}

export default Orden;
