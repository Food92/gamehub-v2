import { validarEmail, validarRegistro, validarProducto } from './validaciones.js';

describe('validarEmail', () => {
  it('acepta un correo válido', () => expect(validarEmail('jugador@gamehub.cl')).toBeTrue());
  it('rechaza un correo sin arroba', () => expect(validarEmail('jugadorgamehub.cl')).toBeFalse());
  it('rechaza un correo sin dominio', () => expect(validarEmail('jugador@')).toBeFalse());
  it('recorta espacios externos antes de validar', () => expect(validarEmail(' jugador@gamehub.cl ')).toBeTrue());
});

describe('validarRegistro', () => {
  const correcto = { nombre: 'Ana', email: 'ana@test.cl', clave: '123456', confirmar: '123456' };
  it('acepta datos completos y válidos', () => expect(validarRegistro(correcto)).toBeTrue());
  it('rechaza nombre vacío', () => expect(validarRegistro({ ...correcto, nombre: ' ' })).toBeFalse());
  it('rechaza email inválido', () => expect(validarRegistro({ ...correcto, email: 'no-es-correo' })).toBeFalse());
  it('rechaza contraseñas con menos de seis caracteres', () => expect(validarRegistro({ ...correcto, clave: '123', confirmar: '123' })).toBeFalse());
  it('rechaza contraseñas diferentes', () => expect(validarRegistro({ ...correcto, confirmar: '654321' })).toBeFalse());
});

describe('validarProducto', () => {
  it('acepta nombre y precio válido', () => expect(validarProducto({ nombre: 'Mouse', precio: 19990 })).toBeTrue());
  it('rechaza nombre vacío', () => expect(validarProducto({ nombre: ' ', precio: 100 })).toBeFalse());
  it('rechaza precio negativo', () => expect(validarProducto({ nombre: 'Mouse', precio: -1 })).toBeFalse());
  it('rechaza precio no numérico', () => expect(validarProducto({ nombre: 'Mouse', precio: 'abc' })).toBeFalse());
});
