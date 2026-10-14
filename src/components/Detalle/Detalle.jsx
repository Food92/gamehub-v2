import './Detalle.css';
export default function Detalle({ producto, formatoPrecio, onAgregar, onVolver }) {
  if (!producto) return <section className="notice"><h1>Producto no encontrado</h1><button className="btn" onClick={onVolver}>Volver al catálogo</button></section>;
  return <section className="form-card"><button className="btn secondary" onClick={onVolver}>← Volver</button><div className="detail-layout"><img src={producto.imagen} alt={producto.nombre}/><div><p className="eyebrow">DETALLE DEL PRODUCTO</p><h1>{producto.nombre}</h1><p>{producto.descripcion}</p><h2>{formatoPrecio(producto.precio)}</h2><ul>{(producto.caracteristicas || []).map((item) => <li key={item}>{item}</li>)}</ul><button className="btn" onClick={() => onAgregar(producto)}>Agregar al carrito</button></div></div></section>;
}
