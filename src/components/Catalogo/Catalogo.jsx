import TarjetaProducto from "./TarjetaProducto.jsx";
import "./Catalogo.css";

/** Muestra productos con una tarjeta por elemento. */
export default function Catalogo({
  productos = [],
  formatoPrecio,
  onVerCaracteristicas,
  onVerDetalle,
  onAgregar,
}) {
  if (!productos.length) {
    return (
      <div className="notice">
        <h3>No encontramos productos</h3>
        <p className="muted">Prueba otra busqueda o categoria.</p>
      </div>
    );
  }

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4 mt-2">
      {productos.map((producto) => (
        <div className="col" key={producto.id}>
          <TarjetaProducto
            producto={producto}
            formatoPrecio={formatoPrecio}
            onVerCaracteristicas={onVerCaracteristicas}
            onVerDetalle={onVerDetalle}
            onAgregar={onAgregar}
          />
        </div>
      ))}
    </div>
  );
}
