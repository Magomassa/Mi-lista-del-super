# Lista del Súper V3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar tema claro/oscuro, selección masiva y artículos personalizados persistentes sin alterar los datos V2 ni la salida PWA/A4.

**Architecture:** El tema se resolverá en un módulo local aislado y se aplicará mediante `data-theme`. Las operaciones de selección masiva y CRUD personalizado serán funciones puras sobre el mapa del borrador; React combinará el catálogo estático con una categoría `Otros` derivada del borrador. El almacenamiento V2 conservará sus claves y sanitizará explícitamente entradas normales y personalizadas.

**Tech Stack:** React 19, Vite 8, JavaScript, CSS, Vitest, Testing Library, vite-plugin-pwa.

**Spec:** `docs/superpowers/specs/2026-08-30-lista-super-v3-design.md`

## Global Constraints

- Conservar `lista-super:v2:draft`, `lista-super:v2:last-purchase` y `lista-super:v2:templates`.
- Mantener catálogo, buscador, resumen, compartir, copiar, imprimir, plantillas, última compra, PWA y funcionamiento offline.
- `Otros` siempre aparece después de las categorías normales y nunca participa en selección masiva.
- El contador sí incluye toda entrada personalizada seleccionada.
- Editar un personalizado conserva su ID, cantidad, nota y selección.
- La impresión fuerza papel blanco y texto oscuro con cualquier tema.
- No modificar configuración de Vercel ni desplegar.

---

### Task 1: Resolución y persistencia del tema

**Files:**
- Create: `src/lib/theme.js`
- Create: `src/lib/theme.test.js`
- Create: `src/components/ThemeToggle.jsx`

**Interfaces:**
- Produces: `THEME_KEY`, `resolveTheme(storage, mediaQuery)`, `saveTheme(theme, storage)`, `applyTheme(theme, root)`.
- Produces: `ThemeToggle({ theme, onToggle })` con nombre accesible `Activar modo oscuro` o `Activar modo claro`.

- [ ] **Step 1: Escribir pruebas fallidas del tema**

```js
expect(resolveTheme(storageWith('dark'), { matches: false })).toBe('dark')
expect(resolveTheme(emptyStorage, { matches: true })).toBe('dark')
expect(resolveTheme(emptyStorage, { matches: false })).toBe('light')
expect(() => saveTheme('dark', blockedStorage)).not.toThrow()
```

- [ ] **Step 2: Ejecutar RED**

Run: `npm.cmd test -- src/lib/theme.test.js`

Expected: FAIL porque `theme.js` no existe.

- [ ] **Step 3: Implementar el módulo mínimo**

```js
export const THEME_KEY = 'lista-super:theme'
export function resolveTheme(storage = localStorage, media = matchMedia('(prefers-color-scheme: dark)')) {
  try {
    const saved = storage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* usar sistema */ }
  return media.matches ? 'dark' : 'light'
}
```

`saveTheme` aceptará sólo `light`/`dark` y capturará errores; `applyTheme` asignará `root.dataset.theme`.

- [ ] **Step 4: Ejecutar GREEN y registrar**

Run: `npm.cmd test -- src/lib/theme.test.js`

Expected: PASS.

Run: `git add src/lib/theme.js src/lib/theme.test.js src/components/ThemeToggle.jsx && git commit -m "feat: add persistent color theme"`

### Task 2: Estado puro para selección masiva y artículos personalizados

**Files:**
- Modify: `src/lib/listState.js`
- Modify: `src/lib/listState.test.js`

**Interfaces:**
- Produces: `areAllSelected(state, products)`, `toggleProducts(state, products)`, `createCustomItem(state, name, createId)`, `renameCustomItem(state, id, name)`, `deleteCustomItem(state, id)`, `getCustomItems(state)`, `hasRelevantDraft(state, categories)`.
- Mantiene: `toggleProduct`, `changeQuantity`, `updateProduct`.

