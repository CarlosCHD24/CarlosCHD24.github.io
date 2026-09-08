# Validación funcional del maestro — 8 de septiembre de 2026

Resultado de `npm run validate:domain` sobre `frontend/public/data/convocatorias.jsonl`.

## Resultado

- 302 registros válidos y únicos.
- 0 errores de dominio no revisados.
- 18 advertencias:
  - 17 solicitudes abiertas sin fecha final estructurada;
  - 1 solapamiento de ciclos revisado y documentado.
- 20 solicitudes abiertas.
- 29 bolsas activas; las 29 proceden de selecciones administrativamente completadas.
- 27 registros de promoción interna.
- 23 procesos de provisión.
- 116 registros en fase de solicitud cuyo estado de apertura no está confirmado.

## Excepción revisada

El registro `4af5396d-7b97-4525-9623-c4ec7c868f9f` no es un error simple de fase. La selección original está
completada, la bolsa sigue activa y existe una apertura extraordinaria hasta el 16/09/2026 restringida a integrantes
de otras bolsas docentes. Se conserva la información fuente y se resuelve en presentación según
`contrato_utilidad_oportunidades.md`.

## Tratamiento de advertencias

Las 17 oportunidades abiertas sin fecha final no reciben una fecha calculada. El visor muestra
“Abierta · fecha fin no disponible” y mantiene el enlace a la publicación oficial. La falta de fecha seguirá siendo
visible en cada validación hasta que la fuente de datos incorpore un periodo verificable.

## Entrega funcional T-06 a T-10

- Validación de dominio: 302 registros, 0 errores y las 18 advertencias conocidas/documentadas.
- ESLint y TypeScript: sin errores.
- Pruebas unitarias: 21 superadas; cubren ranking determinista, urgencia, filtros rápidos y separación de bolsas.
- Build y exportación estática: correctos; 42 archivos y 3,39 MiB.
- Línea base de seguridad: correcta con cuatro avisos transitivos revisados y documentados por el validador.
- Pruebas E2E: 28 superadas, incluidas CTA/fuentes, chips, filtros, teclado, tarjetas móviles y detalle de transparencia.
- Accesibilidad automática: sin infracciones WCAG A/AA detectables en `/` ni `/empleo-publico/`.
- Responsive: sin desbordamiento horizontal a 320, 390, 768, 1280 y 1536 px; tarjetas hasta 800 px y tabla en escritorio.
- Orden de lectura móvil: ubicación, acceso, estado, plazo y plazas coincide en DOM y presentación.

## Entrega funcional T-11 a T-14

- Catálogos ciudadanos: todos los enums presentes de personal, titulación, solicitud, selección, acceso, proceso,
  bolsa, fase, fuente y evento disponen de etiqueta probada; no se exponen valores técnicos en el detalle comprobado.
- Búsqueda: normalización de puntuación/tildes y coincidencia de todos los términos en cualquier orden o campo.
- URL: round-trip unitario y recorridos E2E de copia, recarga, página, atrás/adelante y descarte de parámetros inválidos.
- Fixtures: casos compartidos de apertura normal, `OPEN + COMPLETED`, bolsa activa completada, promoción interna,
  provisión y cupo reservado.
- Validación de dominio: 302 registros, 0 errores y 18 advertencias conocidas/documentadas.
- ESLint, TypeScript, build, exportación estática y línea base de seguridad: correctos.
- Pruebas unitarias: 26 superadas.
- Pruebas E2E: 33 superadas, incluidas las cinco vistas y las pruebas WCAG A/AA y responsive.

T-15 queda expresamente fuera de esta entrega y permanece pendiente en el backlog.
