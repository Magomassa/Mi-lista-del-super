# Lista del Súper V1 — Diseño

## Objetivo

Crear una aplicación web móvil extremadamente sencilla para reemplazar la selección e impresión manual de una lista de supermercado en Word. La aplicación funcionará sin cuentas ni servidor y conservará el estado en el dispositivo.

## Alcance funcional

- Mostrar productos agrupados por categorías, con ejemplos iniciales editables en el código.
- Seleccionar y desmarcar productos mediante controles táctiles grandes.
- Filtrar productos por nombre sin perder la selección.
- Iniciar la cantidad de cada producto seleccionado en 1 y permitir ajustarla fácilmente con botones `−` y `+`; la edición manual podrá incluirse si mantiene la interfaz simple.
- Permitir una observación opcional por producto.
- Mostrar una vista de resumen con únicamente los productos seleccionados.
- Generar texto ordenado por categorías con la fecha actual en el encabezado, por ejemplo `LISTA DEL SÚPER — 28/08/2026`.
- Compartir mediante Web Share API cuando esté disponible, incluyendo WhatsApp a través del selector nativo del celular.
- Copiar el texto al portapapeles con una alternativa compatible si la API moderna no está disponible.
- Imprimir una versión limpia en tamaño A4 mediante estilos CSS de impresión.
- Limpiar toda la selección después de una confirmación explícita.
- Conservar selección, cantidades y observaciones en `localStorage`.

## Fuera de alcance

No habrá backend, base de datos, autenticación, usuarios, sincronización entre dispositivos, APIs externas, edición visual del catálogo ni funciones colaborativas.

## Experiencia de uso

La pantalla principal tendrá encabezado, buscador y categorías. Cada producto será una fila/tarjeta táctil con casilla grande; sus campos de cantidad y observación aparecerán al seleccionarlo. Una acción fija y visible llevará al resumen e indicará cuántos productos están seleccionados.

El resumen conservará el orden por categorías y ofrecerá compartir, copiar, imprimir, volver a editar y comenzar una lista nueva. Se utilizarán textos en español, tipografía legible, alto contraste, objetivos táctiles de al menos 44 px y diseño responsive centrado en celulares.

## Arquitectura

Se usará React con Vite y JavaScript. `App` coordinará el estado; componentes enfocados representarán buscador, categoría, producto y resumen. Un archivo sencillo y completamente independiente contendrá únicamente el catálogo de productos de ejemplo, para poder sustituirlo después por los datos provenientes del Word sin modificar la lógica ni los componentes. Un módulo de almacenamiento aislará `localStorage` y un módulo de formato generará el texto compartible e imprimible.

El estado persistido se identificará por ID de producto y contendrá solamente `selected`, `quantity` y `note`. Los datos inválidos o inaccesibles en `localStorage` se ignorarán de forma segura y la aplicación iniciará con una lista vacía.

## PWA

Se instalará `vite-plugin-pwa` como única dependencia de ejecución adicional a React. El manifiesto tendrá nombre, nombre corto, color, modo `standalone` e iconos locales. El service worker generado permitirá cargar la interfaz instalada sin conexión después de la primera visita.

## Pruebas y verificación

Vitest y Testing Library cubrirán la lógica y los flujos principales: selección, búsqueda, edición, persistencia, resumen, limpieza y formato. La etapa se considerará terminada al pasar las pruebas, el análisis estático y `npm run build`, y al iniciar el servidor local sin errores.

## Criterios de aceptación

1. La aplicación se puede usar de punta a punta desde una pantalla móvil sin backend.
2. Recargar conserva la lista actual.
3. El resumen y el texto generado incluyen sólo lo seleccionado, respetan las categorías y muestran la fecha actual en formato `DD/MM/AAAA`.
4. Compartir, copiar e imprimir ofrecen una salida utilizable según las capacidades del navegador.
5. Limpiar elimina selección, cantidades y observaciones tras confirmación.
6. La compilación de producción genera los recursos PWA correctamente.
7. Al seleccionar un producto su cantidad comienza en 1 y nunca puede reducirse por debajo de 1 mientras permanezca seleccionado.
8. El catálogo puede reemplazarse editando un único archivo de datos independiente.
