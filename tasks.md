# Backlog de mejoras funcionales

Este backlog deriva de `informe.md`. Las prioridades reflejan riesgo para el usuario, no solo esfuerzo técnico.

## Resumen priorizado

| ID | Estado | Prioridad | Tarea | Tamaño | Dependencias | Hallazgos |
| --- | --- | --- | --- | --- | --- | --- |
| T-01 | ✅ Completada | P0 | Definir el contrato de utilidad, ciclo de vida y audiencia | M | — | F-01, F-03, F-04 |
| T-02 | ✅ Completada | P0 | Corregir contradicciones y añadir validaciones de datos | M | T-01 | F-01, F-12 |
| T-03 | ✅ Completada | P0 | Estructurar audiencia y restricciones de acceso | L | T-01 | F-04, F-05 |
| T-04 | ✅ Completada | P0 | Completar y mostrar plazos de solicitud | L | T-01, T-02 | F-02, F-06 |
| T-05 | ✅ Completada | P0 | Crear vistas por intención y una vista inicial útil | M | T-01, T-02 | F-03, F-05 |
| T-06 | ✅ Completada | P1 | Rediseñar resultados y CTA oficial | M | T-03, T-04, T-05 | F-02, F-04, F-07 |
| T-07 | ✅ Completada | P1 | Implementar ranking por capacidad de acción y urgencia | M | T-01, T-04, T-05 | F-06 |
| T-08 | ✅ Completada | P1 | Añadir exclusiones rápidas, chips y recuentos | M | T-03, T-05 | F-05 |
| T-09 | ✅ Completada | P1 | Separar bolsas vigentes de bolsas previstas | S | T-01, T-02, T-05 | F-01, F-11 |
| T-10 | ✅ Completada | P1 | Sustituir la tabla móvil por tarjetas apiladas | M | T-06 | F-08 |
| T-11 | ✅ Completada | P1 | Traducir enums y revisar métricas/copy | S | T-01, T-09 | F-07, F-11 |
| T-12 | ✅ Completada | P1 | Ampliar pruebas con recorridos de usuario | M | T-01; transversal | F-12 |
| T-13 | ✅ Completada | P2 | Mejorar la búsqueda por términos | M | — | F-09 |
| T-14 | ✅ Completada | P2 | Persistir y compartir el estado en la URL | M | T-05, T-08 | F-10 |
| T-15 | Pendiente | P2 | Realizar prueba de usabilidad y medir resultados | M | T-06 a T-14 | Todos |

## T-01 · Definir el contrato de utilidad, ciclo de vida y audiencia

**Prioridad:** P0
**Estado:** ✅ Completada el 08/09/2026
**Objetivo:** eliminar la ambigüedad entre fase administrativa, posibilidad de inscribirse, vigencia de bolsa y restricción de acceso.

### Alcance

- Documentar estados derivados como mínimo: `OPEN_FOR_APPLICATION`, `UPCOMING_OR_UNCONFIRMED`, `ACTIVE_POOL`, `IN_PROGRESS_FOR_APPLICANTS`, `RESTRICTED`, `HISTORICAL` y `DATA_CONFLICT`.
- Definir la precedencia entre `application_status`, periodos, `pool.status`, `process_stage`, tipo de proceso y audiencia.
- Separar dos dimensiones: **utilidad/ciclo de vida** y **audiencia/restricción**.
- Decidir qué vista recibe un registro con varios estados útiles, sin perder sus etiquetas secundarias.
- Registrar la decisión como contrato funcional versionado junto al contexto del producto.

### Criterios de aceptación

- `COMPLETED + ACTIVE pool` se clasifica como bolsa vigente, no como histórico.
- `COMPLETED + OPEN application` se clasifica como conflicto o inscripción abierta según la regla documentada, pero nunca se oculta silenciosamente.
- Promoción interna, movilidad, comisión de servicios y libre designación se expresan como audiencia/restricción, aunque el proceso esté abierto.
- `APPLICATION + UNKNOWN` se presenta como estado por confirmar, no como plazo abierto.
- Existen ejemplos unitarios y contraejemplos para cada regla.

