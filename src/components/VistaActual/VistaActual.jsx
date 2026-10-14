import Catalogo from '../Catalogo/Catalogo.jsx';
import Carrito from '../carrito/Carrito.jsx';
import Inicio from '../Inicio/Inicio.jsx';
import Registro from '../Registro/Registro.jsx';
import Perfil from '../Perfil/Perfil.jsx';
import Contacto from '../Contacto/Contacto.jsx';
import Detalle from '../Detalle/Detalle.jsx';
import Orden from '../Orden/Orden.jsx';
import Admin from '../Admin/Admin.jsx';
import { formatoPrecio } from '../../hooks/useGameHub.js';

/** Selecciona la vista correspondiente; cada pantalla tiene su propio componente. */
export default function VistaActual(p) {
  const mostrarCatalogo = (props) => <Catalogo {...props} formatoPrecio={formatoPrecio} onVerCaracteristicas={p.setModal} onVerDetalle={p.verDetalle} onAgregar={(producto) => { p.agregar(producto); p.setMensaje(`${producto.nombre} se agregó al carrito.`); }} />;
  if (p.pagina === 'catalogo') return <><p className="eyebrow center">EQUIPAMIENTO SELECCIONADO</p><h1 className="section-title">Catálogo gamer</h1><div className="filters"><input aria-label="Buscar productos" placeholder="Buscar producto..." value={p.busqueda} onChange={(e) => p.setBusqueda(e.target.value)}/><select aria-label="Filtrar por categoría" value={p.categoria} onChange={(e) => p.setCategoria(e.target.value)}>{p.categorias.map((c) => <option key={c}>{c}</option>)}</select></div>{mostrarCatalogo({ productos: p.productosVisibles })}</>;
  if (p.pagina === 'ofertas') return <><p className="eyebrow center">OPORTUNIDADES GAMER</p><h1 className="section-title">Productos en oferta</h1>{mostrarCatalogo({ productos: p.productos.filter((x) => x.oferta) })}</>;
  if (p.pagina === 'carrito') return <><h1 className="section-title">Mi carrito</h1><Carrito items={p.carrito} formatoPrecio={formatoPrecio} totalPrecio={p.total} onRestar={(id) => p.cambiarCantidad(id, -1)} onSumar={p.agregar} onEliminar={p.eliminarDelCarrito} onVaciar={p.vaciarCarrito} onCheckout={() => p.navegar('checkout')} onCatalogo={() => p.navegar('catalogo')}/>{p.mensaje && <p className="success" role="status">{p.mensaje}</p>}</>;
  if (p.pagina === 'checkout' || p.pagina === 'resultado') return <Orden pedidoFinal={p.pagina === 'resultado' ? p.pedidoFinal : null} carrito={p.carrito} total={p.total} usuario={p.usuario} finalizarCompra={p.finalizarCompra} navegar={p.navegar} formatoPrecio={formatoPrecio}/>;
  if (p.pagina === 'registro') return <Registro registrar={p.registrar} mensaje={p.mensaje}/>;
  if (p.pagina === 'perfil') return <Perfil usuario={p.usuario} cerrarSesion={p.cerrarSesion} navegar={p.navegar} mensaje={p.mensaje}/>;
  if (p.pagina === 'contacto') return <Contacto enviarContacto={p.enviarContacto} mensaje={p.mensaje}/>;
  if (p.pagina === 'detalle') return <Detalle producto={p.productoSeleccionado} formatoPrecio={formatoPrecio} onAgregar={p.agregar} onVolver={() => p.navegar('catalogo')}/>;
  if (p.pagina === 'admin') return <Admin productos={p.productos} productoEditando={p.productoEditando} guardarProducto={p.guardarProducto} cancelarEdicion={p.cancelarEdicion} mensaje={p.mensaje} abrirEdicion={p.abrirEdicion} eliminarProductoPorId={p.eliminarProductoPorId}/>;
  return <Inicio productos={p.productos} CatalogoVista={mostrarCatalogo} onNavegar={p.navegar}/>;
}
