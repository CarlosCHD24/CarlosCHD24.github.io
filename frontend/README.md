# Oportunidades de empleo público

Visor estático de 302 convocatorias, bolsas y procesos de provisión de empleo público en Sevilla y su provincia,
actualizadas hasta el 8 de septiembre de 2026.

## Aplicación

- Next.js 16, React 19 y TypeScript.
- Exportación estática compatible con GitHub Pages.
- Portada en `/` y acceso estable alternativo en `/empleo-publico/`.
- Datos servidos desde `public/data/convocatorias.jsonl`.
- Vista inicial de inscripción abierta y vistas separadas para próximas convocatorias, bolsas vigentes, participación iniciada y maestro completo.
- Audiencia derivada, restricciones visibles, plazos conocidos o explícitamente pendientes y enlaces a fuentes oficiales.
- Búsqueda por términos en cualquier orden, URL compartible, orden por utilidad/urgencia, exclusiones rápidas con
  recuentos/chips y filtros avanzados combinables.
- Bolsas vigentes y previstas separadas, tabla comparativa de escritorio y tarjetas apiladas para móvil.
- Paginación y detalle expandible con todas las fuentes y un bloque específico de transparencia del dato.
- Catálogos ciudadanos para enums administrativos y ayuda breve para interpretar estados.

## Desarrollo

Requiere Node.js 22 y npm.

```bash
npm ci
npm run dev
```

Comprobación completa:

```bash
npm run lint
npm run validate:domain
npm run test:component
npm run build
npm run validate:export
npm run test:e2e
```

`NEXT_PUBLIC_SITE_URL` controla el origen canónico y `SITE_INDEXING` activa o desactiva la indexación. Los valores
locales seguros están documentados en `.env.example`.

La fuente funcional y editorial del visor es `../context-in-text/empleo_publico_visor.md`. El estado de desarrollo
se registra en `../projectProgressControl.md`.