- [ ] **Step 1: Escribir pruebas fallidas de selección masiva**

```js
const products = [{ id: 'a', defaultQuantity: 2 }, { id: 'b', defaultQuantity: 1 }]
const custom = { c: { id: 'c', name: 'Tostadora', custom: true, selected: false, quantity: 4, note: 'negra' } }
const selected = toggleProducts(custom, products)
expect(selected.a.quantity).toBe(2)
expect(selected.b.selected).toBe(true)
expect(selected.c).toEqual(custom.c)
expect(toggleProducts(selected, products).a.selected).toBe(false)
expect(toggleProducts(selected, products).a.quantity).toBe(2)
```

- [ ] **Step 2: Ejecutar RED e implementar selección masiva**

Run: `npm.cmd test -- src/lib/listState.test.js`

Expected: FAIL por exports inexistentes.

Implementar `toggleProducts` recorriendo exclusivamente `products`; si todos están seleccionados asignar `selected: false`, y si no, asignar `selected: true` usando `defaultQuantity` sólo para entradas ausentes.

- [ ] **Step 3: Escribir pruebas fallidas de personalizados e ID estable**

```js
const created = createCustomItem({}, 'Tostadora', () => 'uuid-1')
expect(created['uuid-1']).toEqual({ id: 'uuid-1', name: 'Tostadora', custom: true, selected: true, quantity: 1, note: '' })
const edited = renameCustomItem({ ...created, 'uuid-1': { ...created['uuid-1'], quantity: 2, note: 'negra' } }, 'uuid-1', 'Tostadora negra')
expect(edited['uuid-1']).toEqual({ id: 'uuid-1', name: 'Tostadora negra', custom: true, selected: true, quantity: 2, note: 'negra' })
```

- [ ] **Step 4: Implementar CRUD personalizado e ID**

Agregar `createCustomId()` que usa `crypto.randomUUID()` y, si falta, `crypto.getRandomValues(new Uint32Array(4))` más tiempo; último fallback: tiempo más `Math.random()`.

Los nombres se recortan; crear/renombrar con vacío devuelve el estado sin cambios. Eliminar quita sólo el ID indicado.

- [ ] **Step 5: Escribir pruebas de borrador relevante**

Probar `true` para personalizado deseleccionado, nota no vacía, cantidad normal distinta de `defaultQuantity` y seleccionado; probar `false` para `{}` y una entrada normal deseleccionada sin cambios.

- [ ] **Step 6: Implementar, ejecutar GREEN y registrar**

Run: `npm.cmd test -- src/lib/listState.test.js`

Expected: PASS.

Run: `git add src/lib/listState.js src/lib/listState.test.js && git commit -m "feat: add bulk and custom item state"`

### Task 3: Sanitización compatible del almacenamiento V2

**Files:**
- Modify: `src/lib/storage.js`
- Modify: `src/lib/storage.test.js`

**Interfaces:**
- Produces internamente: `sanitizeEntry(value)` y `sanitizeDraft(value)` usados por borrador, última compra y `template.items`.
- Mantiene todas las claves y funciones públicas V2 existentes.

- [ ] **Step 1: Escribir pruebas fallidas para ambas formas**

```js
localStorage.setItem(DRAFT_KEY, JSON.stringify({
  normal: { selected: true, quantity: 2, note: '' },
  custom: { id: 'custom', name: 'Tostadora', custom: true, selected: false, quantity: 1, note: 'negra' },
  broken: { custom: true, quantity: 1 },
}))
expect(loadDraft()).toEqual({
  normal: { selected: true, quantity: 2, note: '' },
  custom: { id: 'custom', name: 'Tostadora', custom: true, selected: false, quantity: 1, note: 'negra' },
})
```

Agregar casos equivalentes para `loadLastPurchase()` y `loadTemplates()`, incluyendo plantillas V2 sólo con entradas normales.

- [ ] **Step 2: Ejecutar RED**

