# ERS - GameHub Store

## Proposito y alcance
Tienda demostrativa frontend de hardware, consolas y perifericos gamer hecha con React. Permite consultar catalogo, filtrar, usar carrito, simular registro/compra, consultar detalles y administrar productos.

## Usuarios
- Visitante: consulta y filtra el catalogo, agrega articulos al carrito.
- Usuario demo: registra datos localmente y consulta su perfil.
- Administrador demo: crea, edita o elimina productos.

## Requisitos funcionales
- RF-01 Mostrar productos con nombre, categoria, descripcion, imagen y precio.
- RF-02 Filtrar por texto/categoria y mostrar mensaje para resultados vacios.
- RF-03 Ver caracteristicas y detalle del producto.
- RF-04 Agregar, incrementar, reducir y quitar articulos; calcular el total.
- RF-05 Guardar catalogo, carrito, usuario y pedido en localStorage.
- RF-06 Validar nombre, correo, clave minima de 6 caracteres y confirmacion.
- RF-07 Mantener operaciones locales de alta, edicion y eliminacion de productos.
- RF-08 Simular compra exitosa o fallida y mostrar resultado.
- RF-09 Validar contacto sin enviar correo real.
- RF-10 Navegar entre vistas usando hash del navegador.

## Requisitos no funcionales
- RNF-01 Interfaz React con componentes funcionales reutilizables.
- RNF-02 Bootstrap 5.3.8 responsive: 1 columna en movil, 2 desde sm, 3 desde lg y 4 desde xl.
- RNF-03 Reglas de validacion aisladas para facilitar pruebas.
- RNF-04 Pruebas unitarias con Jasmine y Karma en Chrome.
- RNF-05 Texto alternativo, etiquetas y roles accesibles cuando corresponda.

## Arquitectura y datos
App compone Header, VistaActual, Footer y modal. Catalogo crea TarjetaProducto por elemento. useGameHub concentra estados y acciones. productos.js y validaciones.js contienen reglas. localStorage guarda datos demo en el dispositivo.

## Restricciones
Demo frontend sin API, base de datos, autenticacion segura ni pasarela de pago. No almacenar datos sensibles. Bootstrap se descarga de jsDelivr y requiere internet. La informacion es local al navegador.

## Aceptacion
Las vistas React principales funcionan, el catalogo se adapta a breakpoints, las pruebas Jasmine cubren interacciones clave y Karma ejecuta las suites en Chrome. No declarar porcentaje de cobertura sin reporte instrumentado.
