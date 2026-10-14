import { useEffect, useMemo, useState } from 'react';
import { productosIniciales, crearProducto, actualizarProducto, eliminarProducto } from '../logica/productos.js';
import { validarRegistro } from '../logica/validaciones.js';

const leerLocal = (clave, inicial) => {
  try { return JSON.parse(localStorage.getItem(clave)) ?? inicial; }
  catch { return inicial; }
};
export const formatoPrecio = (n) => '$' + Number(n).toLocaleString('es-CL');

export function useGameHub() {
  const [pagina, setPagina] = useState(() => { const ruta = location.hash.slice(1) || 'inicio'; return ruta === 'categorias' ? 'catalogo' : ruta; });
  const [productos, setProductos] = useState(() => leerLocal('gamehubProductos', productosIniciales));
  const [carrito, setCarrito] = useState(() => leerLocal('gamehubCarrito', []));
  const [usuario, setUsuario] = useState(() => leerLocal('gamehubUsuario', null));
  const [modal, setModal] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [productoEditando, setProductoEditando] = useState(null);
  const [pedidoFinal, setPedidoFinal] = useState(() => leerLocal('gamehubPedidoFinal', null));
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => { localStorage.setItem('gamehubProductos', JSON.stringify(productos)); }, [productos]);
  useEffect(() => { localStorage.setItem('gamehubCarrito', JSON.stringify(carrito)); }, [carrito]);
  useEffect(() => { localStorage.setItem('gamehubUsuario', JSON.stringify(usuario)); }, [usuario]);
  useEffect(() => { localStorage.setItem('gamehubPedidoFinal', JSON.stringify(pedidoFinal)); }, [pedidoFinal]);
  useEffect(() => {
    if (!mensaje) return undefined;
    const temporizador = window.setTimeout(() => setMensaje(''), 3000);
    return () => window.clearTimeout(temporizador);
  }, [mensaje]);
  useEffect(() => {
    const sincronizar = () => { const ruta = location.hash.slice(1) || 'inicio'; setPagina(ruta === 'categorias' ? 'catalogo' : ruta); };
    window.addEventListener('hashchange', sincronizar);
    return () => window.removeEventListener('hashchange', sincronizar);
  }, []);

  const navegar = (nuevaPagina) => { setPagina(nuevaPagina); setMensaje(''); location.hash = nuevaPagina; window.scrollTo(0, 0); };
  const agregar = (producto) => setCarrito((actual) => {
    const existe = actual.find((item) => item.id === producto.id);
    return existe ? actual.map((item) => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item) : [...actual, { ...producto, cantidad: 1 }];
  });
  const cambiarCantidad = (id, cambio) => setCarrito((actual) => actual.map((item) => item.id === id ? { ...item, cantidad: item.cantidad + cambio } : item).filter((item) => item.cantidad > 0));
  const eliminarDelCarrito = (id) => setCarrito((actual) => actual.filter((item) => item.id !== id));
  const vaciarCarrito = () => setCarrito([]);
  const cantidadTotal = carrito.reduce((suma, item) => suma + item.cantidad, 0);
  const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  const categorias = ['Todas', ...new Set(productos.map((p) => p.categoria))];
  const productosVisibles = useMemo(() => productos.filter((p) => (categoria === 'Todas' || p.categoria === categoria) && p.nombre.toLowerCase().includes(busqueda.toLowerCase())), [productos, categoria, busqueda]);

  const guardarProducto = (evento) => {
    evento.preventDefault();
    const form = new FormData(evento.currentTarget);
    const nuevo = { id: productoEditando?.id ?? Math.max(0, ...productos.map((p) => p.id)) + 1, nombre: String(form.get('nombre')).trim(), categoria: String(form.get('categoria')).trim(), precio: Number(form.get('precio')), descripcion: String(form.get('descripcion')).trim(), imagen: productoEditando?.imagen || '/img/teclado.jpg', oferta: form.get('oferta') === 'on', caracteristicas: productoEditando?.caracteristicas || [] };
    try {
      setProductos(productoEditando ? actualizarProducto(productos, productoEditando.id, nuevo) : crearProducto(productos, nuevo));
      setProductoEditando(null); setMensaje('Producto guardado correctamente.'); evento.currentTarget.reset();
    } catch (error) { setMensaje(error.message || 'No se pudo guardar el producto.'); }
  };
  const registrar = (evento) => {
    evento.preventDefault(); const form = new FormData(evento.currentTarget);
    const datos = { nombre: String(form.get('nombre')).trim(), email: String(form.get('email')).trim(), clave: String(form.get('clave')), confirmar: String(form.get('confirmar')) };
    if (!validarRegistro(datos)) { setMensaje('Revisa el correo y la contraseña: mínimo 6 caracteres y ambas claves iguales.'); return; }
    setUsuario({ nombre: datos.nombre, email: datos.email }); evento.currentTarget.reset(); setMensaje('Registro completado. Ya puedes ver tu perfil.');
  };
  const finalizarCompra = (evento) => {
    evento.preventDefault();
    if (!carrito.length) { setMensaje('Agrega al menos un producto antes de continuar.'); return; }
    const form = new FormData(evento.currentTarget);
    const pedido = { numero: `GH-${Date.now().toString().slice(-7)}`, cliente: Object.fromEntries(form.entries()), productos: carrito, total, fecha: new Date().toLocaleString('es-CL') };
    const exitoso = form.get('resultadoPago') !== 'fallido';
    setPedidoFinal({ ...pedido, exitoso }); if (exitoso) setCarrito([]); navegar('resultado');
  };
  const enviarContacto = (evento) => { evento.preventDefault(); evento.currentTarget.reset(); setMensaje('¡Mensaje validado! Esta demo no envía correos reales.'); };
  const cerrarSesion = () => { setUsuario(null); setMensaje('Se cerró el perfil local.'); };
  const eliminarProductoPorId = (id) => { setProductos((actuales) => eliminarProducto(actuales, id)); setMensaje('Producto eliminado.'); };
  const abrirEdicion = (producto) => { setProductoEditando(producto); window.scrollTo(0, 0); };
  const verDetalle = (producto) => { setProductoSeleccionado(producto); navegar('detalle'); };
  const cancelarEdicion = () => setProductoEditando(null);
  const agregarDesdeModal = () => { if (modal) agregar(modal); setModal(null); };

  return { pagina, productos, carrito, usuario, productoSeleccionado, modal, setModal, mensaje, setMensaje, busqueda, setBusqueda, categoria, setCategoria, productoEditando, pedidoFinal, navegar, verDetalle, agregar, cambiarCantidad, eliminarDelCarrito, vaciarCarrito, cantidadTotal, total, categorias, productosVisibles, guardarProducto, registrar, finalizarCompra, enviarContacto, cerrarSesion, eliminarProductoPorId, abrirEdicion, cancelarEdicion, agregarDesdeModal };
}
