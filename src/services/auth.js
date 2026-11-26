import { solicitar } from "./api.js";

export const authService = {
  login: ({ email, password }) =>
    solicitar("/auth/login", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    }),

  register: ({ email, password }) =>
    solicitar("/auth/register", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    }),

  me: (opciones = {}) => solicitar("/cuentas/me", opciones),

  renovar: () =>
    solicitar("/auth/renovar", {
      method: "POST",
    }),

  listarCuentas: (opciones = {}) => solicitar("/cuentas", opciones),

  actualizarCuenta: (id, payload) =>
    solicitar(`/cuentas/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  cambiarActivoCuenta: (id, activo) =>
    solicitar(`/cuentas/${id}/activo`, {
      method: "PATCH",
      body: JSON.stringify({ activo }),
    }),
};