## T-02 · Corregir contradicciones y añadir validaciones de datos

**Prioridad:** P0
**Estado:** ✅ Completada el 08/09/2026
**Objetivo:** impedir que el visor reciba combinaciones que generen decisiones incorrectas.

**Decisión de implementación:** la bolsa docente de Dibujo no se sobrescribe porque representa dos ciclos reales
superpuestos. Se conserva la fase administrativa, se documenta la excepción, la inscripción abierta prevalece en la
vista y cualquier caso equivalente no revisado hace fallar la validación.

### Alcance

- Revisar y corregir el registro de la bolsa docente de Dibujo (`COMPLETED + OPEN` con fin 16/09/2026).
- Revisar los 31 registros `COMPLETED`, especialmente los 29 con bolsa `ACTIVE`.
- Añadir validaciones de coherencia al proceso de generación del JSONL.
- Generar un resumen de incidencias por actualización, sin bloquear valores `UNKNOWN` legítimos.
- Definir el tratamiento de plazos vencidos frente a `application_status: OPEN`.

### Criterios de aceptación

- La compilación de datos detecta `OPEN` con fecha final vencida, `COMPLETED + OPEN` y otras combinaciones prohibidas por T-01.
- Las excepciones admitidas incluyen motivo explícito y quedan visibles como `DATA_CONFLICT` hasta su resolución.
- Ningún registro conflictivo desaparece de la vista recomendada por una regla de ocultación.
- Las cifras de incidencias se calculan desde el dataset y se cubren con pruebas.

## T-03 · Estructurar audiencia y restricciones de acceso

**Prioridad:** P0
**Estado:** ✅ Completada el 08/09/2026
**Objetivo:** permitir que una persona descarte lo que no puede solicitar sin depender del título.

**Decisión de implementación:** para conservar la compatibilidad del maestro `schema_version: 2`, la audiencia se deriva
en una capa tipada a partir de sus campos estructurados existentes. Solo el caso docente revisado usa una excepción por
ID. El siguiente esquema del productor podrá materializar estos valores sin cambiar el comportamiento del visor.

### Alcance

- Ampliar el esquema con una audiencia normalizada y una lista de motivos de restricción.
- Cubrir al menos: general, promoción interna, movilidad, comisión de servicios, libre designación, traslado, cupo de discapacidad, pertenencia a cuerpo/escala, pertenencia a bolsa y requisito profesional específico.
- Migrar los registros actuales usando fuentes oficiales; no inferir automáticamente una condición jurídica solo por palabras del título sin revisión.
- Mantener `UNKNOWN` y un motivo de falta de dato cuando no pueda verificarse.
- Estructurar nivel/titulaciones aceptadas y requisitos adicionales de forma progresiva.

### Criterios de aceptación

- Todos los registros tienen audiencia conocida o `UNKNOWN`; no hay valores vacíos.
- Los cupos de discapacidad no se presentan únicamente como `FREE` sin etiqueta de restricción.
- Los 27 registros de promoción interna y los 23 de provisión se pueden excluir directamente.
- Las etiquetas visibles se generan desde campos estructurados, no desde búsquedas de texto en el título.
- Se publican métricas de cobertura de audiencia, titulación y requisitos.

## T-04 · Completar y mostrar plazos de solicitud

**Prioridad:** P0
**Estado:** ✅ Completada el 08/09/2026
**Objetivo:** responder “¿hasta cuándo puedo solicitarlo?” en cada oportunidad abierta.

**Decisión de implementación:** se muestran los seis periodos existentes y se señala “fecha fin no disponible” en las
17 abiertas restantes. No se inventan fechas a partir de plazos expresados en días hábiles.

### Alcance

