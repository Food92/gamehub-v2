// Esta lista hace de pequeña base de datos mientras trabajamos en el frontend.
// En una tienda real, estos datos vendrían de una API y se guardarían en un servidor.
export const productosIniciales = [
  { id: 1, nombre: "Notebook Gamer Asus ROG Strix", categoria: "Notebooks", precio: 1199990, imagen: "/img/notebook.jpg.webp", descripcion: "Intel i7, RTX 4060, 16GB RAM, SSD 512GB.", oferta: false, caracteristicas: ["Procesador Intel Core i7", "16 GB de memoria RAM", "SSD de 512 GB", "Tarjeta gráfica RTX 4060"] },
  { id: 2, nombre: "NVIDIA GeForce RTX 4070 12GB", categoria: "Tarjetas Gráficas", precio: 699990, imagen: "/img/rtx4070.jpg", descripcion: "DLSS 3 y Ray Tracing para juegos en 1440p y 4K.", oferta: false, caracteristicas: ["12 GB de memoria GDDR6X", "Tecnología DLSS 3", "Ray Tracing", "Ideal para 1440p y 4K"] },
  { id: 3, nombre: "Procesador AMD Ryzen 7 7800X3D", categoria: "Procesadores", precio: 449990, imagen: "/img/ryzen.jpg", descripcion: "Socket AM5 con tecnología 3D V-Cache para alto rendimiento.", oferta: false, caracteristicas: ["8 núcleos y 16 hilos", "Socket AM5", "Tecnología 3D V-Cache", "Alto rendimiento para gaming"] },
  { id: 4, nombre: "Teclado Mecánico Redragon K552", categoria: "Periféricos", precio: 49990, imagen: "/img/teclado.jpg", descripcion: "Switches mecánicos, formato TKL y retroiluminación RGB.", oferta: true, caracteristicas: ["Formato TKL compacto", "Switches mecánicos", "Retroiluminación RGB", "Conexión USB"] },
  { id: 5, nombre: "Monitor Gamer Samsung Odyssey G5 27''", categoria: "Monitores", precio: 219990, imagen: "/img/monitor.jpg", descripcion: "Panel curvo QHD, 144Hz de refresco y 1ms de respuesta.", oferta: true, caracteristicas: ["Pantalla curva de 27 pulgadas", "Resolución QHD", "Frecuencia de 144 Hz", "Tiempo de respuesta de 1 ms"] },
  { id: 6, nombre: "Consola PlayStation 5 Slim 1TB", categoria: "Consolas", precio: 549990, imagen: "/img/ps5.jpg", descripcion: "Consola de última generación con almacenamiento SSD ultra rápido.", oferta: false, caracteristicas: ["Almacenamiento SSD de 1 TB", "Resolución hasta 4K", "Control inalámbrico DualSense", "Compatible con juegos de PS5"] },
];

// Las funciones trabajan con copias para no modificar directamente los datos originales.
export const listarProductos = (lista = productosIniciales) => [...lista];

export function crearProducto(lista, producto) {
  if (!producto.nombre?.trim()) throw new Error("El nombre es obligatorio");
  if (!Number.isFinite(Number(producto.precio)) || Number(producto.precio) < 0) throw new Error("El precio debe ser válido");
  if (lista.some((item) => item.id === producto.id)) throw new Error("El ID ya existe");
  return [...lista, { ...producto, precio: Number(producto.precio) }];
}

export function actualizarProducto(lista, id, cambios) {
  return lista.map((item) => item.id === id ? { ...item, ...cambios, id, precio: cambios.precio === undefined ? item.precio : Number(cambios.precio) } : item);
}

export function eliminarProducto(lista, id) {
  return lista.filter((item) => item.id !== id);
}
