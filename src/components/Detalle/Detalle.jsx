import "./Detalle.css";

export default function Detalle({
  producto,
  formatoPrecio,
  soloLectura = false,
  onAgregar,
  onVolver,
}) {
  if (!producto) {
    return (
      <section className="notice">
        <h1>Producto no encontrado</h1>
        <button className="btn" type="button" onClick={onVolver}>
          Volver al catálogo
        </button>
      </section>
    );
  }

  return (
    <section className="form-card">
      <button className="btn secondary" type="button" onClick={onVolver}>
        ← Volver
      </button>
      <div className="detail-layout">
        <img src={producto.imagen} alt={producto.nombre} />
        <div>
          <p className="eyebrow">DETALLE DEL PRODUCTO</p>
          <h1>{producto.nombre}</h1>
          {producto.categoria && (
            <span className="pill">{producto.categoria}</span>
          )}
          <p>{producto.descripcion}</p>
          <h2>{formatoPrecio(producto.precio)}</h2>
          {producto.stock != null && (
            <p className="muted">
              {producto.stock > 0
                ? `Stock disponible: ${producto.stock} unidades`
                : "Sin stock disponible"}
            </p>
          )}
          <ul>
            {(producto.caracteristicas || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {!soloLectura && onAgregar && (
            <button
              className="btn"
              type="button"
              disabled={producto.stock != null && producto.stock <= 0}
              onClick={() => onAgregar(producto)}
            >
              {producto.stock != null && producto.stock <= 0
                ? "Sin stock"
                : "Agregar al carrito"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
