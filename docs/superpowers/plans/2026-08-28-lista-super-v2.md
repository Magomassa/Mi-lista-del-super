# Lista del Súper V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Incorporar el catálogo real, cantidades predeterminadas, última compra y plantillas locales sin alterar el flujo central de la V1.

**Architecture:** Mantener React y el estado local actuales, ampliar los módulos puros de estado y almacenamiento, y añadir una vista secundaria de listas guardadas. Todos los snapshots se clonan al cruzar límites de almacenamiento.

**Tech Stack:** React 19, Vite 8, JavaScript, CSS, Vitest, Testing Library, vite-plugin-pwa.

**Spec:** `docs/superpowers/specs/2026-08-28-lista-super-v2-design.md`

## Global Constraints

- Sin backend, autenticación, APIs externas ni cambios de Vercel.
- Catálogo completo en `src/data/catalog.js` con cantidades explícitas.
- Claves V2 independientes para borrador, última compra y plantillas.
- Confirmación antes de reemplazar un borrador seleccionado o sobrescribir una plantilla.

---

### Task 1: Catálogo y estado con cantidades predeterminadas

**Files:**
- Create: `src/data/catalog.js`, `src/data/catalog.test.js`
- Modify: `src/lib/listState.js`, `src/lib/listState.test.js`
- Delete: `src/data/products.js`

**Interfaces:**
- Produces: `categories`; `toggleProduct(state, product)` y selectores de productos seleccionados.

- [ ] Escribir pruebas que exijan ausencia de productos V1, catálogo completo, nombres literales y cantidades 2/1 para Jabón en pan/Ariel.
- [ ] Ejecutar las pruebas y observar RED por falta del nuevo catálogo y firma.
- [ ] Crear el catálogo literal y actualizar el estado para conservar entradas desmarcadas.
- [ ] Ejecutar las pruebas y observar GREEN.

### Task 2: Persistencia V2 y snapshots independientes

**Files:**
- Modify: `src/lib/storage.js`, `src/lib/storage.test.js`

**Interfaces:**
- Produces: `loadDraft`, `saveDraft`, `loadLastPurchase`, `saveLastPurchase`, `loadTemplates`, `saveTemplate`, `updateTemplate`, `deleteTemplate`.

- [ ] Escribir pruebas fallidas para claves separadas, JSON inválido, guardado/carga/eliminación y copias profundas.
- [ ] Implementar las funciones mínimas con validación defensiva y IDs de plantilla estables.
- [ ] Ejecutar las pruebas y observar GREEN.

### Task 3: Interfaz de listas guardadas y protecciones

**Files:**
- Create: `src/components/SavedLists.jsx`, `src/components/SaveTemplateDialog.jsx`
- Modify: `src/App.jsx`, `src/components/Summary.jsx`, `src/App.test.jsx`

**Interfaces:**
- Consumes: catálogo, estado y persistencia V2.
- Produces: guardar/cargar/actualizar/eliminar plantillas y cargar última compra.

- [ ] Escribir pruebas fallidas para `defaultQuantity`, guardado/carga inmutable, confirmación de reemplazo, confirmación de actualización, última compra y reinicio de defaults.
- [ ] Implementar los flujos y mantener la selección como pantalla principal.
- [ ] Ejecutar las pruebas y observar GREEN.

### Task 4: Estilos y regresión PWA

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: vista móvil secundaria y diálogo accesible compatibles con impresión.

- [ ] Añadir estilos táctiles para entrada secundaria, tarjetas de plantillas y diálogo.
- [ ] Ejecutar `npm.cmd test`, `npm.cmd run lint` y `npm.cmd run build` con cero fallos.
- [ ] Iniciar Vite en host local y comprobar respuesta HTTP 200.
