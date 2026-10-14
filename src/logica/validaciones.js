// Funciones puras reutilizables para validar formularios de GameHub.
export function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').trim());
}
export function validarRegistro({ nombre, email, clave, confirmar }) {
  return Boolean(String(nombre ?? '').trim()) && validarEmail(email) && String(clave ?? '').length >= 6 && clave === confirmar;
}
export function validarProducto(producto) {
  return Boolean(String(producto?.nombre ?? '').trim()) && Number.isFinite(Number(producto?.precio)) && Number(producto.precio) >= 0;
}
