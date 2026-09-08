# Visor de oportunidades de empleo público

## Fuente verificada

- Dataset: `convocatorias_2026-04-21_2026-09-08_maestro_actualizado.jsonl`.
- Copia pública estable: `frontend/public/data/convocatorias.jsonl`.
- Contrato: JSON Lines con `schema_version: 2`.
- Contrato funcional de utilidad del visor: `contrato_utilidad_oportunidades.md`.
- Ventana cubierta: 21 de abril de 2026 a 8 de septiembre de 2026.
- Fecha de consolidación: 8 de septiembre de 2026.
- Trazabilidad de la actualización: `informe_actualizacion_2026-09-08.md`,
  `incidencias_actualizacion_2026-09-08.md` y `fuentes_procesadas_2026-08-19_2026-09-08.json`.
- Las 16 fuentes del catálogo se consultaron; BOE se revisó hasta el 8 de septiembre y el último BOP Sevilla
  localizado fue el boletín 173 del 7 de septiembre.

## Cifras del maestro

- 302 oportunidades consolidadas.
- 103 registros con bolsa confirmada (`pool.existence == YES`): 29 tienen estado `ACTIVE` y 74 `PLANNED`.
- 14 registros que requieren revisión (`analysis.status == NEEDS_REVIEW`).
- 47 registros con más de una fuente.
- 20 procesos con solicitudes abiertas (`application_status == OPEN`).
- 31 procesos finalizados (`process_stage == COMPLETED`).
- 203 procesos de selección de plazas, 76 procesos de bolsa y 23 procesos de provisión.

Las cifras visibles en el visor deben calcularse desde el JSONL; no deben quedar fijadas en el código de interfaz.

## Objetivo del visor

La ruta `/empleo-publico/` permite consultar el maestro sin interpretar manualmente cada línea. Su vista inicial prioriza
las oportunidades con inscripción abierta y deja el maestro completo a una sola acción. Debe ofrecer:

- búsqueda por términos, tolerante a mayúsculas, tildes, puntuación y distinto orden de palabras;
- filtros de selección múltiple por proceso, creación/estado de bolsa, fase, acceso y fuente; las opciones de una misma categoría
  se combinan como alternativas y las categorías activas se combinan entre sí;
- exclusiones rápidas con recuento y chips retirables para acceso general, inscripción abierta, promoción interna,
  provisión/movilidad e histórico;
- un panel de filtros desplegable, cerrado por defecto, que conserva y resume los criterios activos;
- vistas por intención para inscripción abierta, próximas oportunidades, bolsas vigentes, participación iniciada y maestro completo;
- orden “Más útiles” por capacidad de acción, audiencia y urgencia, además de las ordenaciones alternativas y paginación;
- tabla comparativa en escritorio y tarjetas apiladas sin desplazamiento horizontal en móvil;
- cada resultado responde acceso, estado, plazo, plazas, bolsa y fuente oficial; el detalle expandible conserva
  titulación, requisitos, solicitudes, todas las fuentes, transparencia y notas;
- resumen superior del maestro y resumen inferior del resultado filtrado;
- un bloque final con la cobertura temporal y la descarga del maestro JSONL;
- enlaces a todas las fuentes oficiales disponibles.
- estado de vista, consulta, filtros, orden y paginación persistente y compartible mediante URL validada.

## Reglas de presentación

- La interfaz es de solo lectura y no añade reglas de negocio.
- `null` significa que el dato no aplica o no está disponible para ese proceso y se presenta como `—`.
- `UNKNOWN` se presenta como `Desconocido` cuando aporta contexto.
- `NOT_STATED` se presenta como `No indicado en las bases`.
- Las plazas desconocidas no se cuentan como cero.
- Una bolsa pura con plazas nulas se presenta como “No aplicable (bolsa)”; otras plazas desconocidas, como “No indicadas”.
- La fecha principal es la publicación más reciente de `sources[]`, no `updated_at`.
- La fuente principal prioriza publicación legal, portal del organismo y agregador oficial, por ese orden.
- Todo texto del JSONL se representa como texto React; nunca se inyecta como HTML.
- Los enums del contrato se traducen mediante catálogos españoles con cobertura probada sobre el maestro actual.
- La fase administrativa, la vigencia de la bolsa y la apertura de solicitudes se combinan según
  `contrato_utilidad_oportunidades.md`; `COMPLETED` por sí solo no significa histórico.

## Alcance

El visor presenta lo que Producción escribió en el maestro. No decide si una persona cumple los requisitos, no inventa bolsas o plazas y no reconstruye estados ausentes.
