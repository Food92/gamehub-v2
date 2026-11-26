import Catalogo from "../Catalogo/Catalogo.jsx";
import Carrito from "../carrito/Carrito.jsx";
import Inicio from "../Inicio/Inicio.jsx";
import Registro from "../Registro/Registro.jsx";
import Perfil from "../Perfil/Perfil.jsx";
import Contacto from "../Contacto/Contacto.jsx";
import Detalle from "../Detalle/Detalle.jsx";
import Orden from "../Orden/Orden.jsx";
import OrdenesPanel from "../Orden/OrdenesPanel.jsx";
import Admin from "../Admin/Admin.jsx";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute.jsx";
import { formatoPrecio } from "../../hooks/useGameHub.js";
import {
  esAdmin,
  esVendedor,
  rutaPorDefecto,
} from "../../logica/roles.js";

/** Selecciona la vista correspondiente aplicando control de acceso estricto por rol. */
export default function VistaActual(p) {
  const adminActivo = esAdmin(p.rol);
  const vendedorActivo = esVendedor(p.rol);
  const puedeComprar = Boolean(p.puedeComprar);
  const fallback = rutaPorDefecto(p.rol);

  const mostrarCatalogo = (props) => (
    <Catalogo
      {...props}
      cargandoProductos={p.cargandoProductos}
      errorProductos={p.errorProductos}
      formatoPrecio={formatoPrecio}
      soloLectura={!puedeComprar}
      onVerCaracteristicas={p.setModal}
      onVerDetalle={p.verDetalle}
      onAgregar={(producto) => {
        if (p.agregar(producto)) {
          p.setMensaje(`${producto.nombre} se agregó al carrito.`);
        }
      }}
    />
  );

  if (p.pagina === "catalogo") {
    return (
      <>
        <p className="eyebrow center">EQUIPAMIENTO SELECCIONADO</p>
        <h1 className="section-title">Catálogo gamer</h1>

        <div className="filters">
          <input
            aria-label="Buscar productos"
            placeholder="Buscar producto..."
            value={p.busqueda}
            onChange={(e) => p.setBusqueda(e.target.value)}
          />

          <select
            aria-label="Filtrar por categoría"
            value={p.categoria}
            onChange={(e) => p.setCategoria(e.target.value)}
          >
            {p.categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        {mostrarCatalogo({ productos: p.productosVisibles })}
      </>
    );
  }

  if (p.pagina === "ofertas") {
    return (
      <ProtectedRoute
        permitido={!vendedorActivo}
        redirigirA={fallback}
        onRedirigir={p.navegar}
      >
        <p className="eyebrow center">OPORTUNIDADES GAMER</p>
        <h1 className="section-title">Productos en oferta</h1>
        {mostrarCatalogo({
          productos: (p.productosTienda ?? p.productos).filter(
            (producto) => producto.oferta,
          ),
        })}
      </ProtectedRoute>
    );
  }

  if (p.pagina === "carrito") {
    return (
      <ProtectedRoute
        permitido={puedeComprar}
        redirigirA={adminActivo ? "ordenes" : fallback}
        onRedirigir={p.navegar}
      >
        <h1 className="section-title">Mi carrito</h1>
        <Carrito
          items={p.carrito}
          formatoPrecio={formatoPrecio}
          totalPrecio={p.total}
          onRestar={(id) => p.cambiarCantidad(id, -1)}
          onSumar={p.agregar}
          onEliminar={p.eliminarDelCarrito}
          onVaciar={p.vaciarCarrito}
          onCheckout={() => p.navegar("checkout")}
          onCatalogo={() => p.navegar("catalogo")}
        />
        {p.mensaje && (
          <p className="success" role="status">
            {p.mensaje}
          </p>
        )}
      </ProtectedRoute>
    );
  }

  if (p.pagina === "checkout" || p.pagina === "resultado") {
    return (
      <ProtectedRoute
        permitido={puedeComprar}
        redirigirA={adminActivo ? "ordenes" : fallback}
        onRedirigir={p.navegar}
      >
        <Orden
          pedidoFinal={p.pagina === "resultado" ? p.pedidoFinal : null}
          carrito={p.carrito}
          total={p.total}
          usuario={p.usuario}
          cuponValidado={p.cuponValidado}
          validarCuponCheckout={p.validarCuponCheckout}
          finalizarCompra={p.finalizarCompra}
          procesandoCompra={p.procesandoCompra}
          simularPagoOrden={p.simularPagoOrden}
          pagandoOrdenId={p.pagandoOrdenId}
          mensaje={p.mensaje}
          navegar={p.navegar}
          formatoPrecio={formatoPrecio}
        />
      </ProtectedRoute>
    );
  }

  if (p.pagina === "registro") {
    return (
      <ProtectedRoute
        permitido={!p.usuario}
        redirigirA={fallback}
        onRedirigir={p.navegar}
      >
        <Registro
          registrar={p.registrar}
          navegar={p.navegar}
          mensaje={p.mensaje}
          errorAuth={p.errorAuth}
          autenticando={p.autenticando}
        />
      </ProtectedRoute>
    );
  }

  if (p.pagina === "perfil") {
    return (
      <Perfil
        usuario={p.usuario}
        misOrdenes={p.misOrdenes}
        simularPagoOrden={p.simularPagoOrden}
        pagandoOrdenId={p.pagandoOrdenId}
        iniciarSesion={p.iniciarSesion}
        cerrarSesion={p.cerrarSesion}
        navegar={p.navegar}
        mensaje={p.mensaje}
        errorAuth={p.errorAuth}
        autenticando={p.autenticando}
        formatoPrecio={formatoPrecio}
      />
    );
  }

  if (p.pagina === "contacto") {
    return (
      <ProtectedRoute
        permitido={!vendedorActivo}
        redirigirA={fallback}
        onRedirigir={p.navegar}
      >
        <Contacto enviarContacto={p.enviarContacto} mensaje={p.mensaje} />
      </ProtectedRoute>
    );
  }

  if (p.pagina === "detalle") {
    return (
      <Detalle
        producto={p.productoSeleccionado}
        formatoPrecio={formatoPrecio}
        soloLectura={!puedeComprar}
        onAgregar={p.agregar}
        onVolver={() => p.navegar("catalogo")}
      />
    );
  }

  if (p.pagina === "ordenes") {
    return (
      <ProtectedRoute
        permitido={adminActivo || vendedorActivo}
        redirigirA={fallback}
        onRedirigir={p.navegar}
      >
        <OrdenesPanel
          ordenes={p.ordenes}
          cargandoOrdenes={p.cargandoOrdenes}
          errorOrdenes={p.errorOrdenes}
          ordenSeleccionada={p.ordenSeleccionada}
          onVerDetalle={p.verDetalleOrden}
          onCerrarDetalle={() => p.setOrdenSeleccionada(null)}
          onRecargar={() => p.cargarOrdenes()}
          puedeGestionar={adminActivo}
          onCambiarEstado={p.actualizarEstadoOrden}
          onSimularPago={p.simularPagoOrden}
          pagandoOrdenId={p.pagandoOrdenId}
          onCancelarOrden={p.cancelarOrdenPorId}
          mensaje={p.mensaje}
        />
      </ProtectedRoute>
    );
  }

  if (p.pagina === "admin") {
    return (
      <ProtectedRoute
        permitido={adminActivo}
        redirigirA={fallback}
        onRedirigir={p.navegar}
      >
        <Admin
          productos={p.productos}
          categoriasApi={p.categoriasApi}
          productoEditando={p.productoEditando}
          guardarProducto={p.guardarProducto}
          cambiarActivoProducto={p.cambiarActivoProducto}
          cancelarEdicion={p.cancelarEdicion}
          abrirEdicion={p.abrirEdicion}
          eliminarProductoPorId={p.eliminarProductoPorId}
          categoriaEditando={p.categoriaEditando}
          setCategoriaEditando={p.setCategoriaEditando}
          guardarCategoria={p.guardarCategoria}
          desactivarCategoriaPorId={p.desactivarCategoriaPorId}
          ordenes={p.ordenes}
          cargandoOrdenes={p.cargandoOrdenes}
          errorOrdenes={p.errorOrdenes}
          ordenSeleccionada={p.ordenSeleccionada}
          onVerDetalleOrden={p.verDetalleOrden}
          onCerrarDetalleOrden={() => p.setOrdenSeleccionada(null)}
          onRecargarOrdenes={() => p.cargarOrdenes()}
          onCambiarEstadoOrden={p.actualizarEstadoOrden}
          onSimularPagoOrden={p.simularPagoOrden}
          pagandoOrdenId={p.pagandoOrdenId}
          onCancelarOrden={p.cancelarOrdenPorId}
          usuariosAdmin={p.usuariosAdmin}
          cuentasAdmin={p.cuentasAdmin}
          cargandoUsuarios={p.cargandoUsuarios}
          errorUsuarios={p.errorUsuarios}
          usuarioEditando={p.usuarioEditando}
          setUsuarioEditando={p.setUsuarioEditando}
          guardarUsuarioAdmin={p.guardarUsuarioAdmin}
          eliminarUsuarioPorId={p.eliminarUsuarioPorId}
          cambiarRolCuenta={p.cambiarRolCuenta}
          cambiarActivoCuenta={p.cambiarActivoCuenta}
          mensaje={p.mensaje}
        />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute
      permitido={!vendedorActivo}
      redirigirA={fallback}
      onRedirigir={p.navegar}
    >
      <Inicio
        productos={p.productosTienda ?? p.productos}
        CatalogoVista={mostrarCatalogo}
        onNavegar={p.navegar}
      />
    </ProtectedRoute>
  );
}
