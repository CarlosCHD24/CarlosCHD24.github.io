# Incidencias — actualización 19/08/2026–08/09/2026

## UPD-001 — BOP del 08/09 no disponible/localizado a la hora de ejecución
- Último BOP provincial recuperado: núm. 173, 07/09/2026.
- BOE sí se ha revisado hasta 08/09/2026.
- Acción: siguiente ejecución debe comenzar comprobando si se publicó posteriormente BOP de 08/09.
- Severidad: BAJA.

## UPD-002 — Movilidad policial
- Caso nuevo: Policía Local de Paradas, 1 plaza por movilidad sin ascenso, BOP 26/08.
- El modelo v2 sigue sin disponer de `MOBILITY` en `access_channel`.
- Solución provisional: `OTHER` + `NEEDS_REVIEW`.
- Severidad: ALTA.

## UPD-003 — Evento SAS OEP 24/08 agregado
- El portal SAS publica listas provisionales de varias categorías, pero el resultado recuperado no identifica de forma fiable todas las categorías afectadas.
- Decisión: no crear un registro agregado contrario a la regla de oportunidad homogénea.
- Acción: descomponer por categoría en una iteración específica SAS.
- Severidad: MEDIA.

## UPD-004 — Convocatoria PTGAS US agregada heredada
- `PTGAS Laboral — acceso libre Grupos I, III y IV` sigue siendo un registro agregado de una convocatoria con varias categorías.
- Se actualiza con admitidos/calendario de 26/08 y cambios de tribunal de 07/09, pero permanece `NEEDS_REVIEW`.
- Acción: descomponer contra los anexos de las bases.
- Severidad: ALTA.

## UPD-005 — Corrección de fechas de bolsas US
- El listado oficial vigente de la Universidad de Sevilla sitúa la bolsa código 4120 como definitiva el 31/08/2026 y EADMINF el 01/09/2026.
- El maestro anterior contenía fechas distintas.
- Acción aplicada: corregir fecha/estado con evidencia oficial actual y documentar la modificación.
- Severidad: MEDIA.

## UPD-006 — UPO: oportunidades activas no descompuestas previamente
- La convocatoria BOE-A-2026-15993 estaba dentro del horizonte histórico pero no figuraba descompuesta en el maestro.
- La revisión actual del portal confirma plazo hasta 17/09/2026.
- Acción aplicada: crear 3 oportunidades homogéneas (IMEE/2026, TEL/2026, TAL/2026), 5 plazas en total.
- Severidad: MEDIA.

## UPD-007 — Puerto: fecha de publicación pendiente
- La plaza de Responsable Económico-Financiero figura actualmente “En proceso”, pero la página índice recuperada no expone fecha de publicación.
- Se persiste con `publication_date = null`, `process_stage = DETECTED`.
- Severidad: BAJA.

## UPD-008 — Cobertura de portales sigue sin ser crawler determinista
- BOP se ha podido recorrer por boletines diarios; en otros portales la revisión es oficial pero asistida por indexación/navegación.
- No se certifica recall 100 % para todas las fuentes.
- Severidad: ALTA.

## Métricas
- Maestro anterior: 236
- Registros/eventos normalizados en la actualización: 102
- Fusiones automáticas seguras contra maestro: 36
- Registros maestros actuales: 302
- NEEDS_REVIEW actuales: 14
