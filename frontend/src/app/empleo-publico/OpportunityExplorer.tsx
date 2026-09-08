"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ACCESS_LABELS,
  APPLICATION_MODE_LABELS,
  DEFAULT_OPPORTUNITY_URL_STATE,
  PERSONNEL_TYPE_LABELS,
  POOL_LABELS,
  POOL_STATUS_LABELS,
  PROCESS_KIND_LABELS,
  QUALIFICATION_LEVEL_LABELS,
  SELECTION_LABELS,
  compareOpportunities,
  formatDate,
  formatLocation,
  formatProcessStatus,
  formatRequirement,
  formatSourceEvent,
  formatSourceLabel,
  formatUnknownValue,
  formatVacancies,
  getLatestPublicationDate,
  getOpportunityClassification,
  getAudienceProfile,
  getPrimarySource,
  getTodayDateString,
  matchesOpportunityView,
  matchesQuickFilters,
  matchesSearchQuery,
  matchesSelectedStatus,
  matchesSelectedValue,
  parseOpportunityUrlState,
  serializeOpportunityUrlState,
  VIEW_OPTIONS,
  type Opportunity,
  type OpportunitySortMode,
  type OpportunityView,
  type QuickFilters,
} from "./opportunityUtils";
import styles from "./page.module.css";

type FilterOption = { value: string; label: string };

const DATASET_URL = "/data/convocatorias.jsonl";
const DATASET_UPDATED_LABEL = "8 de septiembre de 2026";
const PROCESS_OPTIONS: FilterOption[] = [
  { value: "POSITION_SELECTION", label: "Plazas" },
  { value: "POOL_SELECTION", label: "Bolsas" },
  { value: "POSITION_PROVISION", label: "Provisión" },
];
const POOL_OPTIONS: FilterOption[] = [
  { value: "YES", label: "Sí" },
  { value: "CONDITIONAL", label: "Posible" },
  { value: "NO", label: "No" },
  { value: "UNKNOWN", label: "Desconocido" },
  { value: "NOT_STATED", label: "No indicada" },
];
const POOL_STATUS_OPTIONS: FilterOption[] = [
  { value: "ACTIVE", label: "Vigente" },
  { value: "PLANNED", label: "Prevista" },
  { value: "INACTIVE", label: "No vigente" },
  { value: "EXHAUSTED", label: "Agotada" },
  { value: "CANCELLED", label: "Cancelada" },
  { value: "UNKNOWN", label: "Por verificar" },
];
const STATUS_OPTIONS: FilterOption[] = [
  { value: "OPEN", label: "Solicitudes abiertas" },
  { value: "DETECTED", label: "Detectado" },
  { value: "APPLICATION", label: "Solicitudes" },
  { value: "ADMISSION", label: "Admitidos" },
  { value: "EXAM", label: "Examen" },
  { value: "MERITS", label: "Méritos" },
  { value: "APPOINTMENT", label: "Nombramiento" },
  { value: "COMPLETED", label: "Finalizado" },
  { value: "REVIEW", label: "Necesita revisión" },
];
const ACCESS_OPTIONS: FilterOption[] = [
  { value: "GENERAL", label: "Acceso general" },
  { value: "INTERNAL", label: "Promoción interna" },
  { value: "MIXED", label: "Acceso mixto" },
  { value: "RESTRICTED", label: "Acceso restringido" },
  { value: "UNKNOWN", label: "Por verificar" },
];
const EMPTY_QUICK_FILTERS: QuickFilters = {
  generalOnly: false,
  openOnly: false,
  excludeInternal: false,
  excludeProvision: false,
  hideHistorical: false,
};
const QUICK_FILTER_OPTIONS: Array<{ key: keyof QuickFilters; label: string }> = [
  { key: "generalOnly", label: "Acceso general" },
  { key: "openOnly", label: "Solo inscripción abierta" },
  { key: "excludeInternal", label: "Excluir promoción interna" },
  { key: "excludeProvision", label: "Excluir provisión/movilidad" },
  { key: "hideHistorical", label: "Ocultar histórico" },
];

