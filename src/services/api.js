const API_URL = import.meta.env.VITE_API_URL;

export async function solicitar(ruta, opciones = {}) {
  if (!API_URL) {
    throw new Error("Falta configurar VITE_API_URL en .env.development");
  }

  const { headers = {}, ...config } = opciones;

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...config,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (!respuesta.ok) {
    const errorApi = await respuesta.json().catch(() => ({}));
    throw new Error(
      errorApi.mensaje || errorApi.message || `Error HTTP ${respuesta.status}`,
    );
  }

  if (respuesta.status === 204) {
    return null;
  }

  return respuesta.json();
}