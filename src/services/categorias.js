import { solicitar } from "./api.js";

export const categoriasService = {
  listar: (opciones = {}) => solicitar("/categories", opciones),

  obtenerPorId: (id, opciones = {}) => solicitar(`/categories/${id}`, opciones),

  crear: (categoria) =>
    solicitar("/categories", {
      method: "POST",
      body: JSON.stringify(categoria),
    }),

  actualizar: (id, categoria) =>
    solicitar(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoria),
    }),

  desactivar: (id) =>
    solicitar(`/categories/${id}`, {
      method: "DELETE",
    }),
};