Run: `npm.cmd test -- src/lib/storage.test.js`

Expected: FAIL porque las entradas inválidas se conservan y no hay sanitización explícita.

- [ ] **Step 3: Implementar sanitización mínima**

Una entrada normal válida requiere booleano `selected`, entero `quantity >= 1` y string `note`. Una personalizada requiere además `custom === true`, strings no vacíos `id` y `name`, y conserva exactamente esos seis campos. `sanitizeDraft` descarta entradas inválidas sin rechazar todo el contenedor.

Al cargar plantillas, conservar `id`/`name` de plantilla y sanitizar `items`; no modificar snapshots guardados durante una lectura normal.

- [ ] **Step 4: Ejecutar GREEN y registrar**

Run: `npm.cmd test -- src/lib/storage.test.js`

Expected: PASS, incluyendo pruebas V2 existentes.

Run: `git add src/lib/storage.js src/lib/storage.test.js && git commit -m "feat: sanitize v2 draft entries"`

### Task 4: Formato combinado y componentes de Otros

**Files:**
- Modify: `src/lib/formatList.js`
- Modify: `src/lib/formatList.test.js`
- Create: `src/components/CustomItemDialog.jsx`
- Create: `src/components/CustomItemsSection.jsx`
- Modify: `src/components/ProductRow.jsx`

**Interfaces:**
- Produces: `buildDisplayCategories(categories, state)` o entrada equivalente que agrega `{ id: 'otros', name: 'Otros', products }` al final.
- `CustomItemDialog({ item, onCancel, onSave })`; `item` ausente crea y presente edita.
- `ProductRow` acepta acciones opcionales `onEdit` y `onDelete` sólo para personalizados.

- [ ] **Step 1: Escribir prueba fallida de formato de Otros**

```js
const state = { toast: { id: 'toast', name: 'Tostadora', custom: true, selected: true, quantity: 1, note: 'negra' } }
expect(formatList(categories, state, fixedDate)).toContain('OTROS\n• Tostadora — 1 (negra)')
expect(formatList(categories, { ...state, toast: { ...state.toast, selected: false } }, fixedDate)).not.toContain('OTROS')
```

- [ ] **Step 2: Ejecutar RED e implementar formato**

Run: `npm.cmd test -- src/lib/formatList.test.js`

Expected: FAIL porque el formateador sólo recorre catálogo.

Agregar `Otros` después del catálogo usando las entradas `custom: true`, sin modificar `catalog.js`.

- [ ] **Step 3: Escribir pruebas de componentes**

En `src/App.test.jsx`, definir antes de implementar: abrir `+ Agregar artículo`, guardar `Tostadora`, comprobar selección/cantidad 1, editar a `Tostadora negra` conservando cantidad/nota e ID del borrador, y eliminar tras confirmación.

- [ ] **Step 4: Implementar diálogo y sección**

Reutilizar clases visuales de `SaveTemplateDialog`; no usar `prompt()`. `Otros` muestra siempre `+ Agregar artículo`, productos existentes y nunca un botón cuyo nombre coincida con `Seleccionar todos`.

- [ ] **Step 5: Ejecutar pruebas y registrar**

Run: `npm.cmd test -- src/lib/formatList.test.js src/App.test.jsx`

Expected: PASS.

Run: `git add src/lib/formatList.js src/lib/formatList.test.js src/components/CustomItemDialog.jsx src/components/CustomItemsSection.jsx src/components/ProductRow.jsx src/App.test.jsx && git commit -m "feat: add custom items category"`

### Task 5: Integración React, contador, búsqueda y selección masiva

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`
- Modify: `src/components/CategorySection.jsx`
- Modify: `src/components/Summary.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes todos los helpers de Tasks 1–4.
- Produce UI completa con tema, selección masiva, búsqueda combinada, contador y snapshots.

- [ ] **Step 1: Escribir pruebas fallidas del tema integrado**

