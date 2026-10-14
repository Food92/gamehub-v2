import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import TarjetaProducto from './TarjetaProducto.jsx';

describe('componente TarjetaProducto', () => {
  let host;
  let root;
  const producto = {
    id: 7,
    nombre: 'Mouse gamer',
    categoria: 'Periféricos',
    precio: 19990,
    imagen: '/img/teclado.jpg',
    descripcion: 'Mouse de prueba',
    oferta: true,
    caracteristicas: ['RGB', 'USB'],
  };
  const formatoPrecio = (precio) => `$${precio}`;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
  });

  it('muestra nombre, descripción y precio recibidos por props', () => {
    act(() => root.render(<TarjetaProducto producto={producto} formatoPrecio={formatoPrecio} onAgregar={() => {}} onVerCaracteristicas={() => {}} />));
    expect(host.textContent).toContain('Mouse gamer');
    expect(host.textContent).toContain('Mouse de prueba');
    expect(host.textContent).toContain('$19990');
  });

  it('muestra la etiqueta de oferta cuando oferta es true', () => {
    act(() => root.render(<TarjetaProducto producto={producto} formatoPrecio={formatoPrecio} onAgregar={() => {}} onVerCaracteristicas={() => {}} />));
    expect(host.textContent).toContain('Oferta');
  });

  it('no muestra la etiqueta de oferta cuando oferta es false', () => {
    act(() => root.render(<TarjetaProducto producto={{ ...producto, oferta: false }} formatoPrecio={formatoPrecio} onAgregar={() => {}} onVerCaracteristicas={() => {}} />));
    expect(host.textContent).not.toContain('Oferta');
  });

  it('usa un spy como mock y envía el producto al callback de agregar', () => {
    const onAgregar = jasmine.createSpy('onAgregar');
    act(() => root.render(<TarjetaProducto producto={producto} formatoPrecio={formatoPrecio} onAgregar={onAgregar} onVerCaracteristicas={() => {}} />));
    const boton = [...host.querySelectorAll('button')].find((item) => item.textContent.includes('Agregar al carrito'));
    act(() => boton.click());
    expect(onAgregar).toHaveBeenCalledOnceWith(producto);
  });

  it('envía el producto al callback de detalle cuando se solicita', () => {
    const onVerDetalle = jasmine.createSpy('onVerDetalle');
    act(() => root.render(<TarjetaProducto producto={producto} formatoPrecio={formatoPrecio} onAgregar={() => {}} onVerCaracteristicas={() => {}} onVerDetalle={onVerDetalle} />));
    const boton = [...host.querySelectorAll('button')].find((item) => item.textContent.includes('Ver detalle'));
    act(() => boton.click());
    expect(onVerDetalle).toHaveBeenCalledOnceWith(producto);
  });
});
