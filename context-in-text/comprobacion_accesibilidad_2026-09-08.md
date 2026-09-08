# Comprobación de teclado y lectura — visor de empleo público

**Fecha:** 8 de septiembre de 2026
**Rutas:** `/` y `/empleo-publico/`
**Alcance:** comprobación estructural/manual y regresiones automáticas. No sustituye una sesión con una persona usuaria de tecnología de apoyo.

## Teclado

- Los selectores de vista y atajos son botones y exponen su estado con `aria-pressed`.
- El panel avanzado y la ayuda de estados usan `details/summary` nativos.
- Los títulos de resultados son botones con `aria-expanded` y `aria-controls`.
- El CTA oficial es un enlace con nombre descriptivo y foco visible.
- Los chips se anuncian como “Quitar filtro…” y se activan con teclado.
- La regresión E2E enfoca y activa mediante `Enter` un atajo, un detalle y el enlace oficial.

## Orden y nombres accesibles

- La tarjeta móvil sigue en DOM el orden visual: puesto/organismo, ubicación, acceso, estado, plazo, plazas, etiquetas, acción y detalle.
- Cada dato de la tarjeta usa `dt/dd`, de modo que valor y rótulo conservan su relación.
- Tabla y tarjetas tienen un nombre de región equivalente; solo la presentación correspondiente al ancho permanece visible.
- Los detalles duplicados de escritorio y móvil utilizan identificadores distintos para evitar relaciones ARIA ambiguas.
- Los iconos `+`, `−` y `↗` están ocultos al árbol accesible cuando el texto ya comunica la acción.

## Automatización ejecutada

- Axe sobre ambas rutas con reglas WCAG 2 A/AA y 2.1 A/AA.
- Interacción real de teclado mediante Playwright.
- Verificación del orden de términos `Ubicación → Acceso → Estado → Plazo → Plazas` en la tarjeta.
- Ausencia de desbordamiento horizontal a 320, 390, 768, 1280 y 1536 px.

## Comprobación humana pendiente

La validación futura con lector de pantalla deberá recorrer al menos una búsqueda, un cambio de vista, una exclusión,
la expansión de un resultado y el regreso desde una fuente oficial con VoiceOver o NVDA. Esta comprobación queda fuera
de la presente publicación.
