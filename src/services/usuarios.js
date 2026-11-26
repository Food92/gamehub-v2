import { solicitar } from "./api.js";

export const usuariosService = {
  listar: (opciones = {}) => solicitar("/users", opciones),

  obtenerPorId: (userId, opciones = {}) =>
    solicitar(`/users/${userId}`, opciones),

  buscarPorCorreo: (correo, opciones = {}) =>
    solicitar(`/users/correo?correo=${encodeURIComponent(correo)}`, opciones),

  crear: (userDTO) =>
    solicitar("/users", {
      method: "POST",
      body: JSON.stringify(userDTO),
    }),

  actualizar: (userId, user) =>
    solicitar(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(user),
    }),

  eliminar: (userId) =>
    solicitar(`/users/${userId}`, {
      method: "DELETE",
    }),

  desactivar: (userId) =>
    solicitar(`/users/${userId}/deactivate`, {
      method: "PATCH",
    }),
};
