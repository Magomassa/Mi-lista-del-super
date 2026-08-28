# Lista del Súper V2 — Diseño

## Objetivo

Evolucionar la V1 sin cambiar su arquitectura general: sustituir el catálogo de ejemplo por el catálogo real y agregar borrador, última compra y plantillas locales como conceptos independientes.

## Catálogo y cantidades

El catálogo residirá por completo en `src/data/catalog.js`. Cada producto tendrá `id`, `name` y `defaultQuantity` explícitos. Presentaciones como `800 ml`, gramos, litros, metros y packs permanecerán dentro de `name`; no habrá parser automático.

Al seleccionar por primera vez, el producto tomará `defaultQuantity`. Desmarcarlo conservará cantidad y observación dentro del borrador para recuperarlas si se vuelve a marcar. Una lista nueva vaciará totalmente el borrador, por lo que la próxima selección volverá al valor predeterminado.

## Tres almacenamientos independientes

- **Borrador actual:** se guarda automáticamente y permite recuperar trabajo accidentalmente interrumpido.
- **Última compra:** snapshot guardado al compartir, copiar o imprimir; sólo se carga mediante una acción explícita.
- **Plantillas:** snapshots con nombre creados por el usuario; cargar produce una copia profunda y nunca modifica el original.

Las claves se versionarán bajo `lista-super:v2:*`, evitando que selecciones V1 de productos eliminados reaparezcan. Cargar una plantilla o la última compra pedirá confirmación si el borrador contiene productos seleccionados. Actualizar una plantilla requerirá confirmación explícita; eliminarla también conservará confirmación.

## Interfaz

La selección de productos seguirá siendo el foco principal. Un botón secundario `Listas guardadas` abrirá una vista sencilla con última compra, plantillas, carga, guardado, actualización y eliminación. Un diálogo pequeño dentro de la aplicación solicitará el nombre al guardar. No se añadirán controles secundarios a cada producto.

## Compatibilidad

Se conservarán búsqueda, selección, cantidades, observaciones, resumen fechado, compartir, copiar, impresión A4, responsive, PWA y funcionamiento offline. No habrá backend, autenticación, APIs externas ni configuración de Vercel.

## Verificación

Las pruebas cubrirán catálogo, nombres con presentaciones, cantidades predeterminadas, persistencia separada, snapshots inmutables, confirmaciones, última compra y nueva lista. La entrega requiere `npm test`, `npm run lint`, `npm run build` y un servidor local con respuesta HTTP correcta.
