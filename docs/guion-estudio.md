# Guion explicado para estudiar la presentacion

Duracion sugerida: 7-9 minutos. La rubrica entrega 100% entre ocho indicadores; usa los porcentajes para priorizar. Personaliza el parrafo indicado con lo que hiciste realmente. Los fragmentos son ejemplos breves del proyecto entregado.

## 1. IE2.1.1 - Framework frontend (10%)

“GameHub Store es una tienda web frontend construida con React. React permite dividir la interfaz en componentes reutilizables y volver a renderizar las partes que cambian cuando cambia el estado. Vite entrega el servidor de desarrollo y el proceso de build. La aplicacion parte en `src/main.jsx`: `createRoot` conecta React con el elemento `#root` de `index.html` y monta `App` dentro de `StrictMode`.

“En `src/App.jsx`, `App` funciona como componente principal: crea el estado compartido con `useGameHub`, dibuja `Header`, `VistaActual` y `Footer`, y muestra el acceso flotante al carrito y el modal. `VistaActual.jsx` decide que pantalla mostrar segun `pagina`. Por ejemplo, si la pagina es `catalogo`, presenta filtros y el componente `Catalogo`; si es `carrito`, presenta `Carrito`; y si es `registro`, presenta `Registro`. Esta separacion hace que cada vista tenga una responsabilidad clara.”

**Para mostrar:** abre `main.jsx`, `App.jsx` y `VistaActual.jsx`; señala como el componente principal compone componentes menores.

## 2. IE2.1.2 - Componentes, props, estado y Bootstrap (10%)

“En `Catalogo.jsx`, `productos` y `formatoPrecio` son props: datos que el componente recibe. Para cada producto, Catalogo crea una `TarjetaProducto` y le pasa el objeto producto y los callbacks `onAgregar`, `onVerDetalle` y `onVerCaracteristicas`. La tarjeta presenta nombre, categoria, descripcion, imagen y precio. Cuando el usuario pulsa un boton, la tarjeta llama al callback recibido. Asi el componente visual no necesita conocer toda la logica de la tienda.

“El estado compartido esta en `src/hooks/useGameHub.js`. `useState` conserva valores que pueden cambiar, como `pagina`, `productos`, `carrito`, `usuario`, `busqueda` y `categoria`. `useEffect` sincroniza algunos con `localStorage` y escucha el evento `hashchange`. `useMemo` calcula `productosVisibles` a partir de productos, categoria y busqueda. Al agregar un producto, se usa una actualizacion basada en el estado anterior: si ya estaba en el carrito aumenta la cantidad; si no, lo incorpora con cantidad uno.

“Bootstrap se carga desde `index.html`. En `App.jsx`, `container-fluid` y las utilidades `px-3 px-md-4 px-xl-5` ajustan el contenedor. En `Catalogo.jsx`, `row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4` cambia las columnas segun el breakpoint: una en movil, dos en pantallas pequenas, tres en grandes y cuatro en extra grandes. Las clases propias conservan la identidad visual.”

**Para mostrar:** redimensiona el navegador y señala el catalogo; luego muestra las props en Catalogo/TarjetaProducto y los estados en `useGameHub.js`.

## 3. IE2.2.1 - Pruebas unitarias frontend con Jasmine y Karma (12%)

“Las pruebas de componentes estan en `src/components/Catalogo/Catalogo.spec.js` y `TarjetaProducto.spec.js`. Cada suite prepara un contenedor real del DOM, monta el componente con `createRoot` y `act`, y lo desmonta en `afterEach`. Esto evita que el contenido de una prueba contamine la siguiente.

“Las cinco pruebas de Catalogo verifican que renderice una tarjeta por producto, muestre los nombres recibidos por props, presente un mensaje si la lista esta vacia y llame correctamente a los callbacks de agregar y caracteristicas. Las cinco de TarjetaProducto revisan nombre/descripcion/precio, la etiqueta de oferta visible u oculta, y los callbacks de agregar y detalle. Son diez pruebas directas de componentes.”

**Para mostrar:** abre una prueba de callback y explica que pulsa el boton y comprueba la funcion y el producto recibido.

## 4. IE2.3.1 - Proceso de testeo, mocks, resultados y cobertura (8%)

“`karma.conf.cjs` configura Jasmine como framework de pruebas, esbuild para transformar los archivos JSX y Chrome como navegador. Los patrones `src/**/*.spec.js` y `test/**/*.spec.js` indican que suites cargar. El comando `npm test` ejecuta Karma en modo de una sola corrida.

“Un mock sustituye una dependencia para probar una unidad de forma aislada. En las pruebas de React usamos `jasmine.createSpy` como mock de callbacks. Por ejemplo, el spy `onAgregar` registra si fue llamado y con que producto, sin ejecutar la logica completa del carrito. No afirmo que exista un mock de API: esta demo no se conecta a un servidor.

“Hay pruebas adicionales para las funciones puras de `validaciones.js` y `productos.js`. Al analizar resultados, se revisa el resumen de Karma: cuantas pruebas pasaron o fallaron y en que suite; si falla, se mira la asercion y el comportamiento esperado. La cobertura documentada es funcional, organizada por comportamiento. El proyecto no tiene `karma-coverage`, por lo que no genera un porcentaje de lineas o ramas. La matriz de `docs/cobertura-testing.md` deja clara esa diferencia.”

