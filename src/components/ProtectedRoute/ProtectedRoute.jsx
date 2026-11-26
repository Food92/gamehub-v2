import { useEffect } from "react";

/**
 * Guard de rutas basado en roles.
 * Si el rol actual no está autorizado, bloquea el renderizado del DOM y redirige.
 */
export default function ProtectedRoute({
  permitido,
  redirigirA,
  onRedirigir,
  children,
}) {
  useEffect(() => {
    if (!permitido && typeof onRedirigir === "function") {
      onRedirigir(redirigirA);
    }
  }, [permitido, redirigirA, onRedirigir]);

  if (!permitido) {
    return null;
  }

  return children;
}
