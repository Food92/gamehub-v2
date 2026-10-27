# GameHub Store - Evaluacion Parcial 2

Tienda demostrativa de hardware y productos gamer construida con React y Vite. `useGameHub` concentra estado y acciones. Bootstrap 5.3.8 se carga desde jsDelivr y la grilla del catalogo usa breakpoints responsive. Los datos demo se persisten en localStorage.

## Ejecutar
Requisitos: Node.js/npm y Google Chrome. Bootstrap necesita internet al cargar.

```bash
npm install
npm run dev
npm run build
npm test
```

Karma ejecuta Jasmine en Chrome con `npm test`. No se declara porcentaje de cobertura instrumentada; ver `docs/cobertura-testing.md` para la matriz funcional.

## Estructura
- `src/components/`: vistas y componentes React.
- `src/hooks/useGameHub.js`: estado/acciones compartidas.
- `src/logica/`: productos y validaciones.
- `src/**/*.spec.js`, `test/**/*.spec.js`: pruebas Jasmine detectadas por Karma.
- `docs/`: ERS, cobertura funcional y guion individual.

## Responsive
Bootstrap usa una columna en movil, dos desde sm, tres desde lg y cuatro desde xl. El contenedor adapta sus espacios con utilidades responsive; CSS propio conserva la identidad visual.
