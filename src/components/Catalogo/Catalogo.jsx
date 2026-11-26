import TarjetaProducto from "./TarjetaProducto.jsx";
import "./Catalogo.css";

/** Muestra los estados de carga, error, vacío o la lista de productos. */
export default function Catalogo({
  productos = [],
  cargandoProductos = false,
  errorProductos = "",
  formatoPrecio,
  soloLectura = false,
  onVerCaracteristicas,
  onVerDetalle,
  onAgregar,
}) {
  if (cargandoProductos) {
    return (
      <div className="notice" role="status">
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (errorProductos) {
    return (
      <div className="notice" role="alert">
        <h3>No se pudieron cargar los productos</h3>
        <p className="muted">{errorProductos}</p>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="notice">
        <h3>No encontramos productos</h3>
        <p className="muted">Prueba otra búsqueda o categoría.</p>
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
            soloLectura={soloLectura}
            onVerCaracteristicas={onVerCaracteristicas}
            onVerDetalle={onVerDetalle}
            onAgregar={onAgregar}
          />
        </div>
      ))}
    </div>
  );
}