- Extraer fecha inicial, fecha final, base de cálculo y estado del plazo desde las fuentes.
- Representar los seis periodos ya existentes en el detalle.
- Mostrar el final del plazo en resultado y detalle.
- Añadir estados “Cierra hoy”, “Cierra pronto”, “Abierta hasta…”, “Fecha fin no disponible” y “Cerrada”.
- No calcular días hábiles si la regla no está documentada y probada; mostrar en ese caso el texto y la fuente oficial.
- Añadir CTA “Ver convocatoria oficial” junto al plazo.

### Criterios de aceptación

- Toda oportunidad `OPEN` muestra fecha final o aviso explícito de que no está disponible.
- “Peón/a — 106 plazas” muestra 11/09/2026 y la plaza UPO muestra 17/09/2026.
- La bolsa docente de Dibujo no se oculta mientras su periodo siga abierto o el conflicto continúe sin resolver.
- “Fecha de publicación” y “Fecha límite” tienen rótulos distintos.
- Las fechas se prueban en los límites de hoy, mañana, vencida y desconocida.

## T-05 · Crear vistas por intención y una vista inicial útil

**Prioridad:** P0
**Estado:** ✅ Completada el 08/09/2026
**Objetivo:** presentar primero lo que una persona puede hacer, manteniendo acceso al maestro completo.

### Alcance

- Añadir vistas: “Para inscribirme”, “Próximas / por confirmar”, “Bolsas vigentes”, “Participación iniciada” y “Todas”.
- Usar como vista inicial “Para inscribirme” una vez completadas T-01 a T-04.
- Mostrar recuento dinámico y una explicación breve de qué incluye cada vista.
- Convertir indicadores relevantes en accesos directos a su vista.
- Mantener “Todas” como salida visible y reversible.
- Reducir el hero para que búsqueda/vistas entren en el primer pantallazo de escritorio y el acceso al listado sea inmediato en móvil.

### Criterios de aceptación

- La vista inicial no incluye histórico, promoción interna ni provisión salvo elección explícita.
- Ninguna bolsa vigente se pierde: aparece en su vista específica aunque la selección esté completada.
- Cambiar de vista conserva los filtros compatibles y explica los que se hayan retirado.
- Los recuentos no están fijados en código.
- El usuario puede volver a los 302 registros en una acción.

## T-06 · Rediseñar resultados y CTA oficial

**Prioridad:** P1
**Estado:** ✅ Completada el 08/09/2026
**Objetivo:** permitir decidir y actuar sin abrir cada fila.

**Decisión de implementación:** el resultado principal concentra acceso, situación útil, fase, plazo, ubicación,
plazas, estado real de bolsa y CTA. La publicación legal prevalece sobre el portal del organismo y el agregador;
el detalle conserva todas las fuentes. Revisión, completitud y confianza se agrupan en “Transparencia del dato”.

### Alcance

- Priorizar puesto, organismo, municipio, audiencia, estado accionable, plazo, plazas y bolsa.
- Incluir botón claro “Ver convocatoria oficial”.
- Mostrar fuente y última actualización como información secundaria.
- Mover completitud, confianza y estado de revisión a un bloque de transparencia.
- Mantener detalle expandible para requisitos, periodos, notas y todas las fuentes.

### Criterios de aceptación

- “¿Puedo?”, “¿está abierto?”, “¿hasta cuándo?” y “¿dónde lo verifico?” se responden en cada resultado.
- El enlace principal elige la fuente oficial según la prioridad documentada y conserva el acceso a las demás.
- Un dato desconocido se muestra como tal; no se reemplaza por cero ni por una conclusión implícita.
- Los controles siguen siendo utilizables con teclado y nombre accesible.

## T-07 · Implementar ranking por capacidad de acción y urgencia

**Prioridad:** P1
**Estado:** ✅ Completada el 08/09/2026
**Objetivo:** evitar que una oportunidad abierta y próxima a cerrar quede en páginas posteriores.

