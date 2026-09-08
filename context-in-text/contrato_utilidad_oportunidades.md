# Contrato funcional de utilidad de oportunidades

**Versión:** 1.2
**Fecha:** 8 de septiembre de 2026
**Ámbito:** clasificación que usa el visor; no modifica el significado administrativo del maestro `schema_version: 2`.

## Principio

El visor separa dos preguntas que no deben resolverse con un único campo:

1. **Ciclo de utilidad:** qué puede hacer ahora una persona con el registro.
2. **Audiencia:** quién puede acceder y qué restricciones verificadas existen.

`process_stage` describe la fase administrativa. No determina por sí solo que una oportunidad carezca de utilidad.

## Ciclos de utilidad

| Estado | Regla | Vista principal |
| --- | --- | --- |
| `OPEN_FOR_APPLICATION` | `application_status === OPEN` y no existe un fin estructurado vencido | Para inscribirme |
| `ACTIVE_POOL` | Sin inscripción abierta y `pool.status === ACTIVE` | Bolsas vigentes |
| `DATA_CONFLICT` | Una fecha final vencida contradice un estado abierto u otra combinación no revisada impide decidir | Todas, con aviso |
| `UPCOMING_OR_UNCONFIRMED` | Fase detectada o fase de solicitud con estado desconocido | Próximas |
| `IN_PROGRESS_FOR_APPLICANTS` | Admisión, examen, méritos, resultado, nombramiento o solicitud cerrada | Participación iniciada |
| `HISTORICAL` | Proceso completado/cancelado sin inscripción abierta ni bolsa vigente | Todas |

### Precedencia

1. Inscripción abierta no vencida.
2. Conflicto que pueda cambiar la capacidad de actuar.
3. Bolsa vigente.
4. Histórico explícito.
5. Próxima o por confirmar.
6. Seguimiento para participantes.

Una selección completada puede producir una bolsa activa. En ese caso el ciclo principal es `ACTIVE_POOL`; esto no significa que la bolsa acepte nuevas inscripciones.

## Audiencia

| Ámbito | Origen estructurado | Presentación |
| --- | --- | --- |
| `GENERAL` | `access_channel === FREE`, salvo restricción exclusiva | Acceso libre |
| `INTERNAL` | `access_channel === INTERNAL_PROMOTION` | Promoción interna |
| `MIXED` | `access_channel === MIXED` | Acceso mixto |
| `RESTRICTED` | Provisión, acceso `OTHER`, cupo exclusivamente reservado o excepción revisada | Motivo específico |
| `UNKNOWN` | `access_channel === UNKNOWN` | Acceso por verificar |

Las restricciones se derivan de campos estructurados: `access_channel`, `process_kind`, `provision_method` y `vacancy_breakdown[].quota`. Las excepciones que todavía no tienen campo propio se mantienen en una lista curada por ID, revisada contra la fuente, y deben migrarse al siguiente esquema del maestro.

### Etiquetas de restricción

- `INTERNAL_PROMOTION`
- `PROVISION`
- `SERVICE_COMMISSION`
- `TRANSFER`
- `OTHER_PROVISION`
- `DISABILITY_QUOTA`
- `INTELLECTUAL_DISABILITY_QUOTA`
- `EXISTING_POOL_MEMBERSHIP`
- `OTHER_ACCESS`

## Caso revisado: bolsa docente de Dibujo

El registro `4af5396d-7b97-4525-9623-c4ec7c868f9f` combina:

- proceso de constitución `COMPLETED`;
- bolsa `ACTIVE`;
- apertura extraordinaria `OPEN` del 03/09/2026 al 16/09/2026;
- requisito obligatorio de pertenecer a otra bolsa docente.

La combinación representa ciclos superpuestos y no se corrige destruyendo información. El visor aplica `OPEN_FOR_APPLICATION`, muestra el aviso de solapamiento y clasifica la audiencia como `RESTRICTED / EXISTING_POOL_MEMBERSHIP`. La validación de dominio registra la excepción revisada y falla ante cualquier caso equivalente no documentado.

## Plazos

- Se utiliza la fecha final más tardía de `application_periods[]` cuando existe.
- Una oportunidad `OPEN` sin fecha final se muestra como “Abierta · fecha fin no disponible”.
- Una fecha final anterior al día actual contradice `OPEN` y produce `DATA_CONFLICT`.
- No se calculan automáticamente días hábiles sin una regla verificable.
- “Última publicación” nunca se rotula ni ordena como fecha límite.

## Vistas

