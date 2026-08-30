# Lista del Súper V3 — Diseño

## Objetivo

Agregar modo oscuro, selección masiva y artículos personalizados en una categoría `Otros` sin cambiar la arquitectura React existente ni alterar las funciones actuales, PWA, impresión o datos V2.

## Compatibilidad y límites

- Se conservarán las claves `lista-super:v2:draft`, `lista-super:v2:last-purchase` y `lista-super:v2:templates`.
- No se borrarán ni migrarán innecesariamente borradores, última compra o plantillas V2.
- No se modificará ninguna configuración de Vercel ni se realizará un despliegue.
- El catálogo normal continuará aislado en `src/data/catalog.js`.
- Las plantillas seguirán cambiando sólo mediante la acción explícita de actualización.

## Modo claro y oscuro

La preferencia manual se almacenará en una clave independiente: `lista-super:theme`. Sus únicos valores válidos serán `light` y `dark`.

Al iniciar:

1. Si existe una preferencia manual válida, se utilizará.
2. En caso contrario, se consultará `prefers-color-scheme: dark`.

El tema resuelto se aplicará como `data-theme` en el elemento raíz del documento. Un botón compacto, accesible y presente en la interfaz principal permitirá alternar el tema y anunciará su acción, por ejemplo `Activar modo oscuro`.

Los colores de fondo, encabezado, tarjetas, estados seleccionados, buscador, campos, botones, diálogos, listas guardadas, resumen y mensajes se expresarán mediante variables CSS. Los estilos `@media print` forzarán siempre fondo blanco, texto negro y controles ocultos, independientemente del tema activo.

## Selección masiva

Se agregarán funciones puras al módulo de estado para:

- determinar si todos los productos de un conjunto están seleccionados;
- seleccionar o deseleccionar todos los productos normales del catálogo;
- seleccionar o deseleccionar todos los productos de una categoría normal.

Seleccionar recorrerá objetos del catálogo y creará las entradas ausentes usando `defaultQuantity`. Si la entrada ya existe, conservará cantidad y observación y sólo cambiará `selected`. Deseleccionar conservará toda la entrada y cambiará únicamente `selected` a `false`.

La acción general `Seleccionar todo` / `Deseleccionar todo` será secundaria y aparecerá cerca del contador. Cada categoría normal tendrá su propia acción textual `Seleccionar todos` / `Deseleccionar todos`. Ninguna de estas funciones recorrerá el estado libremente: sólo recibirá productos provenientes de `catalog.js`, por lo que nunca afectará artículos personalizados.

## Artículos personalizados y categoría Otros

Cada artículo personalizado se guardará en el mismo mapa del borrador con esta forma:

```js
{
  id: 'custom-id-estable',
  name: 'Tostadora',
  custom: true,
  selected: true,
  quantity: 1,
  note: ''
}
```

El ID se generará una sola vez mediante `crypto.randomUUID()` cuando esté disponible, con un fallback que combine tiempo y aleatoriedad criptográfica o pseudoaleatoria para mantener un riesgo práctico de colisión despreciable. Nunca cambiará al editar el artículo. Un diálogo con el mismo estilo visual de los existentes permitirá agregar y editar. La edición cambiará solamente `name`; conservará ID, selección, cantidad y observación. El nombre no podrá quedar vacío. Eliminar requerirá confirmación.

`Otros` se construirá desde las entradas `custom: true` del borrador, aparecerá después de todas las categorías normales y no tendrá selección masiva. Si no hay personalizados, sólo se mostrará su encabezado y el botón `+ Agregar artículo`. Los artículos usarán los mismos controles de selección, cantidad, observación y accesibilidad que los normales, además de acciones secundarias para editar y eliminar.

El contador general contará todas las entradas con `selected === true`, tanto normales como personalizadas. La exclusión de `Otros` se aplicará únicamente a las acciones de selección masiva, nunca al contador.

## Búsqueda, resumen y texto