**Decisión de implementación:** “Más útiles” es un orden total y determinista por ciclo accionable, audiencia,
fecha final conocida ascendente, última actualización, título e ID. Es el orden inicial de “Para inscribirme”.

### Alcance

- Crear orden “Más útiles” para la vista recomendada.
- Priorizar inscripción abierta, audiencia general y fecha final ascendente.
- Colocar plazos abiertos sin fecha conocida después de los que tienen cierre verificable.
- Usar última actualización como desempate.
- Conservar ordenaciones por publicación, plazas y nombre.

### Criterios de aceptación

- Una oportunidad que cierra antes aparece antes que otra de cierre posterior, salvo conflicto de datos visible.
- “Peón/a — 106 plazas” y la plaza UPO no quedan relegadas por publicaciones recientes ya no accionables.
- El algoritmo es determinista, está documentado y tiene pruebas unitarias.
- La interfaz explica qué significa “Más útiles”.

## T-08 · Añadir exclusiones rápidas, chips y recuentos

**Prioridad:** P1
**Estado:** ✅ Completada el 08/09/2026
**Objetivo:** hacer literal la acción “quitar de la vista lo que no me sirve”.

**Decisión de implementación:** los cinco atajos están visibles fuera del panel avanzado, muestran cuántos registros
apartarían y generan chips retirables. Los atajos/categorías combinan con AND y las selecciones internas con OR.
“Limpiar” conserva la vista; “Ver las 302 oportunidades” retira todos los filtros y abre el maestro.

### Alcance

- Añadir controles visibles: “Acceso general”, “Solo inscripción abierta”, “Excluir promoción interna”, “Excluir provisión/movilidad” y “Ocultar histórico”.
- Mostrar chips retirables para todos los criterios activos.
- Mostrar cuántos resultados elimina cada atajo antes o después de activarlo.
- Mantener filtros avanzados de selección múltiple para casos especializados.
- Revisar el contador para que distinga categorías activas de valores seleccionados.

### Criterios de aceptación

- Cada exclusión principal se activa o revierte en una acción desde la zona visible.
- El usuario entiende cuántos resultados ve y cuántos se han apartado.
- “Limpiar” vuelve al estado inicial de la vista actual; “Ver todas” abre el maestro completo.
- Las combinaciones usan reglas AND/OR documentadas y probadas.

## T-09 · Separar bolsas vigentes de bolsas previstas

**Prioridad:** P1
**Estado:** ✅ Completada el 08/09/2026
**Objetivo:** evitar que “Con bolsa” se interprete como una bolsa disponible actualmente.

**Decisión de implementación:** `pool.existence` conserva la previsión contractual y `pool.status` dispone de un
filtro separado. Resultados y resumen distinguen los 29 estados `ACTIVE` de los 74 `PLANNED`; una bolsa puede,
además, tener una inscripción extraordinaria abierta y ambas etiquetas se muestran.

### Alcance

- Sustituir el indicador único por “Bolsas vigentes” y “Bolsas previstas”.
- Añadir filtro de `pool.status` además de `pool.existence`.
- Explicar que una bolsa vigente no implica inscripción abierta.
- Preservar la relación entre un proceso completado y la bolsa que produjo.

### Criterios de aceptación

- Los 29 `ACTIVE` y los 74 `PLANNED` aparecen en categorías distintas.
- Activar “Ocultar histórico” no elimina una bolsa vigente de su vista específica.
- La tarjeta identifica por separado “Bolsa vigente” e “Inscripción abierta”.

## T-10 · Sustituir la tabla móvil por tarjetas apiladas

**Prioridad:** P1
**Estado:** ✅ Completada el 08/09/2026
**Objetivo:** consultar la información decisiva sin desplazamiento horizontal.

