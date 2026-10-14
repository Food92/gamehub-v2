import TarjetaProducto from "./TarjetaProducto.jsx";
import "./Catalogo.css";

/** Muestra una colección de productos y delega cada ficha en TarjetaProducto. */
export default function Catalogo({
  productos = [],
  formatoPrecio,
  onVerCaracteristicas,
  onVerDetalle,
  onAgregar,
}) {
  if (!productos.length)
    return (
      <div className="notice">
        <h3>No encontramos productos</h3>
        <p className="muted">Prueba con otra búsqueda o categoría.</p>
      </div>
    );
  return (
    <div className="grid">
      {productos.map((producto) => (
        <TarjetaProducto
          key={producto.id}
          producto={producto}
          formatoPrecio={formatoPrecio}
          onVerCaracteristicas={onVerCaracteristicas}
          onVerDetalle={onVerDetalle}
          onAgregar={onAgregar}
        />
      ))}
    </div>
  );
}
