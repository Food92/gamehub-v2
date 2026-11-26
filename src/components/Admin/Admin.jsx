import { useState } from "react";
import "./Admin.css";
import { formatoPrecio } from "../../hooks/useGameHub.js";
import OrdenesPanel from "../Orden/OrdenesPanel.jsx";

export default function Admin({
  productos = [],
  categoriasApi = [],
  productoEditando,
  guardarProducto,
  cambiarActivoProducto,
  cancelarEdicion,
  abrirEdicion,
  eliminarProductoPorId,
  categoriaEditando,
  setCategoriaEditando,
  guardarCategoria,
  desactivarCategoriaPorId,
  ordenes = [],
  cargandoOrdenes = false,
  errorOrdenes = "",
  ordenSeleccionada = null,
  onVerDetalleOrden,
  onCerrarDetalleOrden,
  onRecargarOrdenes,
  onCambiarEstadoOrden,
  onSimularPagoOrden,
  pagandoOrdenId = null,
  onCancelarOrden,
  usuariosAdmin = [],
  cuentasAdmin = [],
  cargandoUsuarios = false,
  errorUsuarios = "",
  usuarioEditando,
  setUsuarioEditando,
  guardarUsuarioAdmin,
  eliminarUsuarioPorId,
  cambiarRolCuenta,
  cambiarActivoCuenta,
  mensaje,
}) {
  const [seccion, setSeccion] = useState("productos");

  return (
    <section>
      <h1 className="section-title">Panel de Administración</h1>
      <p className="muted center">
        Acceso exclusivo de Administrador: gestión completa de productos,
        categorías, órdenes y usuarios.
      </p>

      <div className="actions">
        <button
          type="button"
          className={seccion === "productos" ? "btn" : "btn secondary"}
          onClick={() => setSeccion("productos")}
        >
          Productos ({productos.length})
        </button>
        <button
          type="button"
          className={seccion === "categorias" ? "btn" : "btn secondary"}
          onClick={() => setSeccion("categorias")}
        >
          Categorías ({categoriasApi.length})
        </button>
        <button
          type="button"
          className={seccion === "ordenes" ? "btn" : "btn secondary"}
          onClick={() => setSeccion("ordenes")}
        >
          Órdenes ({ordenes.length})
        </button>
        <button
          type="button"
          className={seccion === "usuarios" ? "btn" : "btn secondary"}
          onClick={() => setSeccion("usuarios")}
        >
          Usuarios y Cuentas ({usuariosAdmin.length})
        </button>
      </div>

      {seccion === "productos" && (
        <>
          <form
            key={productoEditando?.id ?? "nuevo-producto"}
            className="form-card"
            onSubmit={guardarProducto}
          >
            <h2>
              {productoEditando ? "Editar producto" : "Nuevo producto"}
            </h2>

            <label>
              Nombre *
              <input
                name="nombre"
                required
                defaultValue={productoEditando?.nombre ?? ""}
              />
            </label>

            <label>
              Marca *
              <input
                name="marca"
                required
                placeholder="Ej: Sony, ASUS, Logitech"
                defaultValue={productoEditando?.marca ?? ""}
              />
            </label>

            <label>
              Modelo *
              <input
                name="modelo"
                required
                placeholder="Ej: Slim 1TB, ROG Strix"
                defaultValue={productoEditando?.modelo ?? ""}
              />
            </label>

            <label>
              Ruta o URL de la imagen
              <input
                name="imagenUrl"
                type="text"
                placeholder="/img/teclado.jpg"
                defaultValue={productoEditando?.imagenUrl ?? ""}
              />
            </label>

            <label>
              Categoría *
              <select
                name="idCategory"
                required
                defaultValue={productoEditando?.idCategory ?? ""}
              >
                <option value="" disabled>
                  Selecciona una categoría
                </option>
                {categoriasApi.map((categoria) => (
                  <option
                    key={categoria.idCategory}
                    value={categoria.idCategory}
                  >
                    {categoria.nombreCategory}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Precio (CLP) *
              <input
                name="precio"
                type="number"
                min="1"
                required
                defaultValue={productoEditando?.precioBase ?? productoEditando?.precio ?? ""}
              />
            </label>

            <label>
              Descripción *
              <input
                name="descripcion"
                required
                defaultValue={productoEditando?.descripcion ?? ""}
              />
            </label>

            <label className="check-label">
              <input
                name="enOferta"
                type="checkbox"
                defaultChecked={Boolean(productoEditando?.oferta)}
              />
              Mostrar en sección Ofertas
            </label>

            <label>
              Precio oferta (opcional)
              <input
                name="precioOferta"
                type="number"
                min="1"
                defaultValue={productoEditando?.precioOferta ?? ""}
              />
            </label>

            <button className="btn full" type="submit">
              {productoEditando ? "Guardar cambios" : "Crear producto"}
            </button>

            {productoEditando && (
              <button
                type="button"
                className="btn secondary full"
                onClick={cancelarEdicion}
              >
                Cancelar edición
              </button>
            )}

            {mensaje && (
              <p className="success" role="status">
                {mensaje}
              </p>
            )}
          </form>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Marca / Modelo</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.nombre}</td>
                    <td>
                      {producto.marca} {producto.modelo}
                    </td>
                    <td>{producto.categoria}</td>
                    <td>{formatoPrecio(producto.precio)}</td>
                    <td>
                      {producto.stock != null ? `${producto.stock} u.` : "—"}
                    </td>
                    <td>
                      <span className="pill">
                        {producto.estado === false ? "INACTIVO" : "ACTIVO"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn secondary"
                        type="button"
                        onClick={() => abrirEdicion(producto)}
                      >
                        Editar
                      </button>{" "}
                      {cambiarActivoProducto && (
                        <>
                          <button
                            className="btn secondary"
                            type="button"
                            onClick={() => cambiarActivoProducto(producto)}
                          >
                            {producto.estado === false
                              ? "Activar"
                              : "Desactivar"}
                          </button>{" "}
                        </>
                      )}
                      <button
                        className="btn danger"
                        type="button"
                        onClick={() => eliminarProductoPorId(producto.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {seccion === "categorias" && (
        <>
          <form
            key={categoriaEditando?.idCategory ?? "nueva-categoria"}
            className="form-card"
            onSubmit={guardarCategoria}
          >
            <h2>
              {categoriaEditando ? "Editar categoría" : "Nueva categoría"}
            </h2>
            <label>
              Nombre de categoría *
              <input
                name="nombreCategory"
                required
                defaultValue={categoriaEditando?.nombreCategory ?? ""}
              />
            </label>
            <label>
              Descripción *
              <input
                name="descripcionCategory"
                required
                defaultValue={categoriaEditando?.descripcionCategory ?? ""}
              />
            </label>
            <button className="btn full" type="submit">
              {categoriaEditando ? "Guardar cambios" : "Crear categoría"}
            </button>
            {categoriaEditando && (
              <button
                type="button"
                className="btn secondary full"
                onClick={() => setCategoriaEditando(null)}
              >
                Cancelar edición
              </button>
            )}
            {mensaje && (
              <p className="success" role="status">
                {mensaje}
              </p>
            )}
          </form>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categoriasApi.map((cat) => (
                  <tr key={cat.idCategory}>
                    <td>#{cat.idCategory}</td>
                    <td>{cat.nombreCategory}</td>
                    <td>{cat.descripcionCategory}</td>
                    <td>
                      <span className="pill">{cat.estado ?? "ACTIVO"}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => setCategoriaEditando(cat)}
                      >
                        Editar
                      </button>{" "}
                      <button
                        type="button"
                        className="btn danger"
                        onClick={() => desactivarCategoriaPorId(cat.idCategory)}
                      >
                        Desactivar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {seccion === "ordenes" && (
        <OrdenesPanel
          ordenes={ordenes}
          cargandoOrdenes={cargandoOrdenes}
          errorOrdenes={errorOrdenes}
          ordenSeleccionada={ordenSeleccionada}
          onVerDetalle={onVerDetalleOrden}
          onCerrarDetalle={onCerrarDetalleOrden}
          onRecargar={onRecargarOrdenes}
          puedeGestionar={true}
          onCambiarEstado={onCambiarEstadoOrden}
          onSimularPago={onSimularPagoOrden}
          pagandoOrdenId={pagandoOrdenId}
          onCancelarOrden={onCancelarOrden}
          mensaje={mensaje}
        />
      )}

      {seccion === "usuarios" && (
        <>
          <form
            key={usuarioEditando?.userId ?? "nuevo-usuario"}
            className="form-card"
            onSubmit={guardarUsuarioAdmin}
          >
            <h2>
              {usuarioEditando
                ? "Editar perfil de usuario"
                : "Nuevo perfil de usuario"}
            </h2>
            <label>
              RUT *
              <input
                name="rut"
                required
                placeholder="12345678-9"
                defaultValue={usuarioEditando?.rut ?? ""}
              />
            </label>
            <label>
              Nombre completo *
              <input
                name="nombreCompleto"
                required
                defaultValue={usuarioEditando?.nombreCompleto ?? ""}
              />
            </label>
            <label>
              Apellido completo *
              <input
                name="apellidoCompleto"
                required
                defaultValue={usuarioEditando?.apellidoCompleto ?? ""}
              />
            </label>
            <label>
              Correo electrónico *
              <input
                name="correo"
                type="email"
                required
                defaultValue={usuarioEditando?.correo ?? ""}
              />
            </label>
            <label>
              Teléfono *
              <input
                name="telefono"
                required
                placeholder="+56 912345678"
                defaultValue={usuarioEditando?.telefono ?? ""}
              />
            </label>
            <button className="btn full" type="submit">
              {usuarioEditando ? "Guardar cambios" : "Crear usuario"}
            </button>
            {usuarioEditando && (
              <button
                type="button"
                className="btn secondary full"
                onClick={() => setUsuarioEditando(null)}
              >
                Cancelar edición
              </button>
            )}
            {mensaje && (
              <p className="success" role="status">
                {mensaje}
              </p>
            )}
          </form>

          {cargandoUsuarios && (
            <div className="notice" role="status">
              <p>Cargando usuarios y cuentas...</p>
            </div>
          )}

          {errorUsuarios && (
            <div className="notice" role="alert">
              <p className="muted">{errorUsuarios}</p>
            </div>
          )}

          <div className="table-wrap">
            <h2>Perfiles de Usuarios</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>RUT</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosAdmin.map((u) => (
                  <tr key={u.userId}>
                    <td>#{u.userId}</td>
                    <td>{u.rut}</td>
                    <td>
                      {u.nombreCompleto} {u.apellidoCompleto}
                    </td>
                    <td>{u.correo}</td>
                    <td>
                      <span className="pill">
                        {u.estado ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => setUsuarioEditando(u)}
                      >
                        Editar
                      </button>{" "}
                      <button
                        type="button"
                        className="btn danger"
                        onClick={() => eliminarUsuarioPorId(u.userId)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-wrap">
            <h2>Cuentas JWT y Roles</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cuentasAdmin.map((cuenta) => (
                  <tr key={cuenta.id}>
                    <td>#{cuenta.id}</td>
                    <td>{cuenta.email}</td>
                    <td>
                      <select
                        aria-label={`Rol de ${cuenta.email}`}
                        value={cuenta.rol}
                        onChange={(e) =>
                          cambiarRolCuenta(cuenta, e.target.value)
                        }
                      >
                        <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                        <option value="ROLE_VENDEDOR">ROLE_VENDEDOR</option>
                        <option value="ROLE_CLIENTE">ROLE_CLIENTE</option>
                      </select>
                    </td>
                    <td>
                      <span className="pill">
                        {cuenta.estado ? "ACTIVA" : "INACTIVA"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => cambiarActivoCuenta(cuenta)}
                      >
                        {cuenta.estado ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
