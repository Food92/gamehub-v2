import { solicitar } from "./api.js";

export const productosService = {
  listar: (opciones = {}) => solicitar("/products", opciones),

  obtenerPorId: (id, opciones = {}) => solicitar(`/products/${id}`, opciones),

  consultarStock: (productoIds = [], opciones = {}) => {
    if (!productoIds.length) return Promise.resolve([]);
    const ids = productoIds.join(",");
    return solicitar(`/inventories/stock?productoIds=${encodeURIComponent(ids)}`, opciones);
  },

  crear: (producto) =>
    solicitar("/products", {
      method: "POST",
      body: JSON.stringify(producto),
    }),

  actualizar: (id, producto) =>
    solicitar(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(producto),
    }),

  cambiarActivo: (id, activo) =>
    solicitar(`/products/${id}/activo`, {
      method: "PATCH",
      body: JSON.stringify({ activo }),
    }),

  eliminar: (id) =>
    solicitar(`/products/${id}`, {
      method: "DELETE",
    }),
};
