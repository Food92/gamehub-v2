import {
  obtenerToken,
  notificarSesionExpirada,
} from "./authStorage.js";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8091/api/v1"
).replace(/\/$/, "");

const MENSAJES_ESTADO = {
  400: "Revisa los datos enviados en el formulario.",
  401: "Tu sesión expiró o las credenciales no son válidas (401).",
  403: "No tienes permisos suficientes para realizar esta acción (403).",
  404: "No encontramos el recurso solicitado (404).",
  409: "La operación no se puede realizar con el estado actual (409).",
  422: "La operación fue rechazada por una regla de negocio (422).",
  500: "El servidor tuvo un problema interno. Intenta nuevamente (500).",
};

function extraerMensajeError(errorApi, status) {
  if (errorApi && typeof errorApi === "object") {
    if (errorApi.fields && typeof errorApi.fields === "object") {
      const detalle = Object.entries(errorApi.fields)
        .map(([campo, msg]) => `${campo}: ${msg}`)
        .join(" | ");
      if (detalle) return detalle;
    }
    if (errorApi.mensaje) return errorApi.mensaje;
    if (errorApi.message) return errorApi.message;
    if (errorApi.error) return errorApi.error;

    const valores = Object.values(errorApi).filter((v) => typeof v === "string");
    if (valores.length > 0) return valores.join(" | ");
  }

  return (
    MENSAJES_ESTADO[status] ||
    (status >= 500 ? MENSAJES_ESTADO[500] : `Error HTTP ${status}`)
  );
}

export async function solicitar(ruta, opciones = {}) {
  if (!API_URL) {
    throw new Error("Falta configurar VITE_API_URL en .env.development");
  }

  const { headers = {}, skipAuth = false, ...config } = opciones;
  const token = skipAuth ? null : obtenerToken();

  const cabeceras = {
    Accept: "application/json",
    ...headers,
  };

  if (config.body !== undefined && !cabeceras["Content-Type"]) {
    cabeceras["Content-Type"] = "application/json";
  }

  if (token && !cabeceras.Authorization) {
    cabeceras.Authorization = `Bearer ${token}`;
  }

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...config,
      headers: cabeceras,
    });
  } catch (errorRed) {
    if (errorRed?.name === "AbortError") throw errorRed;
    const error = new Error(
      "No pudimos conectar con el servidor. Verifica que el API Gateway (puerto 8091) esté encendido.",
    );
    error.status = 0;
    throw error;
  }

  if (!respuesta.ok) {
    const errorApi = await respuesta.json().catch(() => ({}));
    const mensaje = extraerMensajeError(errorApi, respuesta.status);

    if (respuesta.status === 401 && !skipAuth && token) {
      notificarSesionExpirada(mensaje);
    }

    const error = new Error(mensaje);
    error.status = respuesta.status;
    error.data = errorApi;
    throw error;
  }

  if (respuesta.status === 204) {
    return null;
  }

  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : null;
}
