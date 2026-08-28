# Lista del Súper V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una PWA móvil local para preparar, revisar, compartir, copiar e imprimir una lista de supermercado.

**Architecture:** Una SPA React mantiene el borrador por ID y lo persiste en `localStorage`. Catálogo, persistencia y formateo son módulos puros separados; componentes pequeños presentan selección y resumen.

**Tech Stack:** React, Vite, JavaScript, CSS, Vitest, Testing Library, vite-plugin-pwa.

**Spec:** `docs/superpowers/specs/2026-08-28-lista-super-v1-design.md`

## Global Constraints

- Sin backend, cuentas, bases de datos ni APIs externas.
- Catálogo completamente separado en `src/data/products.js`.
- Cantidad mínima 1 para productos seleccionados, ajustable con `−` y `+`.
- Fecha del encabezado en formato `DD/MM/AAAA`.
- Interfaz española, responsive, táctil y legible.
- Estado guardado exclusivamente en `localStorage`.

---

### Task 1: Scaffold y entorno de pruebas

**Files:**
- Create: `package.json`, `index.html`, `vite.config.js`, `eslint.config.js`, `src/main.jsx`, `src/test/setup.js`

**Interfaces:**
- Produces: scripts `dev`, `build`, `lint`, `test`; entorno jsdom y matcher DOM.

- [ ] **Step 1: Inicializar el paquete e instalar dependencias mínimas**

Run: `npm.cmd create vite@latest . -- --template react`

Run: `npm.cmd install`

Run: `npm.cmd install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom vite-plugin-pwa`

- [ ] **Step 2: Configurar Vitest y PWA en Vite**

Agregar a `vite.config.js` un bloque `test` con `environment: 'jsdom'`, `setupFiles: './src/test/setup.js'` y `css: true`; registrar `VitePWA` con actualización automática y manifiesto español.

- [ ] **Step 3: Configurar el script de pruebas**

Agregar a `package.json`: `"test": "vitest run"`.

- [ ] **Step 4: Confirmar que el ejecutor inicia**

Run: `npm.cmd test -- --passWithNoTests`

Expected: exit code 0.

### Task 2: Catálogo, borrador persistente y formato

**Files:**
- Create: `src/data/products.js`, `src/lib/listState.js`, `src/lib/listState.test.js`, `src/lib/storage.js`, `src/lib/storage.test.js`, `src/lib/formatList.js`, `src/lib/formatList.test.js`

**Interfaces:**
- Produces: `categories`; `toggleProduct(state, id)`, `changeQuantity(state, id, delta)`, `updateProduct(state, id, patch)`, `clearList()`; `loadList()`, `saveList(state)`; `formatList(categories, state, date)`.

- [ ] **Step 1: Escribir pruebas fallidas de estado**

Probar literalmente que seleccionar `leche` produce `{ selected: true, quantity: 1, note: '' }`, que incrementar produce 2, decrementar nunca baja de 1 y desmarcar elimina su entrada.

- [ ] **Step 2: Ejecutar y comprobar RED**

Run: `npm.cmd test -- src/lib/listState.test.js`

Expected: FAIL porque `listState.js` todavía no existe.

- [ ] **Step 3: Implementar el estado mínimo y comprobar GREEN**

Crear funciones inmutables que normalicen cantidad con `Math.max(1, value)`.

Run: `npm.cmd test -- src/lib/listState.test.js`

Expected: todas las pruebas pasan.

- [ ] **Step 4: Escribir pruebas fallidas de persistencia**

Probar carga válida, JSON corrupto que devuelve `{}`, y error de escritura que no rompe la aplicación usando un almacenamiento real controlado por jsdom.

- [ ] **Step 5: Implementar persistencia defensiva y comprobar GREEN**

Usar la clave `lista-super:v1` y capturar errores de acceso y parseo.

Run: `npm.cmd test -- src/lib/storage.test.js`

Expected: todas las pruebas pasan.

- [ ] **Step 6: Escribir prueba fallida del texto final**

Con fecha local `2026-08-28`, leche cantidad 2 con nota `descremada` y arroz cantidad 1, esperar exactamente un encabezado `LISTA DEL SÚPER — 28/08/2026`, secciones en orden de catálogo y ausencia de productos no seleccionados.

- [ ] **Step 7: Crear catálogo independiente e implementar formateo**

Definir categorías con IDs, nombres y arreglos de productos `{ id, name }`. Implementar `formatList` sin depender de React.

Run: `npm.cmd test -- src/lib/formatList.test.js`

Expected: todas las pruebas pasan.

### Task 3: Flujo React móvil

**Files:**
- Create: `src/App.jsx`, `src/App.test.jsx`, `src/components/SearchBar.jsx`, `src/components/CategorySection.jsx`, `src/components/ProductRow.jsx`, `src/components/Summary.jsx`
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: `categories`, módulos de estado, almacenamiento y formato.
- Produces: selección, búsqueda, edición, resumen, compartir/copiar/imprimir y limpieza.

- [ ] **Step 1: Escribir pruebas fallidas del flujo principal**

Probar con interacciones reales que buscar filtra por nombre; seleccionar Leche muestra cantidad 1; `+` cambia a 2 y `−` vuelve a 1; observación se conserva; el botón de resumen muestra únicamente lo elegido.

- [ ] **Step 2: Ejecutar y comprobar RED**

Run: `npm.cmd test -- src/App.test.jsx`

Expected: FAIL porque los componentes todavía no existen.

- [ ] **Step 3: Implementar pantalla de selección y comprobar GREEN**

Crear componentes con botones y labels accesibles, filtrado insensible a mayúsculas y persistencia reactiva.

Run: `npm.cmd test -- src/App.test.jsx`

Expected: pasan los casos de selección.

- [ ] **Step 4: Agregar pruebas fallidas de acciones finales**

Probar que copiar usa el texto fechado, compartir usa `navigator.share` cuando existe, imprimir llama `window.print`, y limpiar requiere confirmación y vacía el resumen.

- [ ] **Step 5: Implementar acciones finales y comprobar GREEN**

Implementar Web Share con manejo de cancelación, Clipboard API con alternativa DOM, impresión nativa y confirmación antes de limpiar.

Run: `npm.cmd test -- src/App.test.jsx`

Expected: todas las pruebas pasan sin errores ni advertencias.

### Task 4: Diseño, recursos PWA y verificación integral

**Files:**
- Create: `src/styles.css`, `public/icon-192.svg`, `public/icon-512.svg`
- Modify: `src/main.jsx`, `vite.config.js`, `index.html`
- Delete: archivos de demostración de Vite que no se utilicen.

**Interfaces:**
- Produces: interfaz responsive, impresión A4 y PWA instalable.

- [ ] **Step 1: Implementar estilos móviles y de impresión**

Usar ancho máximo, fuente mínima 16 px, objetivos táctiles mínimos de 44 px, acción de resumen fija y `@media print` que oculte controles y muestre sólo la lista.

- [ ] **Step 2: Agregar iconos locales y metadatos PWA**

Referenciar iconos 192 y 512, `display: standalone`, `lang="es"`, colores del tema y registro automático del service worker.

- [ ] **Step 3: Ejecutar verificación completa**

Run: `npm.cmd test`

Expected: 0 pruebas fallidas.

Run: `npm.cmd run lint`

Expected: 0 errores.

Run: `npm.cmd run build`

Expected: exit code 0 y archivos PWA generados en `dist`.

- [ ] **Step 4: Iniciar y comprobar el servidor local**

Run: `npm.cmd run dev -- --host 127.0.0.1`

Expected: Vite informa una URL local que responde HTTP 200.
