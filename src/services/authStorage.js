import { normalizarRol } from "../logica/roles.js";

const TOKEN_KEY = "gamehubToken";
const USER_KEY = "gamehubUsuario";
export const AUTH_EXPIRED_EVENT = "gamehub:auth-expired";

export function decodificarJwt(token) {
  if (!token || typeof token !== "string") return null;
  const partes = token.split(".");
  if (partes.length < 2) return null;

  try {
    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

export function tokenEstaExpirado(token) {
  const payload = decodificarJwt(token);
  if (!payload || !payload.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

export function obtenerToken() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    if (tokenEstaExpirado(token)) {
      limpiarSesion();
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function guardarSesion(authResponse, datosExtra = {}) {
  const token = authResponse?.token;
  if (!token) return null;

  const claims = decodificarJwt(token) || {};
  const rolBruto = authResponse.rol ?? claims.roles ?? claims.role;
  const rol = normalizarRol(rolBruto);
  const email = authResponse.email ?? claims.sub ?? datosExtra.email ?? "";
  const nombre =
    datosExtra.nombre ||
    (email ? email.split("@")[0] : "Usuario GameHub");

  const expira = claims.exp ? claims.exp * 1000 : null;
  const emitido = claims.iat ? claims.iat * 1000 : expira;

  const sesion = {
    id: authResponse.id ?? claims.userId ?? null,
    userId: datosExtra.userId ?? null,
    nombre,
    apellido: datosExtra.apellido ?? "",
    rut: datosExtra.rut ?? "",
    telefono: datosExtra.telefono ?? "",
    email,
    rol,
    rolRaw: rolBruto,
    expira,
    emitido,
  };

  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(sesion));
  } catch {
    // Entornos sin storage persistente
  }

  return sesion;
}

export function actualizarUsuarioLocal(parcial) {
  const actual = leerSesion();
  if (!actual) return null;
  const actualizado = { ...actual, ...parcial };
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(actualizado));
  } catch {
    // ignore
  }
  return actualizado;
}

export function leerSesion() {
  const token = obtenerToken();
  if (!token) return null;

  const claims = decodificarJwt(token) || {};
  let guardado = null;
  try {
    guardado = JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    guardado = null;
  }

  const rol = normalizarRol(claims.roles ?? claims.role ?? guardado?.rol);
  const email = claims.sub ?? guardado?.email ?? "";

  if (!email && !rol) {
    limpiarSesion();
    return null;
  }

  const expira = claims.exp ? claims.exp * 1000 : guardado?.expira ?? null;
  const emitido = claims.iat
    ? claims.iat * 1000
    : guardado?.emitido ?? expira;

  return {
    id: guardado?.id ?? claims.userId ?? null,
    userId: guardado?.userId ?? null,
    nombre: guardado?.nombre || (email ? email.split("@")[0] : "Usuario"),
    apellido: guardado?.apellido ?? "",
    rut: guardado?.rut ?? "",
    telefono: guardado?.telefono ?? "",
    email,
    rol,
    rolRaw: guardado?.rolRaw ?? claims.roles ?? null,
    expira,
    emitido,
  };
}

export function limpiarSesion() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

export function notificarSesionExpirada(motivo) {
  limpiarSesion();
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(AUTH_EXPIRED_EVENT, { detail: { motivo } }),
    );
  }
}
