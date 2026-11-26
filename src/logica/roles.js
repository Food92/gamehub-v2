export const ROLES = {
  ADMIN: "ADMIN",
  VENDEDOR: "VENDEDOR",
  CLIENTE: "CLIENTE",
};

/**
 * Normaliza el rol proveniente del JWT o del backend ("ROLE_ADMIN", "ROLE_VENDEDOR",
 * "ROLE_OPERADOR", "ROLE_CLIENTE", etc.) hacia los 3 roles del dominio UI.
 */
export function normalizarRol(rolBruto) {
  if (!rolBruto) return null;
  const valor = Array.isArray(rolBruto) ? rolBruto[0] : String(rolBruto);
  const limpio = valor.trim().toUpperCase().replace(/^ROLE_/, "");

  if (limpio === "ADMIN") return ROLES.ADMIN;
  if (limpio === "VENDEDOR" || limpio === "OPERADOR") return ROLES.VENDEDOR;
  if (limpio === "CLIENTE") return ROLES.CLIENTE;
  return limpio || null;
}

export function etiquetaRol(rol) {
  const r = normalizarRol(rol);
  if (r === ROLES.ADMIN) return "Administrador";
  if (r === ROLES.VENDEDOR) return "Vendedor";
  if (r === ROLES.CLIENTE) return "Cliente";
  return "Visitante";
}

export function esAdmin(rol) {
  return normalizarRol(rol) === ROLES.ADMIN;
}

export function esVendedor(rol) {
  return normalizarRol(rol) === ROLES.VENDEDOR;
}

export function esCliente(rol) {
  return normalizarRol(rol) === ROLES.CLIENTE;
}

/**
 * Solo invitados (antes de autenticarse para pagar) y CLIENTE usan carrito/compra.
 * ADMIN y VENDEDOR gestionan/consultan órdenes y no deben comprar ni heredar carritos.
 */
export function puedeComprarConRol(rol) {
  const r = normalizarRol(rol);
  return r === null || r === ROLES.CLIENTE;
}

/**
 * Matriz estricta de rutas permitidas por rol:
 * - ADMIN: acceso total a tienda (visualización), órdenes y panel de administración (sin carrito/checkout).
 * - VENDEDOR: ÚNICAMENTE lista/detalle de productos ("catalogo", "detalle"),
 *   lista/detalle de órdenes ("ordenes") y su perfil/cierre de sesión ("perfil").
 * - CLIENTE: ÚNICAMENTE tienda pública y flujo de compra ("inicio", "catalogo",
 *   "detalle", "ofertas", "carrito", "checkout", "resultado", "perfil", "contacto").
 * - Visitante (sin sesión): tienda pública + login/registro ("perfil", "registro").
 */
const RUTAS_POR_ROL = {
  [ROLES.ADMIN]: [
    "inicio",
    "catalogo",
    "detalle",
    "ofertas",
    "ordenes",
    "admin",
    "perfil",
    "contacto",
  ],
  [ROLES.VENDEDOR]: ["catalogo", "detalle", "ordenes", "perfil"],
  [ROLES.CLIENTE]: [
    "inicio",
    "catalogo",
    "detalle",
    "ofertas",
    "carrito",
    "checkout",
    "resultado",
    "perfil",
    "contacto",
  ],
  GUEST: [
    "inicio",
    "catalogo",
    "detalle",
    "ofertas",
    "carrito",
    "checkout",
    "resultado",
    "perfil",
    "registro",
    "contacto",
  ],
};

export function rutaPermitida(ruta, rol) {
  const r = normalizarRol(rol) ?? "GUEST";
  const permitidas = RUTAS_POR_ROL[r] ?? RUTAS_POR_ROL.GUEST;
  return permitidas.includes(ruta);
}

export function rutaPorDefecto(rol) {
  const r = normalizarRol(rol);
  if (r === ROLES.VENDEDOR) return "catalogo";
  if (r === ROLES.CLIENTE) return "catalogo";
  return "inicio";
}

/**
 * Devuelve ÚNICAMENTE los enlaces de navegación que el rol tiene permiso de ver.
 * Los elementos no permitidos no existen en el DOM.
 */
export function obtenerEnlacesNavegacion(rol) {
  const r = normalizarRol(rol);

  if (r === ROLES.ADMIN) {
    return [
      ["inicio", "Inicio"],
      ["catalogo", "Catálogo"],
      ["ofertas", "Ofertas"],
      ["ordenes", "Órdenes"],
      ["admin", "Administración"],
      ["perfil", "Perfil"],
    ];
  }

  if (r === ROLES.VENDEDOR) {
    return [
      ["catalogo", "Productos"],
      ["ordenes", "Órdenes"],
      ["perfil", "Perfil"],
    ];
  }

  if (r === ROLES.CLIENTE) {
    return [
      ["inicio", "Inicio"],
      ["catalogo", "Catálogo"],
      ["ofertas", "Ofertas"],
      ["carrito", "Carrito"],
      ["perfil", "Perfil"],
      ["contacto", "Contacto"],
    ];
  }

  return [
    ["inicio", "Inicio"],
    ["catalogo", "Catálogo"],
    ["ofertas", "Ofertas"],
    ["carrito", "Carrito"],
    ["perfil", "Iniciar sesión"],
    ["contacto", "Contacto"],
  ];
}
