# Cobertura funcional de pruebas

## Entorno
Karma (`karma.conf.cjs`) usa Jasmine, esbuild y Chrome. Descubre `src/**/*.spec.js` y `test/**/*.spec.js`. Ejecutar con `npm test` (requiere Google Chrome). `npm run test:watch` sirve para ejecucion iterativa.

## Matriz de cobertura

| Area | Archivo | Casos cubiertos |
|---|---|---|
| Catalogo React | `src/components/Catalogo/Catalogo.spec.js` | 5: tarjetas, props/nombres, lista vacia, callback agregar y callback caracteristicas. |
| Tarjeta React | `src/components/Catalogo/TarjetaProducto.spec.js` | 5: contenido por props, oferta visible/oculta, callback agregar y detalle. |
| Validaciones | `src/logica/validaciones.spec.js` | 13: correo, registro y validacion de producto, incluidos errores y limites. |
| Productos | `test/productos.spec.js` | CRUD inmutable, rechazos de datos invalidos y ejemplos de calculos del carrito. |

Las dos suites React suman 10 pruebas directas de componentes: verifican DOM, paso de propiedades e interacciones. `jasmine.createSpy` se usa como mock de callbacks para comprobar llamadas y argumentos sin ejecutar otros componentes.

## Proceso
1. Mantener reglas faciles de aislar en `src/logica/`.
2. Renderizar componentes en un contenedor DOM y desmontarlos tras cada prueba.
3. Sustituir callbacks por spies y verificar su contrato.
4. Ejecutar con Karma/Jasmine y Chrome; revisar fallos por suite.
5. Agregar casos limite al cambiar una regla o interaccion.

## Limites
Esta es cobertura funcional por comportamiento, no un porcentaje de lineas o ramas. No se configura karma-coverage ni se genera reporte porcentual. Registro, Contacto y el hook principal no tienen pruebas dedicadas. Cuatro ejemplos de carrito en `test/productos.spec.js` prueban calculos con datos literales; no llaman una funcion de produccion, pues los calculos viven en `useGameHub`. Indicar estas limitaciones en la presentacion.