- **Para inscribirme:** `OPEN_FOR_APPLICATION`, excluyendo promoción interna y procesos de provisión. Puede contener otros requisitos específicos, siempre visibles.
- **Próximas:** `UPCOMING_OR_UNCONFIRMED`, con la misma exclusión simple.
- **Bolsas vigentes:** `ACTIVE_POOL`, sin afirmar que admitan nuevas inscripciones.
- **Participación iniciada:** `IN_PROGRESS_FOR_APPLICANTS`.
- **Todas:** ningún filtro de utilidad.

La vista inicial es “Para inscribirme”. “Todas” permanece a una sola acción.

## Orden “Más útiles”

El orden es total y determinista. Aplica, en este orden:

1. capacidad de acción: inscripción abierta, próxima, bolsa vigente, participación iniciada, conflicto e histórico;
2. audiencia: general, mixta, desconocida, restringida e interna;
3. para inscripciones abiertas, fecha final ascendente; las fechas desconocidas van después de las verificadas;
4. última actualización descendente;
5. título e identificador como desempates estables.

La vista “Para inscribirme” usa “Más útiles” inicialmente. Se conservan las alternativas por actualización, plazas y nombre.

## Filtros y exclusiones

- La vista elegida, la búsqueda, los filtros avanzados y los atajos se combinan con **AND**.
- Los valores múltiples dentro de una misma categoría avanzada se combinan con **OR**.
- Los atajos disponibles son acceso general, solo inscripción abierta, excluir promoción interna, excluir provisión/movilidad y ocultar histórico.
- Cada atajo informa de cuántos registros apartaría en el conjunto ya limitado por la vista y los filtros avanzados.
- “Limpiar filtros” conserva la vista y recupera su estado inicial. “Ver todas” abre los 302 registros y retira cualquier filtro adicional.
- Una bolsa activa no se oculta como histórica aunque la selección que la originó esté completada.

## Bolsas vigentes y previstas

- `pool.status === ACTIVE` se presenta como “Bolsa vigente”. Describe una lista ya constituida y no implica inscripción abierta.
- `pool.status === PLANNED` se presenta como “Bolsa prevista”. Describe una bolsa que las bases prevén crear, no una lista utilizable todavía.
- El estado de bolsa y el estado de inscripción son dimensiones independientes y pueden aparecer simultáneamente.

## Fuente oficial principal

El CTA “Ver convocatoria oficial” elige una fuente mediante `source_role`: publicación legal, portal del organismo, agregador oficial y otras fuentes. Dentro de la misma prioridad se escoge la publicación más reciente. El detalle mantiene acceso a todas las fuentes. Si la fuente no aporta URL, se muestra explícitamente “Enlace oficial no disponible”.

## Lenguaje ciudadano

- Los valores del contrato no se muestran directamente. Personal, titulación, modo de solicitud, fase y eventos de fuente usan un catálogo español comprobado contra todos los valores presentes del maestro.
- Un enum futuro sin traducción no se humaniza como si su significado estuviera verificado: se presenta como dato por verificar y la prueba de cobertura debe fallar para exigir una traducción explícita.
- “Última actualización” identifica la publicación oficial más reciente y nunca se presenta como fecha límite.
- La ayuda contextual distingue inscripción abierta, plazo por confirmar, acceso restringido e histórico.

## Búsqueda

- Consulta e índice se normalizan eliminando diferencias de mayúsculas, tildes, puntuación y espacios repetidos.
- La consulta se divide en términos únicos. Todos deben aparecer, pero pueden hacerlo en distinto orden y en diferentes campos.
- Se indexan puesto, organismo, categoría, perfil, especialidad, ubicación, audiencia y los requisitos que realmente existan.
- No se añaden sinónimos ni se relaja la consulta automáticamente. Sin coincidencias se propone retirar términos o filtros.

## URL compartible

- Se serializan vista, consulta, filtros múltiples, exclusiones rápidas, orden, tamaño de página y página.
- Solo se aceptan valores incluidos en los catálogos funcionales; los desconocidos o tamaños/páginas inválidos se descartan.
- Los valores iniciales se omiten, por lo que “Para inscribirme” conserva una URL limpia.
- Cada cambio relevante crea una entrada de historial y `popstate` restaura el estado al navegar atrás o adelante.

## Invariantes y control

- Todo registro debe tener un `access_channel` reconocido.
- Un periodo con inicio y fin no puede terminar antes de empezar.
- `OPEN + COMPLETED` solo se admite como excepción revisada y visible.
- Una bolsa `ACTIVE` no se considera histórica por tener la selección `COMPLETED`.
- Los valores desconocidos se presentan como desconocidos, nunca como negativos.
- La validación de dominio se ejecuta antes de pruebas y build.
