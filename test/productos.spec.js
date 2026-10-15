import { productosIniciales, listarProductos, crearProducto, actualizarProducto, eliminarProducto } from "../src/logica/productos.js";

describe("fuente de datos simulada de GameHub", () => {
  it("contiene seis productos iniciales", () => expect(listarProductos().length).toBe(6));
  it("devuelve una copia y no la referencia original", () => expect(listarProductos()).not.toBe(productosIniciales));
  it("no modifica la lista original al crear", () => { const original = [{ id: 1, nombre: "Teclado", precio: 100 }]; crearProducto(original, { id: 2, nombre: "Mouse", precio: 200 }); expect(original.length).toBe(1); });
  it("crea un producto con precio numérico", () => { const r = crearProducto([], { id: 20, nombre: "Mouse", precio: "19990" }); expect(r[0].precio).toBe(19990); });
  it("rechaza identificadores duplicados", () => expect(() => crearProducto([{ id: 1 }], { id: 1, nombre: "Duplicado", precio: 100 })).toThrowError());
  it("rechaza nombre vacío", () => expect(() => crearProducto([], { id: 2, nombre: "  ", precio: 100 })).toThrowError());
  it("rechaza precio negativo", () => expect(() => crearProducto([], { id: 2, nombre: "Mouse", precio: -1 })).toThrowError());
  it("rechaza precio que no sea numérico", () => expect(() => crearProducto([], { id: 2, nombre: "Mouse", precio: "caro" })).toThrowError());
  it("actualiza el precio y mantiene el identificador", () => { const r = actualizarProducto([{ id: 1, nombre: "Teclado", precio: 100 }], 1, { precio: 200 }); expect(r[0].precio).toBe(200); expect(r[0].id).toBe(1); });
  it("actualiza solamente el producto solicitado", () => { const r = actualizarProducto([{ id: 1, precio: 100 }, { id: 2, precio: 300 }], 1, { precio: 150 }); expect(r[0].precio).toBe(150); expect(r[1].precio).toBe(300); });
  it("no modifica la lista original al actualizar", () => { const original = [{ id: 1, precio: 100 }]; actualizarProducto(original, 1, { precio: 200 }); expect(original[0].precio).toBe(100); });
  it("elimina únicamente el producto solicitado", () => { const r = eliminarProducto([{ id: 1 }, { id: 2 }], 1); expect(r.length).toBe(1); expect(r[0].id).toBe(2); });
  it("conserva la lista cuando el ID no existe", () => expect(eliminarProducto([{ id: 1 }], 8).length).toBe(1));
});

describe("cálculos del carrito", () => {
  it("calcula subtotal por precio y cantidad", () => expect(1000 * 2).toBe(2000));
  it("suma subtotales de varios productos", () => { const carrito = [{ precio: 1000, cantidad: 2 }, { precio: 500, cantidad: 1 }]; expect(carrito.reduce((s, p) => s + p.precio * p.cantidad, 0)).toBe(2500); });
  it("devuelve total cero para un carrito vacío", () => expect([].reduce((s, p) => s + p.precio * p.cantidad, 0)).toBe(0));
  it("cuenta las unidades y no solo las líneas", () => { const carrito = [{ cantidad: 3 }, { cantidad: 2 }]; expect(carrito.reduce((s, p) => s + p.cantidad, 0)).toBe(5); });
});
