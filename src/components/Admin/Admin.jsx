import "./Admin.css";
import { formatoPrecio } from "../../hooks/useGameHub.js";

export default function Admin({
  productos = [],
  categoriasApi = [],
  productoEditando,
  guardarProducto,
  cancelarEdicion,
  mensaje,
  abrirEdicion,
  eliminarProductoPorId,
}) {
  return (
    <section>
      <h1 className="section-title">Administración de productos</h1>
      <p className="muted center">
        Panel académico: crea, edita y elimina productos del catálogo.
      </p>

      <form className="form-card" onSubmit={guardarProducto}>
        <h2>{productoEditando ? "Editar producto" : "Nuevo producto"}</h2>

        <label>
          Nombre *
          <input
            name="nombre"
            required
            defaultValue={productoEditando?.nombre ?? ""}
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
            min="0"
            required
            defaultValue={productoEditando?.precio ?? ""}
          />
        </label>

        <label>
          Descripción
          <input
            name="descripcion"
            defaultValue={productoEditando?.descripcion ?? ""}
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
              <th>Categoría</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>{producto.categoria}</td>
                <td>{formatoPrecio(producto.precio)}</td>
                <td>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => abrirEdicion(producto)}
                  >
                    Editar
                  </button>{" "}
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
    </section>
  );
}