import { solicitar } from "./api.js";

export const productosService = {
  listar: (opciones = {}) => solicitar("/products", opciones),

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

  eliminar: (id) =>
    solicitar(`/products/${id}`, {
      method: "DELETE",
    }),
};