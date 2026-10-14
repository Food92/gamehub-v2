import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Catalogo from './Catalogo.jsx';

describe('componente Catalogo', () => {
  let host;
  let root;
  const formatoPrecio = (precio) => `$${precio}`;
  const productos = [
    { id: 1, nombre: 'Teclado gamer', categoria: 'Periféricos', precio: 10000, imagen: '/img/teclado.jpg', descripcion: 'Teclado mecánico', oferta: false },
    { id: 2, nombre: 'Monitor gamer', categoria: 'Monitores', precio: 20000, imagen: '/img/monitor.jpg', descripcion: 'Monitor QHD', oferta: true },
  ];

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
  });

  it('renderiza una tarjeta por producto recibido', () => {
    act(() => root.render(<Catalogo productos={productos} formatoPrecio={formatoPrecio} onAgregar={() => {}} onVerCaracteristicas={() => {}} />));
    expect(host.querySelectorAll('.product').length).toBe(2);
  });

  it('muestra el nombre de cada producto recibido por props', () => {
    act(() => root.render(<Catalogo productos={productos} formatoPrecio={formatoPrecio} onAgregar={() => {}} onVerCaracteristicas={() => {}} />));
    expect(host.textContent).toContain('Teclado gamer');
    expect(host.textContent).toContain('Monitor gamer');
  });

  it('muestra un mensaje cuando la lista está vacía', () => {
    act(() => root.render(<Catalogo productos={[]} formatoPrecio={formatoPrecio} onAgregar={() => {}} onVerCaracteristicas={() => {}} />));
    expect(host.textContent).toContain('No encontramos productos');
    expect(host.querySelectorAll('.product').length).toBe(0);
  });

  it('llama a la función de agregar con el producto correcto', () => {
    const onAgregar = jasmine.createSpy('onAgregar');
    act(() => root.render(<Catalogo productos={[productos[0]]} formatoPrecio={formatoPrecio} onAgregar={onAgregar} onVerCaracteristicas={() => {}} />));
    const boton = [...host.querySelectorAll('button')].find((item) => item.textContent.includes('Agregar al carrito'));
    act(() => boton.click());
    expect(onAgregar).toHaveBeenCalledOnceWith(productos[0]);
  });

  it('llama al callback de características con el producto seleccionado', () => {
    const onVerCaracteristicas = jasmine.createSpy('onVerCaracteristicas');
    act(() => root.render(<Catalogo productos={[productos[0]]} formatoPrecio={formatoPrecio} onAgregar={() => {}} onVerCaracteristicas={onVerCaracteristicas} />));
    const boton = [...host.querySelectorAll('button')].find((item) => item.textContent.includes('Ver características'));
    act(() => boton.click());
    expect(onVerCaracteristicas).toHaveBeenCalledOnceWith(productos[0]);
  });
});
