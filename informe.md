# Auditoría funcional del visor de empleo público

**Fecha de auditoría:** 8 de septiembre de 2026
**Producto auditado:** [https://carloschd24.github.io/](https://carloschd24.github.io/) y exportación estática local actual
**Objetivo principal evaluado:** ayudar a una persona a encontrar oportunidades de empleo público disponibles y razonablemente accesibles para ella, descartando con facilidad procesos históricos o de acceso restringido.

## Resumen ejecutivo

La web es estable, legible y técnicamente sólida como **visor del maestro completo**, pero todavía no funciona bien como **buscador de oportunidades útiles**. El usuario recibe 302 registros con el mismo peso inicial y debe conocer la terminología administrativa y abrir filtros avanzados para separar lo que puede solicitar de lo que solo sirve para seguimiento o consulta histórica.

El problema más grave no es visual, sino semántico: la interfaz identifica como “finalizado” todo registro cuyo `process_stage` es `COMPLETED`. De los 31 registros que oculta ese control, 29 tienen una bolsa marcada como `ACTIVE`, y uno de ellos mantiene además `application_status: OPEN` con plazo hasta el 16/09/2026. Por tanto, activar “Ocultar finalizadas” puede retirar resultados que el propio conjunto de datos describe como vigentes o abiertos.

La recomendación principal es sustituir la clasificación binaria “finalizado/no finalizado” por estados derivados de utilidad: **inscripción abierta**, **próxima o por confirmar**, **bolsa vigente**, **seguimiento para personas ya inscritas**, **acceso restringido** e **histórico**. Solo después de fijar esas reglas deben construirse la vista recomendada y los atajos de filtrado.

### Diagnóstico resumido

| Área | Valoración | Conclusión |
| --- | --- | --- |
| Estabilidad técnica | Buena | La versión publicada carga sin errores de consola y las comprobaciones actuales pasan. |
| Descubrimiento | Mejorable | La primera vista prioriza presentación y métricas; no muestra una oportunidad completa ni controles directos. |
| Relevancia inicial | Deficiente | Se muestran los 302 registros sin distinguir disponibilidad, audiencia o intención del usuario. |
| Elegibilidad | Crítica | Faltan datos estructurados de titulación y restricciones; el acceso tampoco aparece en la fila. |
| Plazos y acción | Crítica | El detalle no presenta los plazos existentes y 17 de las 20 oportunidades marcadas como abiertas no tienen fecha final estructurada. |
| Filtros | Funcionales, poco orientados a exclusión | Permiten incluir valores, pero no retirar en un clic promoción interna, provisión u otras restricciones. |
| Móvil | Mejorable | La tabla exige desplazamiento horizontal para llegar a estado, plazas, bolsa y fuente. |
| Accesibilidad técnica | Buena base | Las pruebas automáticas WCAG A/AA pasan; quedan problemas de comprensión y uso móvil que Axe no detecta. |

## Alcance y método

Se realizaron las siguientes comprobaciones:

- recorrido funcional en la web publicada y en la exportación estática local;
- inspección en escritorio (1280 × 720) y móvil (390 × 844);
- prueba de búsqueda, filtros, ocultación de finalizadas, expansión de detalle, paginación y enlaces oficiales;
- revisión del componente principal, reglas de presentación, estilos, pruebas y dataset JSONL;
- análisis cuantitativo de los 302 registros y de cruces entre fase, estado de solicitudes, acceso, provisión, bolsa y plazos;
- ejecución de ESLint, 7 pruebas de componentes y 16 pruebas de navegador, todas satisfactorias.

No se ha realizado una revisión jurídica de las bases ni una comprobación manual exhaustiva de las 302 publicaciones externas. La auditoría evalúa el comportamiento del producto y la consistencia interna de los datos que consume.

## Uso esperado y necesidades reales

La persona que llega por primera vez necesita resolver, en este orden:

1. **¿Hay algo a lo que me pueda inscribir ahora?**
2. **¿Puedo participar yo?** Acceso libre o restringido, titulación, cupo, experiencia y otros requisitos.
3. **¿Cuánto tiempo me queda?** Fecha límite, plazo desconocido o plazo cerrado.
4. **¿Me interesa?** Puesto, organismo, municipio, número de plazas, temporalidad y posible bolsa.
5. **¿Cómo lo solicito o verifico?** Acción directa hacia la fuente oficial adecuada.

También existen dos usos secundarios que no deben mezclarse con el anterior:

- una persona ya inscrita que consulta admitidos, examen, méritos o nombramiento;
- una persona incluida en una bolsa que consulta si esta sigue activa.

La pantalla actual mezcla los tres usos en una única tabla ordenada por fecha de publicación.

## Evidencia cuantitativa

| Indicador | Resultado | Implicación funcional |
| --- | ---: | --- |
| Registros totales | 302 | Volumen suficiente para que la priorización sea imprescindible. |
| Solicitudes marcadas como abiertas | 20 (6,6 %) | Solo una minoría responde directamente a “puedo inscribirme ahora”. |
| Abiertas con `FREE`, sin provisión y sin `COMPLETED` | 18 (6,0 %) | Es una aproximación, no una garantía: incluye al menos un cupo de discapacidad. |
| Fase `APPLICATION` | 135 | La etiqueta de fase no equivale a plazo abierto. |
| En `APPLICATION` con estado de solicitud desconocido | 116 (85,9 % de esa fase) | La mayoría se muestra como “Solicitudes” sin aclarar si el plazo está abierto o cerrado. |
| Marcadas `COMPLETED` | 31 (10,3 %) | Es la única condición utilizada por “Ocultar finalizadas”. |
| `COMPLETED` con bolsa `ACTIVE` | 29 | El control de finalizadas oculta todas las bolsas activas del maestro. |
| Promoción interna | 27 (8,9 %) | No existe exclusión directa; el usuario debe incluir manualmente el resto de accesos. |
| Procesos de provisión | 23 (7,6 %) | Incluyen libre designación, traslado, movilidad y comisión de servicios. |
| Unión de completados, promoción interna y provisión | 78 (25,8 %) | Una regla simple podría retirar una cuarta parte del listado, pero no debe aplicarse sin preservar bolsas vigentes y contradicciones. |
| Bolsas confirmadas | 103 | 29 están `ACTIVE` y 74 `PLANNED`; el indicador superior no distingue ambos casos. |
| Registros con periodo de solicitud | 6 (2,0 %) | La cobertura de plazos es insuficiente para ordenar o filtrar con confianza. |
| Abiertas sin fecha final estructurada | 17 de 20 (85 %) | Se necesita un estado explícito “abierta, fecha fin no disponible”. |
| Nivel de titulación conocido | 3 (1,0 %) | No es posible filtrar de forma fiable por titulación. |
| Titulaciones aceptadas estructuradas | 0 | No se puede comprobar compatibilidad académica. |
| Registros con requisitos adicionales | 1 (0,3 %) | Restricciones que sí aparecen en títulos no están modeladas de forma consultable. |

## Hallazgos

### F-01 · Crítico — “Finalizada” no equivale a “sin utilidad”

**Evidencia.** `isFinishedOpportunity()` solo comprueba `process_stage === "COMPLETED"`. Esto oculta 31 registros. Veintinueve de ellos tienen `pool.status === "ACTIVE"`, y el registro “Bolsa docente — Profesores de Enseñanza Secundaria — Dibujo” está simultáneamente `COMPLETED`, `OPEN` y con fecha final 16/09/2026. En la prueba funcional pasó de un resultado a cero al activar “Ocultar finalizadas”.

**Impacto.** El usuario puede perder una convocatoria abierta o una bolsa que continúa administrativamente vigente. Además, “finalizado” puede significar que acabó la selección, no que terminó el valor posterior de su bolsa.

**Mejora propuesta.** Definir un estado de utilidad derivado con precedencia entre solicitudes, bolsa, fase y audiencia. Un plazo abierto debe prevalecer sobre `COMPLETED`; una bolsa activa debe mostrarse como “Bolsa vigente”; solo un proceso sin inscripción abierta, sin bolsa vigente y sin actividad relevante debe entrar en “Histórico”. Añadir validaciones que detecten combinaciones incompatibles.

### F-02 · Crítico — No se muestra el dato principal para actuar: el plazo

**Evidencia.** `application_periods` existe en el contrato y contiene seis periodos, pero no se representa en la tabla ni en el detalle. El caso “Peón/a — 106 plazas” está abierto hasta el 11/09/2026 y el usuario solo ve “Solicitudes abiertas” y una fecha de publicación. Diecisiete de las veinte abiertas carecen además de fecha final estructurada.

**Impacto.** No es posible saber cuánto tiempo queda ni priorizar convocatorias que cierran pronto. La fecha de publicación, rotulada simplemente como “Fecha”, puede confundirse con el límite de solicitud.

**Mejora propuesta.** Añadir “Plazo hasta”, indicador “Cierra pronto” y acción “Ver convocatoria / Solicitar”. Cuando el fin no sea conocido, mostrar “Plazo abierto · fecha fin no disponible” en lugar de omitirlo. Completar la extracción de plazos en la fuente de datos.

### F-03 · Alta — La vista inicial no responde al objetivo principal

**Evidencia.** La carga inicial muestra 302 de 302 resultados. La unión de procesos completados, promoción interna y provisión suma 78 registros. Los filtros empiezan cerrados y los cuatro indicadores superiores son informativos, no accionables. En escritorio, el primer pantallazo contiene el hero y las métricas, pero no el buscador ni las ofertas. En móvil, el primer resultado queda por debajo de los primeros 844 píxeles.

**Impacto.** El usuario debe entender el dataset antes de poder usarlo. Aumentan el abandono y la probabilidad de interpretar como accesible un proceso que no lo es.

**Mejora propuesta.** Crear vistas por intención, con una vista inicial recomendada: “Para inscribirme”, “Próximas / por confirmar”, “Bolsas vigentes”, “Participación iniciada” y “Todas”. Hacer accionables los contadores y acercar búsqueda y atajos al primer pantallazo.

### F-04 · Alta — No se puede determinar la elegibilidad de forma fiable

**Evidencia.** El acceso no aparece en la fila; hay que abrir el detalle. Solo tres registros tienen `qualification_level` conocido, ninguno incluye `accepted_qualifications` y solo uno contiene `additional_requirements`. Restricciones como discapacidad, movilidad o comisión de servicios aparecen principalmente en texto libre. Un registro de cupo de discapacidad está clasificado como `access_channel: FREE`.

**Impacto.** Un filtro “Libre” no significa necesariamente “accesible para cualquier persona”. La interfaz no puede cumplir todavía una personalización por estudios o situación.

**Mejora propuesta.** Incorporar audiencia y restricciones estructuradas: acceso general, promoción interna, movilidad, comisión de servicios, libre designación, cupo de discapacidad, pertenencia a cuerpo/bolsa y requisitos específicos. Mostrar estos datos como etiquetas visibles en cada resultado y admitir `UNKNOWN` con una explicación.

### F-05 · Alta — Los filtros sirven para incluir, no para descartar ruido

**Evidencia.** Para ocultar promoción interna hay que abrir filtros, abrir “Acceso” y marcar los otros cuatro valores. Para retirar provisión hay que marcar “Plazas” y “Bolsas”. Solo los completados tienen un control independiente. En móvil, el botón de finalizadas aparece después de búsqueda, cinco selectores y ordenación.

**Impacto.** La interacción no refleja la intención natural “quítame lo que no puedo solicitar”. La carga de trabajo crece especialmente en móvil.

**Mejora propuesta.** Añadir atajos visibles y reversibles con recuento: “Acceso general”, “Excluir promoción interna”, “Excluir provisión/movilidad”, “Ocultar histórico” y “Solo inscripción abierta”. Mostrar los criterios activos como chips retirables y ofrecer “Ver las 302” como salida clara.

### F-06 · Alta — La ordenación por publicación entierra convocatorias urgentes

**Evidencia.** “Más recientes” usa la última fecha de fuente, no la fecha límite ni la posibilidad de inscribirse. “Peón/a — 106 plazas”, abierta hasta el 11/09/2026, ocupa la posición 93 (página 4). La plaza UPO abierta hasta el 17/09/2026 ocupa la posición 162 (página 7).

**Impacto.** Una persona puede no llegar a ver oportunidades abiertas antes de que cierre el plazo.

**Mejora propuesta.** Ordenar la vista recomendada por capacidad de acción y urgencia: abierta + accesible, fecha de cierre ascendente, plazo desconocido y después fecha de actualización. Conservar “Publicación más reciente” como opción secundaria.

### F-07 · Alta — La tabla no muestra de un vistazo “puedo, cuándo y cómo”

**Evidencia.** Las nueve columnas priorizan bolsa, fuente y calidad, pero no muestran acceso ni fecha límite. “Calidad 50 %” y “Revisión” son conceptos internos que ocupan espacio principal. El enlace se etiqueta con el nombre de la fuente, no con la acción que el usuario quiere realizar.

**Impacto.** Comparar obliga a expandir filas y conocer el significado de los códigos. El porcentaje de completitud puede interpretarse como calidad de la oferta o grado de avance del proceso.

**Mejora propuesta.** Rediseñar cada resultado alrededor de puesto, organismo/municipio, acceso, estado accionable, plazo, plazas y CTA oficial. Mover completitud/confianza a un bloque de transparencia secundario.

### F-08 · Media — La experiencia móvil oculta información crítica en horizontal

**Evidencia.** En móvil la tabla conserva un ancho mínimo de 720 px. En el primer encuadre del listado solo se ven “Puesto” y “Ubicación”; plazas, bolsa, estado y fuente están a la derecha dentro de un contenedor desplazable. La prueba automática solo comprueba que la página completa no desborde, no que la tabla sea comprensible sin desplazamiento lateral.

**Impacto.** El usuario puede no descubrir el estado ni el enlace oficial y comparar filas resulta costoso.

**Mejora propuesta.** Utilizar tarjetas o filas apiladas en móvil, sin dependencia del scroll horizontal, con estado, acceso, plazo y acción visibles.

### F-09 · Media — Búsqueda demasiado literal

**Evidencia.** La normalización elimina tildes y diferencias de mayúsculas, pero exige una subcadena contigua y conserva puntuación. La búsqueda natural “Bolsa docente Profesores Enseñanza Secundaria Dibujo” devolvió cero aunque existe ese título con guiones y palabras intermedias.

**Impacto.** Consultas válidas con varios conceptos fallan sin sugerir una alternativa.

**Mejora propuesta.** Tokenizar la consulta, ignorar puntuación y exigir que todos los términos aparezcan en cualquier campo indexado. Añadir coincidencia por sinónimos controlados solo cuando exista una taxonomía verificable.

### F-10 · Media — Los filtros no se pueden compartir ni recuperar

**Evidencia.** Aplicar búsqueda, filtros, orden o página no cambia la URL. Una recarga devuelve la vista inicial.

**Impacto.** No se puede guardar una búsqueda, enviarla a otra persona ni volver al mismo punto.

**Mejora propuesta.** Sincronizar estado con parámetros de URL y restaurarlo al cargar. Mantener una URL canónica limpia para la vista por defecto.

### F-11 · Media — Etiquetas y métricas mezclan lenguaje interno con lenguaje ciudadano

**Evidencia.** El detalle muestra valores como `LABOR_FIXED`, `PRIMARY`, `FIXED_WINDOW` y `CALL`. “Con bolsa: 103 confirmadas” reúne 29 bolsas activas y 74 previstas. “Fecha” es realmente la última publicación y “Revisión” representa control de datos, no una acción del candidato.

**Impacto.** Se puede confundir existencia futura con disponibilidad actual y publicación con cierre de plazo.

**Mejora propuesta.** Traducir todos los enums, renombrar “Fecha” como “Última actualización”, separar “Bolsas vigentes” de “Bolsas previstas” y explicar calidad de datos fuera del flujo principal.

### F-12 · Media — Las pruebas validan la implementación actual, no el resultado para el usuario

**Evidencia.** Las 7 pruebas de componentes y 16 de navegador pasan, incluida la comprobación automática WCAG. Sin embargo, una prueba espera explícitamente que ocultar finalizadas reduzca 302 a 271, consolidando la regla que también oculta bolsas activas y una convocatoria abierta. No hay pruebas de plazo, audiencia, ranking, URL compartible ni lectura móvil sin scroll horizontal.

**Impacto.** El producto puede pasar CI y seguir fallando en su misión principal.

**Mejora propuesta.** Añadir pruebas basadas en tareas de usuario y casos contradictorios del dominio antes de cambiar la interfaz.

## Arquitectura funcional recomendada

### 1. Vistas por intención

- **Para inscribirme:** solicitudes abiertas y no vencidas, con acceso general por defecto; las restricciones se etiquetan y pueden incluirse conscientemente.
- **Próximas / por confirmar:** procesos detectados o en solicitud cuyo plazo todavía no se ha verificado.
- **Bolsas vigentes:** `pool.status === "ACTIVE"`, sin confundir vigencia de la bolsa con apertura para nuevas inscripciones.
- **Participación iniciada:** admisión, examen, méritos, resultado y nombramiento.
- **Todas:** maestro completo para investigación y transparencia.

Los recuentos deben calcularse desde el dataset y cada vista debe explicar en una frase qué incluye.

### 2. Estado derivado con precedencia explícita

Orden recomendado de evaluación:

1. solicitud abierta y no vencida;
2. bolsa vigente;
3. plazo o estado contradictorio que requiere revisión;
4. proceso próximo o por confirmar;
5. seguimiento de un proceso en curso;
6. acceso restringido;
7. histórico.

La audiencia y el ciclo de vida son dimensiones distintas: una promoción interna puede estar abierta, pero sigue siendo restringida. La interfaz debe poder expresar ambas cosas a la vez.

### 3. Contenido mínimo de cada resultado

- puesto y organismo;
- municipio;
- etiqueta de acceso/audiencia;
- estado accionable;
- fecha límite o aviso de fecha desconocida;
- plazas y tipo de relación cuando estén disponibles;
- indicación de bolsa vigente o prevista;
- botón “Ver convocatoria oficial”.

### 4. Controles rápidos

La zona superior del explorador debe incluir siempre, sin desplegar opciones avanzadas:

- selector de vista;
- búsqueda;
- “Acceso general”;
- “Solo inscripción abierta”;
- “Ocultar histórico”;
- chips de filtros activos y acción “Limpiar”.

Los filtros avanzados seguirían disponibles para fuente, organismo, municipio, tipo de personal, titulación y otras facetas.

## Orden de actuación

1. **Corregir semántica e invariantes de datos.** Sin ello, un filtro más visible amplificaría errores.
2. **Completar audiencia, restricciones y plazos.** Son los datos necesarios para decidir.
3. **Crear vistas por intención, ranking útil y tarjetas orientadas a acción.**
4. **Optimizar móvil, búsqueda y persistencia de filtros.**
5. **Validar con tareas reales y métricas de producto.**

## Criterios de éxito sugeridos

- Ningún registro con solicitud abierta o bolsa vigente se clasifica silenciosamente como histórico.
- El 100 % de los resultados de “Para inscribirme” muestra fecha límite o el texto explícito “fecha fin no disponible”.
- El 100 % muestra audiencia conocida o “acceso por verificar”; nunca se presenta un acceso restringido como general por ausencia de modelo.
- Una persona puede excluir histórico, promoción interna y provisión desde la zona visible con un máximo de una acción por criterio.
- En 390 px, estado, acceso, plazo y enlace oficial se consultan sin scroll horizontal.
- Las oportunidades abiertas que cierran antes aparecen primero, aunque su publicación sea más antigua.
- Una búsqueda con palabras separadas por guiones o por otros términos del título sigue encontrando el resultado.
- La URL reproduce la vista, filtros, orden y búsqueda compartidos.

El backlog ejecutable y sus criterios de aceptación se encuentran en `tasks.md`.