**Antes de exponer:** ejecuta `npm test` con Chrome instalado y anota el resultado real. No inventes el total de pruebas exitosas ni un porcentaje de cobertura.

## 5. IE2.1.3 - Exponer el diseno frontend (15%)

“Para construir la tienda, primero separamos las responsabilidades: `main.jsx` inicia React; `App.jsx` compone el marco general; `VistaActual.jsx` enruta a las pantallas; los componentes de `components/` representan cada parte visual; el hook concentra las interacciones; y `logica/` contiene reglas que no dependen del DOM. Esta organizacion permite explicar y mantener cada parte por separado. La navegacion usa fragmentos hash, por ejemplo `#catalogo` o `#carrito`, y el hook escucha cambios de ruta.”

**Demostracion sugerida:** clic Inicio -> Catalogo -> filtro categoria -> detalle o caracteristicas -> agregar al carrito. Explica que cada accion cambia una vista o un estado.

## 6. IE2.1.4 - Proceso de componentes, estado y Bootstrap (20%)

“Un ejemplo es el flujo de catalogo. `VistaActual` toma `productosVisibles` del hook y los pasa como prop a `Catalogo`. Catalogo recorre el arreglo con `map` y usa `producto.id` como `key`, que ayuda a React a identificar cada elemento. Para cada elemento renderiza `TarjetaProducto`. La tarjeta recibe el producto y los callbacks como props. El estado de busqueda y categoria sigue centralizado en el hook; por eso los filtros actualizan la lista sin que cada tarjeta duplique estado.

“`useGameHub` deriva `categorias` de los productos y usa `useMemo` para filtrar. El carrito se calcula con `reduce`: `cantidadTotal` suma unidades y `total` suma precio por cantidad. Las funciones devueltas por el hook se entregan a las vistas para que estas indiquen que accion ocurrio. Bootstrap aporta la estructura responsive del catalogo, y los estilos propios controlan colores y apariencia.”

**Demostracion sugerida:** buscar “monitor”, elegir una categoria, agregar dos unidades y mostrar que cambia el contador y el total.

## 7. IE2.2.2 - Demostrar pruebas Jasmine/Karma (15%)

“Voy a mostrar `TarjetaProducto.spec.js`. La primera prueba entrega un objeto producto y una funcion de formato como props y verifica que aparezcan nombre, descripcion y precio en el DOM. Otra prueba cambia `oferta` a falso y confirma que no se muestre la etiqueta. En la prueba del callback, el spy se pasa como `onAgregar`, se busca el boton en el DOM, se hace clic dentro de `act` y se espera que se haya llamado una vez con el producto esperado.

“En Catalogo tambien se prueba la lista vacia y que el numero de tarjetas coincida con la lista recibida. Estas pruebas verifican logica visible e interaccion del DOM, no solo que el archivo exista.”

**Para mostrar:** abre la suite en el editor y, si ejecutaste `npm test`, muestra el resumen autentico de Karma en la terminal.

## 8. IE2.3.2 - Explicar configuracion, mocks y analisis (10%)

“Mi proceso es: primero separo la regla o componente a probar; preparo entradas conocidas; ejecuto la suite en el entorno configurado; comparo el resultado observado con una expectativa; y analizo fallos antes de aceptar el cambio. Para el DOM, creo y limpio un contenedor por prueba. Para callbacks, uso spies como mocks. Para validaciones, pruebo entradas validas e invalidas directamente porque son funciones puras.

“Las limitaciones actuales son que Registro, Contacto y el hook principal aun no tienen suites dedicadas, y no se genera cobertura porcentual. Como siguientes mejoras agregaria pruebas para esos flujos y configuraria un reporte de cobertura. Las operaciones de registro, contacto y compra son demos locales: no hay autenticacion, envio de correo ni procesamiento de pago real.”

## Cierre personal

“Mi aporte concreto al proyecto fue [indica solamente tareas que realizaste: componente, estilos, pruebas, documentacion o integracion]. Aprendi que separar interfaz, estado y reglas facilita tanto la reutilizacion como las pruebas. Como mejora prioritaria, ampliaria las pruebas de formularios y del hook, y generaria un reporte medible de cobertura.”

## Preguntas probables y respuestas

**Que diferencia hay entre props y estado?** Props son valores y funciones que el padre entrega al componente; el estado es informacion que cambia durante la ejecucion y provoca un nuevo render.

**Por que usar `useMemo`?** Para reutilizar el resultado del filtro mientras sus dependencias (`productos`, `categoria`, `busqueda`) no cambien. No reemplaza la correccion del filtro.

**Que hace Karma y que hace Jasmine?** Karma ejecuta las suites en un navegador y coordina su carga; Jasmine define suites, pruebas, espias y expectativas.

**Que mock se usa?** `jasmine.createSpy` reemplaza callbacks como `onAgregar`, permitiendo verificar llamadas y argumentos sin ejecutar otras capas.

**Tienen cobertura del 100%?** No hay porcentaje instrumentado configurado. Tenemos casos funcionales para componentes y logica, y la matriz describe ese alcance. No se debe afirmar un porcentaje sin reporte.

**La tienda procesa pagos o guarda usuarios en un servidor?** No. Son flujos demostrativos guardados localmente en el navegador; no se deben ingresar datos sensibles.