**Decisión de implementación:** desde 800 px hacia abajo el listado usa tarjetas semánticas con el mismo orden de
lectura que el visual; la tabla queda para comparación en escritorio. Se mantienen detalle y paginación compartidos.

### Alcance

- Crear presentación de tarjeta para anchos móviles.
- Mantener tabla accesible en escritorio si sigue aportando comparación.
- Colocar estado, audiencia, plazo y CTA en la parte visible de la tarjeta.
- Conservar expansión de detalle y paginación.

### Criterios de aceptación

- A 390 px no existe scroll horizontal en el listado.
- Cada tarjeta muestra puesto, ubicación, acceso, plazo/estado y acción oficial.
- Se prueba a 320, 390, 768, 1280 y 1536 px.
- El orden de lectura del lector de pantalla coincide con el visual.

## T-11 · Traducir enums y revisar métricas/copy

**Prioridad:** P1
**Estado:** ✅ Completada el 08/09/2026
**Objetivo:** usar lenguaje ciudadano y evitar indicadores ambiguos.

**Decisión de implementación:** todos los valores presentes de personal, titulación, solicitud y eventos de fuente
tienen etiqueta española verificada contra el dataset. Las métricas internas de revisión/completitud salen del resumen;
se muestran acceso general y plazos conocidos. La fecha del dataset y una ayuda de estados quedan junto al explorador.

### Alcance

- Traducir `LABOR_FIXED`, `PRIMARY`, `FIXED_WINDOW`, `CALL` y el resto de valores visibles.
- Renombrar “Fecha” a “Última actualización” cuando corresponda.
- Sustituir métricas superiores por información accionable y enlazable.
- Explicar “datos por verificar” sin presentar un porcentaje interno como calidad de la oferta.
- Mostrar fecha de actualización del dataset cerca del explorador.

### Criterios de aceptación

- No queda ningún enum del contrato visible sin etiqueta española.
- Ninguna métrica mezcla bolsas vigentes y previstas.
- Las etiquetas “abierta”, “por confirmar”, “restringida” e “histórica” tienen ayuda breve y coherente.

## T-12 · Ampliar pruebas con recorridos de usuario

**Prioridad:** P1, obligatoria en cada entrega
**Estado:** ✅ Completada el 08/09/2026
**Objetivo:** evitar regresiones funcionales aunque la implementación técnica pase.

**Decisión de implementación:** se añade un catálogo compartido de fixtures normales, contradictorios y restringidos,
pruebas de las cinco vistas y recorridos por intención. La revisión estructural de teclado/lector queda documentada en
`context-in-text/comprobacion_accesibilidad_2026-09-08.md`; la sesión humana con tecnología de apoyo forma parte de T-15.

### Alcance

- Añadir fixtures mínimos para estados normales y contradictorios.
- Cubrir clasificación derivada, fechas, audiencia, ranking y bolsas activas.
- Añadir recorridos E2E de las cinco vistas y exclusiones rápidas.
- Verificar tarjetas móviles sin dependencia horizontal.
- Mantener Axe y añadir comprobaciones manuales documentadas de teclado y lector de pantalla.

### Criterios de aceptación

- Existe una regresión que impide ocultar un registro `OPEN` por estar `COMPLETED`.
- Existe una regresión que conserva `COMPLETED + ACTIVE pool` en “Bolsas vigentes”.
- Las pruebas validan plazos conocidos/desconocidos, promoción interna, provisión y cupo reservado.
- El E2E prueba el objetivo del usuario, no cifras rígidas como 302 → 271.
- Lint, componentes, build, exportación, E2E y WCAG siguen pasando.

## T-13 · Mejorar la búsqueda por términos

**Prioridad:** P2
**Estado:** ✅ Completada el 08/09/2026
**Objetivo:** aceptar consultas naturales aunque las palabras no formen una subcadena literal.

