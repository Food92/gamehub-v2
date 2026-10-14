import './TarjetaProducto.css';

export default function TarjetaProducto({ producto, formatoPrecio, onVerCaracteristicas, onVerDetalle, onAgregar }) {
  return <article className="product"><img src={producto.imagen} alt={producto.nombre} loading="lazy" />{producto.oferta && <span className="pill">Oferta</span>}<span className="eyebrow">{producto.categoria}</span><h3>{producto.nombre}</h3><p className="muted">{producto.descripcion}</p><strong className="price">{formatoPrecio(producto.precio)}</strong><button className="btn secondary full" type="button" onClick={() => onVerCaracteristicas(producto)}>Ver características</button>{onVerDetalle && <button className="btn secondary full" type="button" onClick={() => onVerDetalle(producto)}>Ver detalle</button>}<button className="btn full" type="button" onClick={() => onAgregar(producto)}>Agregar al carrito</button></article>;
}
