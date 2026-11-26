import { solicitar } from "./api.js";

export const ordenesService = {
  listar: (opciones = {}) => solicitar("/orders", opciones),

  obtenerPorId: (orderId, opciones = {}) =>
    solicitar(`/orders/${orderId}`, opciones),

  listarPorUsuario: (userId, opciones = {}) =>
    solicitar(`/orders/user/${userId}`, opciones),

  validarCarrito: ({ items, promotionCode = null }, opciones = {}) =>
    solicitar("/orders/carrito/validar", {
      ...opciones,
      method: "POST",
      body: JSON.stringify({ items, promotionCode }),
    }),

  validarCupon: (codigo, subtotal, opciones = {}) =>
    solicitar(
      `/promotions/validar?codigo=${encodeURIComponent(codigo)}&subtotal=${encodeURIComponent(subtotal)}`,
      opciones,
    ),

  crear: (orderDTO) =>
    solicitar("/orders", {
      method: "POST",
      body: JSON.stringify(orderDTO),
    }),

  cambiarEstado: (orderId, estado) =>
    solicitar(
      `/orders/${orderId}/estado?estado=${encodeURIComponent(estado)}`,
      { method: "PATCH" },
    ),

  cancelar: (orderId) =>
    solicitar(`/orders/${orderId}/cancelar`, {
      method: "DELETE",
    }),
};
