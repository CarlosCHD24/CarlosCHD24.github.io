# Visor de oportunidades de empleo público

## Fuente verificada

- Dataset: `convocatorias_2026-04-21_2026-08-18_maestro_120_dias.jsonl`.
- Copia pública estable: `frontend/public/data/convocatorias.jsonl`.
- Contrato: JSON Lines con `schema_version: 2`.
- Ventana cubierta: 21 de abril de 2026 a 18 de agosto de 2026.
- Fecha de consolidación: 18 de agosto de 2026.

## Cifras del maestro

- 236 oportunidades consolidadas.
- 83 registros con bolsa confirmada (`pool.existence == YES`).
- 12 registros que requieren revisión (`analysis.status == NEEDS_REVIEW`).
- 28 registros con más de una fuente.
- 5 procesos con solicitudes abiertas (`application_status == OPEN`).
- 25 procesos finalizados (`process_stage == COMPLETED`).
- 157 procesos de selección de plazas, 62 procesos de bolsa y 17 procesos de provisión.

Las cifras visibles en el visor deben calcularse desde el JSONL; no deben quedar fijadas en el código de interfaz.

## Objetivo del visor

La ruta `/empleo-publico/` permite consultar el maestro sin interpretar manualmente cada línea. Debe ofrecer:

- búsqueda de texto tolerante a mayúsculas y tildes;
- filtros de selección múltiple por proceso, bolsa, estado, acceso y fuente; las opciones de una misma categoría
  se combinan como alternativas y las categorías activas se combinan entre sí;
- un panel de filtros desplegable, cerrado por defecto, que conserva y resume los criterios activos;
- un botón independiente para ocultar o volver a mostrar todos los procesos finalizados;
- ordenación y paginación;
- tabla con puesto, organismo, ubicación, plazas, bolsa, estado, fecha, fuente y completitud;
- detalle expandible con titulación, requisitos, solicitudes, fuentes, análisis y notas;
- resumen superior del maestro y resumen inferior del resultado filtrado;
- un bloque final con la cobertura temporal y la descarga del maestro JSONL;
- enlaces a todas las fuentes oficiales disponibles.

## Reglas de presentación

- La interfaz es de solo lectura y no añade reglas de negocio.
- `null` significa que el dato no aplica o no está disponible para ese proceso y se presenta como `—`.
- `UNKNOWN` se presenta como `Desconocido` cuando aporta contexto.
- `NOT_STATED` se presenta como `No indicado en las bases`.
- Las plazas desconocidas no se cuentan como cero.
- Una bolsa pura con plazas nulas se presenta como `Bolsa`.
- La fecha principal es la publicación más reciente de `sources[]`, no `updated_at`.
- La fuente principal prioriza publicación legal, portal del organismo y agregador oficial, por ese orden.
- Todo texto del JSONL se representa como texto React; nunca se inyecta como HTML.

## Alcance

El visor presenta lo que Producción escribió en el maestro. No decide si una persona cumple los requisitos, no inventa bolsas o plazas y no reconstruye estados ausentes.