Simular `matchMedia('(prefers-color-scheme: dark)')`, renderizar sin preferencia y comprobar `document.documentElement.dataset.theme === 'dark'`. Pulsar el toggle, comprobar `light` y `localStorage.getItem('lista-super:theme') === 'light'`; remontar y comprobar que prevalece sobre el sistema.

- [ ] **Step 2: Integrar tema y comprobar GREEN parcial**

Inicializar estado con `resolveTheme`, ejecutar `applyTheme` en un efecto y persistir sólo cuando el usuario pulse el toggle. Añadir `ThemeToggle` al encabezado sin desplazar `Listas guardadas` fuera del viewport móvil.

Run: `npm.cmd test -- src/App.test.jsx`

- [ ] **Step 3: Escribir pruebas fallidas de selección masiva**

Comprobar que la acción general selecciona exactamente los 70 productos normales, conserva una cantidad editada, no selecciona un personalizado desmarcado y luego deselecciona los 70. Para categoría, comprobar que limpieza cambia y tocador/comestibles no. Comprobar ausencia de acción masiva dentro de `Otros`.

- [ ] **Step 4: Integrar acciones masivas**

El botón general usará la lista plana de `categories`. `CategorySection` calculará `areAllSelected` sobre `category.products` y llamará `toggleProducts` sólo con esa categoría.

- [ ] **Step 5: Escribir pruebas fallidas de flujo personalizado completo**

Comprobar búsqueda por `tost`, contador normal + personalizado, resumen y texto; desmontar/remontar para borrador; guardar/cargar plantilla y última compra con personalizados; editar el borrador cargado y verificar que `loadTemplates()` conserva el snapshot; `Lista nueva` elimina `Otros`.

- [ ] **Step 6: Integrar Otros y protección de reemplazo**

Derivar personalizados con `getCustomItems(list)`. El contador seguirá usando todas las entradas `selected`. `handleLoad` usará `hasRelevantDraft(list, categories)` en vez de comprobar sólo seleccionados.

- [ ] **Step 7: Implementar variables oscuras e impresión clara**

Definir variables base y overrides bajo `:root[data-theme='dark']`. Sustituir colores rígidos relevantes por variables. Dentro de `@media print`, fijar explícitamente `color-scheme: light`, `background: #fff`, `color: #000`, bordes oscuros y ocultar controles.

- [ ] **Step 8: Ejecutar regresión y registrar**

Run: `npm.cmd test`

Expected: todas las pruebas actuales y V3 pasan.

Run: `git add src/App.jsx src/App.test.jsx src/components/CategorySection.jsx src/components/Summary.jsx src/index.css && git commit -m "feat: integrate v3 shopping flows"`

### Task 6: Verificación PWA y servidor local

**Files:**
- Verify: `vite.config.js`, `dist/manifest.webmanifest`, `dist/sw.js`

**Interfaces:**
- Produces: build PWA válido y URL local verificable.

- [ ] **Step 1: Ejecutar verificación completa fresca**

Run: `npm.cmd test`

Expected: 0 archivos y 0 pruebas fallidas.

Run: `npm.cmd run lint`

Expected: exit code 0, sin errores.

Run: `npm.cmd run build`

Expected: exit code 0; salida incluye `manifest.webmanifest`, `sw.js` y archivos Workbox.

- [ ] **Step 2: Iniciar servidor y comprobar HTTP**

Run: `npm.cmd run dev -- --host 127.0.0.1`

Expected: Vite publica `http://127.0.0.1:5173/` o el siguiente puerto libre.

Run: `Invoke-WebRequest -UseBasicParsing -Uri '<URL publicada>'`

Expected: `StatusCode` 200.

- [ ] **Step 3: Revisar alcance final**

Confirmar mediante `git diff --stat` que no cambió configuración de Vercel, que `src/data/catalog.js` conserva el catálogo real y que no existe una operación de despliegue.