function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  disabled = false,
}: {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}) {
  const selectedLabel =
    selected.length === 0
      ? "Todos"
      : selected.length === 1
        ? options.find((option) => option.value === selected[0])?.label ?? "1 seleccionado"
        : `${selected.length} seleccionados`;

  function toggleValue(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  }

  return (
    <details className={styles.multiSelect}>
      <summary aria-label={`${label}: ${selectedLabel}`}>
        <span>{label}</span>
        <strong>{selectedLabel}</strong>
      </summary>
      <div className={styles.multiSelectMenu}>
        <fieldset disabled={disabled}>
          <legend className={styles.srOnly}>{`Seleccionar ${label.toLowerCase()}`}</legend>
          {options.map((option) => (
            <label key={option.value} className={styles.multiSelectOption}>
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggleValue(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>
        {selected.length > 0 && (
          <button type="button" onClick={() => onChange([])}>
            Mostrar todos
          </button>
        )}
      </div>
    </details>
  );
}

function DetailValue({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className={styles.detailValue}>
      <dt>{label}</dt>
      <dd>{value == null || value === "" ? "—" : value}</dd>
    </div>
  );
}

function EmptyResults({ onClear }: { onClear: () => void }) {
  return (
    <div className={styles.emptyState}>
      <strong>No hay oportunidades que coincidan con la búsqueda.</strong>
      <span>Prueba a quitar algún término o filtro.</span>
      <button type="button" onClick={onClear}>Limpiar filtros</button>
    </div>
  );
}

function OpportunityDetails({
  record,
  today,
  idPrefix,
}: {
  record: Opportunity;
  today: string;
  idPrefix: string;
}) {
  const classification = getOpportunityClassification(record, today);

  return (
    <div className={styles.details}>
      {classification.conflicts.length > 0 && (
        <div className={styles.dataConflict} role="status">
          <strong>Datos administrativos superpuestos</strong>
          {classification.conflicts.map((conflict) => <span key={conflict}>{conflict}</span>)}
        </div>
      )}
      <div className={styles.detailGrid}>
        <DetailValue label="Situación útil" value={classification.lifecycleLabel} />
        <DetailValue label="Quién puede acceder" value={classification.audience.label} />
        <DetailValue label="Plazo" value={classification.deadline.label} />
        <DetailValue label="Tipo de proceso" value={PROCESS_KIND_LABELS[record.process_kind] ?? formatUnknownValue(record.process_kind)} />
        <DetailValue label="Sistema selectivo" value={SELECTION_LABELS[record.selection_system] ?? formatUnknownValue(record.selection_system)} />
        <DetailValue label="Acceso" value={ACCESS_LABELS[record.access_channel] ?? formatUnknownValue(record.access_channel)} />
        <DetailValue label="Personal" value={PERSONNEL_TYPE_LABELS[record.personnel_type ?? "UNKNOWN"] ?? formatUnknownValue(record.personnel_type)} />
        <DetailValue label="Titulación" value={record.qualification_text ?? QUALIFICATION_LEVEL_LABELS[record.qualification_level ?? "UNKNOWN"] ?? formatUnknownValue(record.qualification_level)} />
        <DetailValue label="Modo de solicitud" value={APPLICATION_MODE_LABELS[record.application_mode ?? "UNKNOWN"] ?? formatUnknownValue(record.application_mode)} />
        <DetailValue label="Plazas iniciales" value={record.vacancies_initial} />
        <DetailValue label="Plazas actuales" value={record.vacancies_current} />
        <DetailValue label="Bolsa" value={POOL_LABELS[record.pool.existence] ?? formatUnknownValue(record.pool.existence)} />
        <DetailValue label="Estado de la bolsa" value={POOL_STATUS_LABELS[record.pool.status ?? "UNKNOWN"] ?? formatUnknownValue(record.pool.status)} />
      </div>

      {record.application_periods.length > 0 && (
        <section className={styles.detailSection} aria-labelledby={`${idPrefix}-periods-${record.id}`}>
          <h3 id={`${idPrefix}-periods-${record.id}`}>Plazos de solicitud</h3>
          <ul>
            {record.application_periods.map((period, index) => (
              <li key={`${record.id}-period-${index}`}>
                {period.start_date ? `Desde ${formatDate(period.start_date)}` : "Inicio no disponible"}
                {period.end_date ? ` hasta ${formatDate(period.end_date)}` : " · fecha fin no disponible"}
              </li>
            ))}
          </ul>
        </section>
      )}

      {record.locations.length > 0 && (
        <section className={styles.detailSection} aria-labelledby={`${idPrefix}-locations-${record.id}`}>
          <h3 id={`${idPrefix}-locations-${record.id}`}>Ubicaciones</h3>
          <ul>
            {record.locations.map((location, index) => (
              <li key={`${record.id}-location-${index}`}>
                {[location.municipality, location.province, location.site, location.unit]
                  .filter(Boolean)
                  .join(" · ")}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(record.accepted_qualifications.length > 0 || record.additional_requirements.length > 0) && (
        <section className={styles.detailSection} aria-labelledby={`${idPrefix}-requirements-${record.id}`}>
          <h3 id={`${idPrefix}-requirements-${record.id}`}>Titulación y requisitos</h3>
          <ul>
            {record.accepted_qualifications.map((item, index) => (
              <li key={`${record.id}-qualification-${index}`}>{item}</li>
            ))}
            {record.additional_requirements.map((item, index) => (
              <li key={`${record.id}-requirement-${index}`}>{formatRequirement(item)}</li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.detailSection} aria-labelledby={`${idPrefix}-sources-${record.id}`}>
        <h3 id={`${idPrefix}-sources-${record.id}`}>Fuentes oficiales</h3>
        <ul className={styles.sourceList}>
          {record.sources.map((source, index) => {
            const href = source.url ?? source.document_url;
            return (
              <li key={`${record.id}-source-${index}`}>
                <div>
                  <strong>{formatSourceLabel(source.source_id)}</strong>
                  <span>
                    {formatDate(source.publication_date)}
                    {source.event_types.length ? ` · ${source.event_types.map(formatSourceEvent).join(", ")}` : ""}
                  </span>
                </div>
                {href && (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    Abrir publicación <span aria-hidden="true">↗</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {record.notes && (
        <section className={styles.detailSection} aria-labelledby={`${idPrefix}-notes-${record.id}`}>
          <h3 id={`${idPrefix}-notes-${record.id}`}>Notas</h3>
          <p>{record.notes}</p>
        </section>
      )}

      <section className={`${styles.detailSection} ${styles.transparency}`} aria-labelledby={`${idPrefix}-transparency-${record.id}`}>
        <h3 id={`${idPrefix}-transparency-${record.id}`}>Transparencia del dato</h3>
        <dl>
          <DetailValue label="Estado de revisión" value={record.analysis.status === "NEEDS_REVIEW" ? "Necesita revisión" : "Revisado"} />
          <DetailValue label="Completitud" value={`${record.analysis.completeness_pct}%`} />
          <DetailValue label="Confianza" value={record.analysis.confidence == null ? "Desconocida" : `${Math.round(record.analysis.confidence * 100)}%`} />
          <DetailValue label="Última actualización" value={formatDate(getLatestPublicationDate(record))} />
        </dl>
      </section>
    </div>
  );
}

export default function OpportunityExplorer() {
  const [records, setRecords] = useState<Opportunity[]>([]);
  const [invalidLines, setInvalidLines] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [processKinds, setProcessKinds] = useState<string[]>([]);
  const [poolExistences, setPoolExistences] = useState<string[]>([]);
  const [poolStatuses, setPoolStatuses] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [accesses, setAccesses] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [quickFilters, setQuickFilters] = useState<QuickFilters>(EMPTY_QUICK_FILTERS);
  const [view, setView] = useState<OpportunityView>(DEFAULT_OPPORTUNITY_URL_STATE.view);
  const [sort, setSort] = useState<OpportunitySortMode>(DEFAULT_OPPORTUNITY_URL_STATE.sort);
  const [pageSize, setPageSize] = useState(DEFAULT_OPPORTUNITY_URL_STATE.pageSize);
  const [page, setPage] = useState(DEFAULT_OPPORTUNITY_URL_STATE.page);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [urlReady, setUrlReady] = useState(false);
  const previousUrlSearch = useRef("");
  const today = useMemo(() => getTodayDateString(), []);

  useEffect(() => {
    let active = true;
    function restoreFromUrl() {
      if (!active) return;
      const restored = parseOpportunityUrlState(new URLSearchParams(window.location.search));
      previousUrlSearch.current = window.location.search;
      setView(restored.view);
      setQuery(restored.query);
      setProcessKinds(restored.processKinds);
      setPoolExistences(restored.poolExistences);
      setPoolStatuses(restored.poolStatuses);
      setStatuses(restored.statuses);
      setAccesses(restored.accesses);
      setSources(restored.sources);
      setQuickFilters(restored.quickFilters);
      setSort(restored.sort);
      setPageSize(restored.pageSize);
      setPage(restored.page);
      setExpandedId(null);
      setUrlReady(true);
    }

    queueMicrotask(restoreFromUrl);
    window.addEventListener("popstate", restoreFromUrl);
    return () => {
      active = false;
      window.removeEventListener("popstate", restoreFromUrl);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDataset() {
      try {
        const response = await fetch(DATASET_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        const parsed: Opportunity[] = [];
        let invalid = 0;

        for (const line of text.split("\n")) {
          if (!line.trim()) continue;
          try {
            const record = JSON.parse(line) as Opportunity;
            if (record.schema_version !== 2 || !record.id || !record.title) {
              invalid += 1;
              continue;
            }
            parsed.push(record);
          } catch {
            invalid += 1;
          }
        }

        if (!cancelled) {
          setRecords(parsed);
          setInvalidLines(invalid);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setLoadError("No se ha podido cargar el fichero de datos.");
          setLoading(false);
        }
      }
    }

    void loadDataset();
    return () => {
      cancelled = true;
    };
  }, []);

  const sourceOptions = useMemo(
    () =>
      [...new Set(records.flatMap((record) => record.sources.map((item) => item.source_id)))].sort(
        (a, b) => formatSourceLabel(a).localeCompare(formatSourceLabel(b), "es"),
      ),
    [records],
  );

  const advancedMatchedRecords = useMemo(() => {
    return records.filter((record) => {
      if (!matchesOpportunityView(record, view, today)) return false;
      if (!matchesSearchQuery(record, query)) return false;
      if (!matchesSelectedValue(record.process_kind, processKinds)) return false;
      if (!matchesSelectedValue(record.pool.existence, poolExistences)) return false;
      if (!matchesSelectedValue(record.pool.status ?? "UNKNOWN", poolStatuses)) return false;
      if (!matchesSelectedValue(getAudienceProfile(record).scope, accesses)) return false;
      if (sources.length > 0 && !record.sources.some((item) => sources.includes(item.source_id))) return false;
      if (!matchesSelectedStatus(record, statuses)) return false;
      return true;
    });
  }, [accesses, poolExistences, poolStatuses, processKinds, query, records, sources, statuses, today, view]);

  const filteredRecords = useMemo(
    () => advancedMatchedRecords
      .filter((record) => matchesQuickFilters(record, quickFilters, today))
      .sort((a, b) => compareOpportunities(a, b, sort, today)),
    [advancedMatchedRecords, quickFilters, sort, today],
  );

  const quickFilterCounts = useMemo(() => Object.fromEntries(
    QUICK_FILTER_OPTIONS.map(({ key }) => [
      key,
      advancedMatchedRecords.filter((record) => !matchesQuickFilters(
        record,
        { ...EMPTY_QUICK_FILTERS, [key]: true },
        today,
      )).length,
    ]),
  ) as Record<keyof QuickFilters, number>, [advancedMatchedRecords, today]);

  const effectivePageSize = pageSize === 0 ? Math.max(records.length, 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / effectivePageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRecords = filteredRecords.slice((safePage - 1) * effectivePageSize, safePage * effectivePageSize);

  useEffect(() => {
    if (!urlReady) return;
    const nextSearch = serializeOpportunityUrlState({
      view,
      query,
      processKinds,
      poolExistences,
      poolStatuses,
      statuses,
      accesses,
      sources,
      quickFilters,
      sort,
      pageSize,
      page: loading ? page : safePage,
    });
    if (nextSearch === previousUrlSearch.current) return;
    window.history.pushState(null, "", `${window.location.pathname}${nextSearch}${window.location.hash}`);
    previousUrlSearch.current = nextSearch;
  }, [accesses, loading, page, pageSize, poolExistences, poolStatuses, processKinds, query, quickFilters, safePage, sort, sources, statuses, urlReady, view]);

  const viewMetrics = useMemo(
    () => Object.fromEntries(
      VIEW_OPTIONS.map((option) => [
        option.value,
        records.filter((record) => matchesOpportunityView(record, option.value, today)).length,
      ]),
    ) as Record<OpportunityView, number>,
    [records, today],
  );

  const filteredMetrics = useMemo(() => {
    const vacancies = filteredRecords.reduce(
      (total, record) => total + (record.vacancies_current ?? 0),
      0,
    );
    return {
      vacancies,
      activePools: filteredRecords.filter((record) => record.pool.status === "ACTIVE").length,
      plannedPools: filteredRecords.filter((record) => record.pool.status === "PLANNED").length,
      open: filteredRecords.filter((record) => record.application_status === "OPEN").length,
      generalAccess: filteredRecords.filter((record) => getAudienceProfile(record).scope === "GENERAL").length,
      knownDeadline: filteredRecords.filter((record) => getOpportunityClassification(record, today).deadline.endDate).length,
    };
  }, [filteredRecords, today]);

  const activeFilterCategories =
    (query.trim() ? 1 : 0) +
    (processKinds.length ? 1 : 0) +
    (poolExistences.length ? 1 : 0) +
    (poolStatuses.length ? 1 : 0) +
    (statuses.length ? 1 : 0) +
    (accesses.length ? 1 : 0) +
    (sources.length ? 1 : 0) +
    Object.values(quickFilters).filter(Boolean).length;
  const activeFilterValues =
    (query.trim() ? 1 : 0) + processKinds.length + poolExistences.length + poolStatuses.length +
    statuses.length + accesses.length + sources.length + Object.values(quickFilters).filter(Boolean).length;

  function clearFilters() {
    setQuery("");
    setProcessKinds([]);
    setPoolExistences([]);
    setPoolStatuses([]);
    setStatuses([]);
    setAccesses([]);
    setSources([]);
    setQuickFilters(EMPTY_QUICK_FILTERS);
    setSort(view === "apply" ? "useful" : "recent");
    setPage(1);
    setExpandedId(null);
  }

  function showAllRecords() {
    setView("all");
    setQuery("");
    setProcessKinds([]);
    setPoolExistences([]);
    setPoolStatuses([]);
    setStatuses([]);
    setAccesses([]);
    setSources([]);
    setQuickFilters(EMPTY_QUICK_FILTERS);
    setSort("recent");
    setPage(1);
    setExpandedId(null);
  }

  function toggleQuickFilter(key: keyof QuickFilters) {
    setQuickFilters((current) => ({ ...current, [key]: !current[key] }));
    setPage(1);
    setExpandedId(null);
  }

  function selectView(nextView: OpportunityView) {
    setView(nextView);
    setPage(1);
    setExpandedId(null);
  }

  const activeChips: Array<{ id: string; label: string; onRemove: () => void }> = [];
  if (query.trim()) activeChips.push({ id: "query", label: `Búsqueda: ${query.trim()}`, onRemove: () => { setQuery(""); setPage(1); } });
  for (const value of processKinds) activeChips.push({ id: `process-${value}`, label: PROCESS_OPTIONS.find((item) => item.value === value)?.label ?? value, onRemove: () => { setProcessKinds((current) => current.filter((item) => item !== value)); setPage(1); } });
  for (const value of poolExistences) activeChips.push({ id: `pool-existence-${value}`, label: `Bolsa: ${POOL_OPTIONS.find((item) => item.value === value)?.label ?? value}`, onRemove: () => { setPoolExistences((current) => current.filter((item) => item !== value)); setPage(1); } });
  for (const value of poolStatuses) activeChips.push({ id: `pool-status-${value}`, label: POOL_STATUS_OPTIONS.find((item) => item.value === value)?.label ?? value, onRemove: () => { setPoolStatuses((current) => current.filter((item) => item !== value)); setPage(1); } });
  for (const value of statuses) activeChips.push({ id: `status-${value}`, label: STATUS_OPTIONS.find((item) => item.value === value)?.label ?? value, onRemove: () => { setStatuses((current) => current.filter((item) => item !== value)); setPage(1); } });
  for (const value of accesses) activeChips.push({ id: `access-${value}`, label: ACCESS_OPTIONS.find((item) => item.value === value)?.label ?? value, onRemove: () => { setAccesses((current) => current.filter((item) => item !== value)); setPage(1); } });
  for (const value of sources) activeChips.push({ id: `source-${value}`, label: formatSourceLabel(value), onRemove: () => { setSources((current) => current.filter((item) => item !== value)); setPage(1); } });
  for (const option of QUICK_FILTER_OPTIONS) {
    if (quickFilters[option.key]) activeChips.push({ id: `quick-${option.key}`, label: option.label, onRemove: () => toggleQuickFilter(option.key) });
  }

  return (
    <main id="main-content" className={styles.page} lang="es">
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Datos públicos · Sevilla</span>
          <h1>Oportunidades de empleo público</h1>
          <p>
            Convocatorias, bolsas y procesos de provisión consolidados en un único visor. Busca,
            filtra y abre siempre la publicación oficial.
          </p>
        </div>
      </header>

      <section className={styles.metrics} aria-label="Resumen general">
        {([
          ["apply", "Para inscribirme", "plazos abiertos"],
          ["upcoming", "Próximas", "por confirmar"],
          ["pools", "Bolsas vigentes", "no implica inscripción"],
          ["all", "Todas", "maestro completo"],
        ] as const).map(([metricView, label, helper]) => (
          <article key={metricView}>
            <a href="#explorer-title" onClick={() => selectView(metricView)}>
              <span>{label}</span>
              <strong>{loading ? "—" : viewMetrics[metricView]}</strong>
              <small>{helper}</small>
            </a>
          </article>
        ))}
      </section>

      <section className={styles.explorer} aria-labelledby="explorer-title">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionIndex}>01 / EXPLORAR</span>
            <h2 id="explorer-title">Encuentra una oportunidad</h2>
          </div>
          {!loading && !loadError && (
            <div className={styles.resultStatus}>
              <small>Datos actualizados el {DATASET_UPDATED_LABEL}</small>
              <p aria-live="polite"><strong>{filteredRecords.length}</strong> de {records.length} resultados</p>
            </div>
          )}
        </div>

        <nav className={styles.viewSelector} aria-label="Qué quieres consultar">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={view === option.value ? styles.viewButtonActive : undefined}
              aria-pressed={view === option.value}
              onClick={() => selectView(option.value)}
              disabled={loading || Boolean(loadError)}
            >
              <strong>{option.label}</strong>
              <span>{loading ? "—" : viewMetrics[option.value]}</span>
            </button>
          ))}
        </nav>
        <p className={styles.viewDescription}>
          {VIEW_OPTIONS.find((option) => option.value === view)?.description}
        </p>

        <details className={styles.stateHelp}>
          <summary>Cómo interpretar los estados</summary>
          <dl>
            <div><dt>Inscripción abierta</dt><dd>La fuente indica que se admiten solicitudes ahora.</dd></div>
            <div><dt>Plazo por confirmar</dt><dd>La convocatoria está detectada, pero falta confirmar la apertura o sus fechas.</dd></div>
            <div><dt>Acceso restringido</dt><dd>Exige una condición específica, indicada en el resultado; no equivale a acceso general.</dd></div>
            <div><dt>Histórico</dt><dd>El proceso terminó o se canceló y no mantiene una bolsa vigente.</dd></div>
          </dl>
        </details>

        <section className={styles.quickFilters} aria-labelledby="quick-filters-title">
          <div className={styles.quickFiltersHeading}>
            <div>
              <h3 id="quick-filters-title">Quitar lo que no me sirve</h3>
              <p>Los atajos se combinan entre sí; el número indica cuántos apartaría cada uno en esta vista.</p>
            </div>
            <button type="button" className={styles.showAllButton} onClick={showAllRecords}>Ver las {records.length} oportunidades</button>
          </div>
          <div className={styles.quickFilterButtons}>
            {QUICK_FILTER_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                aria-pressed={quickFilters[option.key]}
                className={quickFilters[option.key] ? styles.quickFilterActive : undefined}
                onClick={() => toggleQuickFilter(option.key)}
              >
                <span>{option.label}</span>
                <small>{quickFilterCounts[option.key]} {quickFilterCounts[option.key] === 1 ? "apartada" : "apartadas"}</small>
              </button>
            ))}
          </div>
        </section>

        {activeChips.length > 0 && (
          <div className={styles.activeChips} aria-label="Filtros activos">
            <span>Filtros activos:</span>
            {activeChips.map((chip) => (
              <button key={chip.id} type="button" onClick={chip.onRemove} aria-label={`Quitar filtro ${chip.label}`}>
                {chip.label} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}

        <details className={styles.filterPanel}>
          <summary aria-label="Mostrar u ocultar filtros">
            <span className={styles.filterPanelSummary}>
              <strong>Filtros de búsqueda</strong>
              <small>
                {activeFilterCategories === 0
                  ? "Sin filtros activos"
                  : `${activeFilterCategories} ${activeFilterCategories === 1 ? "categoría activa" : "categorías activas"} · ${activeFilterValues} ${activeFilterValues === 1 ? "valor" : "valores"}`}
              </small>
            </span>
            <span className={styles.filterPanelAction} aria-hidden="true">
              <span className={styles.closedLabel}>Mostrar filtros</span>
              <span className={styles.openLabel}>Ocultar filtros</span>
            </span>
          </summary>

          <form className={styles.filters} onSubmit={(event) => event.preventDefault()}>
            <label className={styles.searchField}>
              <span>Buscar</span>
              <input
                type="search"
                value={query}
                onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                placeholder="Puesto, organismo o municipio…"
              />
            </label>

            <MultiSelectFilter label="Proceso" options={PROCESS_OPTIONS} selected={processKinds} onChange={(values) => { setProcessKinds(values); setPage(1); }} disabled={loading} />
            <MultiSelectFilter label="Creación de bolsa" options={POOL_OPTIONS} selected={poolExistences} onChange={(values) => { setPoolExistences(values); setPage(1); }} disabled={loading} />
            <MultiSelectFilter label="Estado de bolsa" options={POOL_STATUS_OPTIONS} selected={poolStatuses} onChange={(values) => { setPoolStatuses(values); setPage(1); }} disabled={loading} />
            <MultiSelectFilter label="Estado" options={STATUS_OPTIONS} selected={statuses} onChange={(values) => { setStatuses(values); setPage(1); }} disabled={loading} />
            <MultiSelectFilter label="Acceso" options={ACCESS_OPTIONS} selected={accesses} onChange={(values) => { setAccesses(values); setPage(1); }} disabled={loading} />
            <MultiSelectFilter
              label="Fuente"
              options={sourceOptions.map((item) => ({ value: item, label: formatSourceLabel(item) }))}
              selected={sources}
              onChange={(values) => { setSources(values); setPage(1); }}
              disabled={loading}
            />
            <label><span>Orden</span><select value={sort} onChange={(event) => { setSort(event.target.value as OpportunitySortMode); setPage(1); }}><option value="useful">Más útiles</option><option value="recent">Más recientes</option><option value="oldest">Más antiguas</option><option value="vacancies">Más plazas</option><option value="title">Nombre A–Z</option></select>{sort === "useful" && <small className={styles.sortHelp}>Primero las abiertas de acceso general; entre ellas, las que cierran antes.</small>}</label>
            <button type="button" className={styles.clearButton} onClick={clearFilters}>Limpiar filtros</button>
          </form>
        </details>

        {loading && <div className={styles.stateMessage} role="status">Cargando oportunidades…</div>}
        {loadError && <div className={styles.errorMessage} role="alert">{loadError}</div>}
        {!loading && !loadError && invalidLines > 0 && <p className={styles.warning} role="status">{invalidLines} líneas inválidas se han omitido.</p>}

        {!loading && !loadError && (
          <>
            <div className={styles.tableWrap}>
              <table>
                <caption className={styles.srOnly}>Oportunidades de empleo público filtradas</caption>
                <thead>
                  <tr>
                    <th scope="col">Puesto</th>
                    <th scope="col">Organismo</th>
                    <th scope="col">Ubicación</th>
                    <th scope="col">Plazas</th>
                    <th scope="col">Bolsa</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Plazo</th>
                    <th scope="col">Convocatoria oficial</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords.map((record) => {
                    const primarySource = getPrimarySource(record);
                    const primaryUrl = primarySource?.url ?? primarySource?.document_url;
                    const isExpanded = expandedId === record.id;
                    const classification = getOpportunityClassification(record, today);
                    return (
                      <Fragment key={record.id}>
                        <tr>
                          <td>
                            <button
                              type="button"
                              className={styles.expandButton}
                              aria-expanded={isExpanded}
                              aria-controls={`desktop-detail-${record.id}`}
                              onClick={() => setExpandedId(isExpanded ? null : record.id)}
                            >
                              <span aria-hidden="true">{isExpanded ? "−" : "+"}</span>
                              <span>{record.title}</span>
                            </button>
                            {record.professional_category && <small>{record.professional_category}</small>}
                            {classification.conflicts.length > 0 && <span className={styles.dataConflictBadge}>Datos cruzados</span>}
                            <span className={`${styles.audienceBadge} ${classification.audience.scope === "RESTRICTED" || classification.audience.scope === "INTERNAL" ? styles.restrictedBadge : ""}`}>
                              {classification.audience.label}
                            </span>
                          </td>
                          <td>{record.organization}</td>
                          <td>{formatLocation(record)}</td>
                          <td className={styles.numericCell}>{formatVacancies(record)}</td>
                          <td>
                            {record.pool.status === "ACTIVE" && <span className={`${styles.statusPill} ${styles.poolYes}`}>Bolsa vigente</span>}
                            {record.pool.status === "PLANNED" && <span className={`${styles.statusPill} ${styles.poolPlanned}`}>Bolsa prevista</span>}
                            {record.pool.status !== "ACTIVE" && record.pool.status !== "PLANNED" && <span className={styles.statusPill}>{POOL_LABELS[record.pool.existence] ?? formatUnknownValue(record.pool.existence)}</span>}
                          </td>
                          <td>
                            <span className={styles.lifecycleLabel}>{classification.lifecycleLabel}</span>
                            <small>{formatProcessStatus(record)}</small>
                          </td>
                          <td>
                            <span className={`${styles.deadlineLabel} ${classification.deadline.state === "SOON" || classification.deadline.state === "TODAY" ? styles.deadlineUrgent : ""}`}>
                              {classification.deadline.label}
                            </span>
                            <small>Última actualización: {formatDate(getLatestPublicationDate(record))}</small>
                          </td>
                          <td>
                            {primarySource ? (
                              primaryUrl ? <a className={styles.officialCta} href={primaryUrl} target="_blank" rel="noopener noreferrer">Ver convocatoria oficial <span aria-hidden="true">↗</span><small>{formatSourceLabel(primarySource.source_id)}{record.sources.length > 1 ? ` · ${record.sources.length - 1} más` : ""}</small></a> : <span>Enlace oficial no disponible<small>{formatSourceLabel(primarySource.source_id)}</small></span>
                            ) : "Fuente oficial no disponible"}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className={styles.detailRow}>
                            <td colSpan={8} id={`desktop-detail-${record.id}`}>
                              <OpportunityDetails record={record} today={today} idPrefix="desktop" />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
              {visibleRecords.length === 0 && <EmptyResults onClear={clearFilters} />}
            </div>

            <div className={styles.mobileCards} aria-label="Oportunidades de empleo público filtradas">
              {visibleRecords.map((record) => {
                const primarySource = getPrimarySource(record);
                const primaryUrl = primarySource?.url ?? primarySource?.document_url;
                const isExpanded = expandedId === record.id;
                const classification = getOpportunityClassification(record, today);
                return (
                  <article className={styles.opportunityCard} key={record.id}>
                    <header>
                      <button
                        type="button"
                        className={styles.cardExpandButton}
                        aria-expanded={isExpanded}
                        aria-controls={`mobile-detail-${record.id}`}
                        onClick={() => setExpandedId(isExpanded ? null : record.id)}
                      >
                        <span>{record.title}</span>
                        <span aria-hidden="true">{isExpanded ? "−" : "+"}</span>
                      </button>
                      {record.professional_category && <small>{record.professional_category}</small>}
                      <p>{record.organization}</p>
                    </header>

                    <dl className={styles.cardDecisionGrid}>
                      <div><dt>Ubicación</dt><dd>{formatLocation(record)}</dd></div>
                      <div><dt>Acceso</dt><dd>{classification.audience.label}</dd></div>
                      <div><dt>Estado</dt><dd>{classification.lifecycleLabel}<small>{formatProcessStatus(record)}</small></dd></div>
                      <div><dt>Plazo</dt><dd className={classification.deadline.state === "SOON" || classification.deadline.state === "TODAY" ? styles.deadlineUrgent : undefined}>{classification.deadline.label}</dd></div>
                      <div><dt>Plazas</dt><dd>{formatVacancies(record)}</dd></div>
                    </dl>

                    <div className={styles.cardBadges}>
                      {record.application_status === "OPEN" && <span className={styles.openBadge}>Inscripción abierta</span>}
                      {record.pool.status === "ACTIVE" && <span className={styles.poolYes}>Bolsa vigente</span>}
                      {record.pool.status === "PLANNED" && <span className={styles.poolPlanned}>Bolsa prevista</span>}
                      {classification.conflicts.length > 0 && <span className={styles.dataConflictBadge}>Datos cruzados</span>}
                    </div>

                    <div className={styles.cardAction}>
                      {primarySource && primaryUrl ? (
                        <a className={styles.officialCta} href={primaryUrl} target="_blank" rel="noopener noreferrer">
                          Ver convocatoria oficial <span aria-hidden="true">↗</span>
                          <small>{formatSourceLabel(primarySource.source_id)} · actualizada {formatDate(getLatestPublicationDate(record))}</small>
                        </a>
                      ) : (
                        <span>Enlace oficial no disponible<small>{primarySource ? formatSourceLabel(primarySource.source_id) : "Fuente oficial no disponible"}</small></span>
                      )}
                    </div>

                    {isExpanded && (
                      <div id={`mobile-detail-${record.id}`}>
                        <OpportunityDetails record={record} today={today} idPrefix="mobile" />
                      </div>
                    )}
                  </article>
                );
              })}
              {visibleRecords.length === 0 && <EmptyResults onClear={clearFilters} />}
            </div>

            <div className={styles.pagination}>
              <label>Resultados por página <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option><option value={0}>Todos</option></select></label>
              <div>
                <button type="button" onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage <= 1}>Anterior</button>
                <span>Página {safePage} de {totalPages}</span>
                <button type="button" onClick={() => setPage(Math.min(totalPages, safePage + 1))} disabled={safePage >= totalPages}>Siguiente</button>
              </div>
            </div>

            <section className={styles.filteredSummary} aria-labelledby="filtered-summary-title">
              <div><span className={styles.sectionIndex}>02 / RESUMEN FILTRADO</span><h2 id="filtered-summary-title">Lo que muestran tus filtros</h2></div>
              <dl>
                <div><dt>Resultados</dt><dd>{filteredRecords.length}</dd></div>
                <div><dt>Plazas conocidas</dt><dd>{filteredMetrics.vacancies}</dd></div>
                <div><dt>Bolsas vigentes</dt><dd>{filteredMetrics.activePools}</dd></div>
                <div><dt>Bolsas previstas</dt><dd>{filteredMetrics.plannedPools}</dd></div>
                <div><dt>Abiertas</dt><dd>{filteredMetrics.open}</dd></div>
                <div><dt>Acceso general</dt><dd>{filteredMetrics.generalAccess}</dd></div>
                <div><dt>Con fecha límite conocida</dt><dd>{filteredMetrics.knownDeadline}</dd></div>
              </dl>
            </section>
          </>
        )}
      </section>

      <section className={styles.datasetFooter} aria-labelledby="dataset-title">
        <div>
          <span className={styles.sectionIndex}>03 / DATOS</span>
          <h2 id="dataset-title">Cobertura y descarga</h2>
          <p>Descarga el fichero maestro completo en formato JSON Lines.</p>
        </div>
        <div className={styles.coverage} aria-label="Cobertura del conjunto de datos">
          <span>Cobertura</span>
          <strong>21 abr — 8 sep 2026</strong>
          <small>BOE revisado hasta el 8 sep · BOP Sevilla hasta el boletín del 7 sep</small>
          <a href={DATASET_URL} download>
            Descargar JSONL <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
    </main>
  );
}