**Decisión de implementación:** se eliminan tildes y puntuación, se deduplican términos y se exige que todos aparezcan
en cualquier parte del índice combinado. El índice incorpora campos principales, ubicaciones, audiencia y requisitos
existentes. Un resultado vacío ofrece limpiar términos/filtros sin relajar silenciosamente la consulta.

### Alcance

- Eliminar puntuación durante la normalización.
- Tokenizar la consulta y comprobar todos los términos sin exigir contigüidad.
- Indexar puesto, organismo, categoría, especialidad y ubicaciones; añadir audiencia/requisitos cuando su cobertura sea fiable.
- Destacar coincidencias solo si no perjudica accesibilidad.

### Criterios de aceptación

- “Bolsa docente Profesores Enseñanza Secundaria Dibujo” encuentra el registro correspondiente.
- Se mantienen tolerancia a tildes y mayúsculas.
- Consultas sin resultados proponen limpiar términos o filtros, sin inventar coincidencias.
- Hay pruebas unitarias de puntuación, orden de términos y múltiples campos.

## T-14 · Persistir y compartir el estado en la URL

**Prioridad:** P2
**Estado:** ✅ Completada el 08/09/2026
**Objetivo:** guardar, recargar y compartir una búsqueda reproducible.

**Decisión de implementación:** vista, consulta, filtros múltiples, exclusiones, orden, tamaño y página se serializan
en parámetros validados. Los valores desconocidos se descartan, el estado inicial mantiene la URL limpia y
`pushState`/`popstate` restauran atrás y adelante sin recarga completa.

### Alcance

- Serializar vista, consulta, filtros, orden, tamaño de página y página en parámetros.
- Restaurar el estado al cargar y responder a navegación atrás/adelante.
- Omitir parámetros correspondientes a valores por defecto.
- Validar y descartar valores desconocidos de forma segura.

### Criterios de aceptación

- Copiar y abrir una URL reproduce el mismo conjunto y orden.
- Recargar no borra la búsqueda.
- Atrás/adelante restaura estados previos sin recarga completa.
- La vista por defecto mantiene una URL limpia.

## T-15 · Realizar prueba de usabilidad y medir resultados

**Prioridad:** P2
**Objetivo:** comprobar con personas que el rediseño reduce esfuerzo y errores.

### Alcance

- Probar con perfiles de acceso general, participante ya inscrito e integrante de bolsa.
- Tareas: encontrar algo inscribible, excluir promoción interna, localizar cierre próximo, encontrar una bolsa vigente y compartir una búsqueda.
- Medir éxito, tiempo, errores y necesidad de ayuda.
- Registrar solo analítica agregada y respetuosa con la privacidad si se instrumenta el producto.

### Criterios de aceptación

- Al menos cinco sesiones cualitativas cubren los perfiles principales.
- El 80 % completa cada tarea principal sin ayuda.
- Ninguna persona interpreta “bolsa vigente” como “inscripción abierta” ni “última actualización” como fecha límite.
- Los hallazgos generan tareas concretas y priorizadas antes de cerrar la iteración.

## Secuencia de entrega recomendada

### Iteración 1 · Semántica segura

T-01, T-02 y la base de T-12.

### Iteración 2 · Datos para decidir

T-03, T-04 y ampliación de T-12.

### Iteración 3 · Experiencia principal (completada)

T-05 a T-09 y T-11 completadas.

### Iteración 4 · Móvil, recuperación y validación

T-10, T-12, T-13 y T-14 completadas. T-15 queda fuera de esta publicación.

## Definición de terminado común

Una tarea de interfaz o datos no se considera terminada hasta que:

- conserva la trazabilidad hacia las fuentes oficiales;
- diferencia dato desconocido de dato no aplicable;
- incluye pruebas unitarias y/o E2E proporcionales al riesgo;
- pasa lint, componentes, build, validación de exportación, E2E y WCAG automática;
- se revisa en 390 px y 1280 px como mínimo;
- actualiza el contrato funcional y el control de progreso cuando cambia una regla de negocio.
