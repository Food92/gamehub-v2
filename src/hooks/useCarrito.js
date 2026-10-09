// src/hooks/useCarrito.js
import { useState, useEffect } from "react";

const CLAVE_CARRITO = "gamehubCarrito";

export function useCarrito() {
  // Estado inicial cargado desde localStorage
  const [items, setItems] = useState(() => {
    const guardado = localStorage.getItem(CLAVE_CARRITO);
    return guardado ? JSON.parse(guardado) : [];
  });

  // Guardar cambios en localStorage cada vez que items cambie
  useEffect(() => {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
  }, [items]);

  // Funciones de control
  const agregarItem = (producto) => {
    const existente = items.find((p) => p.id === producto.id);
    if (existente) {
      setItems(
        items.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p,
        ),
      );
    } else {
      setItems([...items, { ...producto, cantidad: 1 }]);
    }
  };

  const restarItem = (id) => {
    setItems(
      items
        .map((p) => (p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p))
        .filter((p) => p.cantidad > 0),
    );
  };

  const eliminarItem = (id) => {
    setItems(items.filter((p) => p.id !== id));
  };

  const vaciarCarrito = () => setItems([]);

  const cantidadTotal = items.reduce((acc, p) => acc + p.cantidad, 0);

  const totalPrecio = items.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  return {
    items,
    agregarItem,
    restarItem,
    eliminarItem,
    vaciarCarrito,
    cantidadTotal,
    totalPrecio,
  };
}