La búsqueda combinará categorías normales filtradas con artículos personalizados filtrados por nombre. Si coincide un personalizado, se mostrará dentro de `Otros` al final.

El resumen y `formatList` recibirán una representación combinada en la que `Otros` siempre es la última categoría. No aparecerá en el resultado si ninguno de sus artículos está seleccionado. El texto generado, compartir, copiar e imprimir incluirán nombre, cantidad y observación de los personalizados igual que los productos normales.

## Borrador, última compra y plantillas

Los personalizados forman parte del mapa del borrador. Antes de implementar se revisará `storage.js` y cualquier normalización existente. La persistencia admitirá y conservará explícitamente estas dos formas válidas:

```js
// Producto normal
{ selected, quantity, note }

// Artículo personalizado
{ id, name, custom: true, selected, quantity, note }
```

La lectura sanitizará entradas individualmente: conservará sólo valores con tipos y cantidades válidos, y cuando `custom === true` exigirá además `id` y `name` no vacíos. Los borradores, última compra y plantillas V2 existentes sin campos personalizados seguirán siendo válidos. JSON corrupto, contenedores con forma incorrecta y entradas inválidas se ignorarán sin romper la aplicación. Vaciar el borrador mediante `Lista nueva` eliminará los personalizados.

Los snapshots profundos de última compra y plantillas incluirán todas las entradas personalizadas. Cargar un snapshot producirá otra copia profunda. Editar o eliminar un artículo cargado cambiará únicamente el borrador actual; la plantilla original seguirá intacta hasta que el usuario confirme `Actualizar`.

Antes de cargar una plantilla o última compra se considerará que el borrador tiene contenido relevante si contiene al menos uno de estos casos:

- una entrada seleccionada;
- un artículo personalizado, incluso deseleccionado;
- una observación no vacía;
- una cantidad distinta de la cantidad inicial del producto normal.

Si existe contenido relevante se pedirá confirmación antes de reemplazarlo. La comparación de cantidades normales usará el `defaultQuantity` del catálogo; las entradas antiguas sin cambios no provocarán confirmaciones innecesarias.

## Componentes y módulos

- `src/lib/theme.js`: resolución y persistencia del tema.
- `src/lib/listState.js`: selección masiva y operaciones CRUD de personalizados.
- `src/lib/formatList.js`: soporte de categorías combinadas sin acoplarse a React.
- `src/components/ThemeToggle.jsx`: control accesible de tema.
- `src/components/CustomItemDialog.jsx`: alta y edición por nombre.
- `src/components/CustomItemsSection.jsx`: categoría Otros y acciones de artículos.
- Componentes actuales: integración mínima de acciones masivas y datos combinados.

## Errores y casos límite

- Preferencias de tema inválidas o localStorage inaccesible se ignorarán de forma segura.
- No se permitirá crear ni guardar un nombre personalizado vacío.
- La selección masiva sobre conjuntos vacíos no modificará el borrador.
- Los artículos personalizados deseleccionados seguirán existiendo hasta eliminación explícita o `Lista nueva`.
- Cargar snapshots pedirá confirmación ante cualquier contenido relevante, incluso un personalizado deseleccionado, una observación o una cantidad modificada.

## Pruebas y aceptación

Las pruebas verificarán:

- resolución del tema manual y del sistema, alternancia y persistencia;
- selección/deselección general y por categoría, cantidades predeterminadas y exclusión de personalizados;
- creación, edición con ID estable, cantidad, observación, búsqueda y eliminación de personalizados;
- orden final de `Otros`, resumen, texto generado e impresión clara;
- persistencia y sanitización compatible de entradas normales V2 y personalizadas, inclusión en última compra y plantillas, y aislamiento tras cargar una plantilla;
- contador total incluyendo personalizados y detección de borrador relevante antes de reemplazarlo;
- regresiones de compartir, copiar, imprimir, listas guardadas y catálogo.

La etapa termina únicamente con `npm test`, `npm run lint` y `npm run build` exitosos, recursos PWA generados y servidor local respondiendo correctamente.
