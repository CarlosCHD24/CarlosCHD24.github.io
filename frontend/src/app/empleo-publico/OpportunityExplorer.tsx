"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ACCESS_LABELS,
  POOL_LABELS,
  PROCESS_KIND_LABELS,
  SELECTION_LABELS,
  formatDate,
  formatLocation,
  formatProcessStatus,
  formatSourceLabel,
  formatUnknownValue,
  formatVacancies,
  getLatestPublicationDate,
  getPrimarySource,
  getSearchableText,
  isFinishedOpportunity,
  matchesSelectedStatus,
  matchesSelectedValue,
  normalizeText,
  type Opportunity,
} from "./opportunityUtils";
import styles from "./page.module.css";

type SortMode = "recent" | "oldest" | "vacancies" | "complete" | "title";
type FilterOption = { value: string; label: string };

const DATASET_URL = "/data/convocatorias.jsonl";
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
  { value: "FREE", label: "Libre" },
  { value: "INTERNAL_PROMOTION", label: "Promoción interna" },
  { value: "MIXED", label: "Mixto" },
  { value: "OTHER", label: "Otro" },
  { value: "UNKNOWN", label: "Desconocido" },
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

function OpportunityDetails({ record }: { record: Opportunity }) {
  return (
    <div className={styles.details}>
      <div className={styles.detailGrid}>
        <DetailValue label="Tipo de proceso" value={PROCESS_KIND_LABELS[record.process_kind] ?? record.process_kind} />
        <DetailValue label="Sistema selectivo" value={SELECTION_LABELS[record.selection_system] ?? formatUnknownValue(record.selection_system)} />
        <DetailValue label="Acceso" value={ACCESS_LABELS[record.access_channel] ?? formatUnknownValue(record.access_channel)} />
        <DetailValue label="Personal" value={formatUnknownValue(record.personnel_type)} />
        <DetailValue label="Titulación" value={record.qualification_text ?? formatUnknownValue(record.qualification_level)} />
        <DetailValue label="Modo de solicitud" value={formatUnknownValue(record.application_mode)} />
        <DetailValue label="Plazas iniciales" value={record.vacancies_initial} />
        <DetailValue label="Plazas actuales" value={record.vacancies_current} />
        <DetailValue label="Bolsa" value={POOL_LABELS[record.pool.existence] ?? record.pool.existence} />
        <DetailValue label="Estado de la bolsa" value={formatUnknownValue(record.pool.status)} />
        <DetailValue label="Completitud" value={`${record.analysis.completeness_pct}%`} />
        <DetailValue label="Confianza" value={record.analysis.confidence == null ? "—" : `${Math.round(record.analysis.confidence * 100)}%`} />
      </div>

      {record.locations.length > 0 && (
        <section className={styles.detailSection} aria-labelledby={`locations-${record.id}`}>
          <h3 id={`locations-${record.id}`}>Ubicaciones</h3>
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
        <section className={styles.detailSection} aria-labelledby={`requirements-${record.id}`}>
          <h3 id={`requirements-${record.id}`}>Titulación y requisitos</h3>
          <ul>
            {record.accepted_qualifications.map((item, index) => (
              <li key={`${record.id}-qualification-${index}`}>{item}</li>
            ))}
            {record.additional_requirements.map((item, index) => (
              <li key={`${record.id}-requirement-${index}`}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.detailSection} aria-labelledby={`sources-${record.id}`}>
        <h3 id={`sources-${record.id}`}>Fuentes oficiales</h3>
        <ul className={styles.sourceList}>
          {record.sources.map((source, index) => {
            const href = source.url ?? source.document_url;
            return (
              <li key={`${record.id}-source-${index}`}>
                <div>
                  <strong>{formatSourceLabel(source.source_id)}</strong>
                  <span>
                    {formatDate(source.publication_date)}
                    {source.event_types.length ? ` · ${source.event_types.join(", ")}` : ""}
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
        <section className={styles.detailSection} aria-labelledby={`notes-${record.id}`}>
          <h3 id={`notes-${record.id}`}>Notas</h3>
          <p>{record.notes}</p>
        </section>
      )}
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
  const [pools, setPools] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [accesses, setAccesses] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [hideFinished, setHideFinished] = useState(false);
  const [sort, setSort] = useState<SortMode>("recent");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const filteredRecords = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    const result = records.filter((record) => {
      if (normalizedQuery && !getSearchableText(record).includes(normalizedQuery)) return false;
      if (!matchesSelectedValue(record.process_kind, processKinds)) return false;
      if (!matchesSelectedValue(record.pool.existence, pools)) return false;
      if (!matchesSelectedValue(record.access_channel, accesses)) return false;
      if (sources.length > 0 && !record.sources.some((item) => sources.includes(item.source_id))) return false;
      if (hideFinished && isFinishedOpportunity(record)) return false;
      if (!matchesSelectedStatus(record, statuses)) return false;
      return true;
    });

    return result.sort((a, b) => {
      if (sort === "oldest") return (getLatestPublicationDate(a) ?? "").localeCompare(getLatestPublicationDate(b) ?? "");
      if (sort === "vacancies") return (b.vacancies_current ?? -1) - (a.vacancies_current ?? -1);
      if (sort === "complete") return b.analysis.completeness_pct - a.analysis.completeness_pct;
      if (sort === "title") return a.title.localeCompare(b.title, "es");
      return (getLatestPublicationDate(b) ?? "").localeCompare(getLatestPublicationDate(a) ?? "");
    });
  }, [accesses, hideFinished, pools, processKinds, query, records, sort, sources, statuses]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRecords = filteredRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

  const globalMetrics = useMemo(
    () => ({
      total: records.length,
      pools: records.filter((record) => record.pool.existence === "YES").length,
      open: records.filter((record) => record.application_status === "OPEN").length,
      review: records.filter((record) => record.analysis.status === "NEEDS_REVIEW").length,
      finished: records.filter(isFinishedOpportunity).length,
    }),
    [records],
  );

  const filteredMetrics = useMemo(() => {
    const vacancies = filteredRecords.reduce(
      (total, record) => total + (record.vacancies_current ?? 0),
      0,
    );
    const completeness = filteredRecords.length
      ? Math.round(
          filteredRecords.reduce((total, record) => total + record.analysis.completeness_pct, 0) /
            filteredRecords.length,
        )
      : 0;
    return {
      vacancies,
      pools: filteredRecords.filter((record) => record.pool.existence === "YES").length,
      possiblePools: filteredRecords.filter((record) => record.pool.existence === "CONDITIONAL").length,
      open: filteredRecords.filter((record) => record.application_status === "OPEN").length,
      review: filteredRecords.filter((record) => record.analysis.status === "NEEDS_REVIEW").length,
      completeness,
    };
  }, [filteredRecords]);

  function clearFilters() {
    setQuery("");
    setProcessKinds([]);
    setPools([]);
    setStatuses([]);
    setAccesses([]);
    setSources([]);
    setHideFinished(false);
    setSort("recent");
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
        <div className={styles.coverage} aria-label="Cobertura del conjunto de datos">
          <span>Cobertura</span>
          <strong>21 abr — 18 ago 2026</strong>
          <a href={DATASET_URL} download>
            Descargar JSONL <span aria-hidden="true">↓</span>
          </a>
        </div>
      </header>

      <section className={styles.metrics} aria-label="Resumen general">
        <article><span>Total</span><strong>{loading ? "—" : globalMetrics.total}</strong><small>oportunidades</small></article>
        <article><span>Con bolsa</span><strong>{loading ? "—" : globalMetrics.pools}</strong><small>confirmadas</small></article>
        <article><span>Abiertas</span><strong>{loading ? "—" : globalMetrics.open}</strong><small>solicitudes</small></article>
        <article className={styles.reviewMetric}><span>Revisión</span><strong>{loading ? "—" : globalMetrics.review}</strong><small>por comprobar</small></article>
      </section>

      <section className={styles.explorer} aria-labelledby="explorer-title">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionIndex}>01 / EXPLORAR</span>
            <h2 id="explorer-title">Encuentra una oportunidad</h2>
          </div>
          {!loading && !loadError && (
            <p aria-live="polite">
              <strong>{filteredRecords.length}</strong> de {records.length} resultados
            </p>
          )}
        </div>

        <form className={styles.filters} onSubmit={(event) => event.preventDefault()}>
          <label className={styles.searchField}>
            <span>Buscar</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Puesto, organismo o municipio…"
            />
          </label>

          <MultiSelectFilter label="Proceso" options={PROCESS_OPTIONS} selected={processKinds} onChange={setProcessKinds} disabled={loading} />
          <MultiSelectFilter label="Bolsa" options={POOL_OPTIONS} selected={pools} onChange={setPools} disabled={loading} />
          <MultiSelectFilter label="Estado" options={STATUS_OPTIONS} selected={statuses} onChange={setStatuses} disabled={loading} />
          <MultiSelectFilter label="Acceso" options={ACCESS_OPTIONS} selected={accesses} onChange={setAccesses} disabled={loading} />
          <MultiSelectFilter
            label="Fuente"
            options={sourceOptions.map((item) => ({ value: item, label: formatSourceLabel(item) }))}
            selected={sources}
            onChange={setSources}
            disabled={loading}
          />
          <label><span>Orden</span><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="recent">Más recientes</option><option value="oldest">Más antiguas</option><option value="vacancies">Más plazas</option><option value="complete">Mayor completitud</option><option value="title">Nombre A–Z</option></select></label>
          <button
            type="button"
            className={`${styles.finishedToggle} ${hideFinished ? styles.finishedToggleActive : ""}`}
            aria-pressed={hideFinished}
            disabled={loading || Boolean(loadError)}
            onClick={() => setHideFinished((current) => !current)}
          >
            <span aria-hidden="true">{hideFinished ? "✓" : "−"}</span>
            {loading
              ? "Ocultar finalizadas"
              : hideFinished
              ? `${globalMetrics.finished} finalizadas ocultas`
              : `Ocultar ${globalMetrics.finished} finalizadas`}
          </button>
          <button type="button" className={styles.clearButton} onClick={clearFilters}>Limpiar filtros</button>
        </form>

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
                    <th scope="col">Fecha</th>
                    <th scope="col">Fuente</th>
                    <th scope="col">Calidad</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords.map((record) => {
                    const primarySource = getPrimarySource(record);
                    const primaryUrl = primarySource?.url ?? primarySource?.document_url;
                    const isExpanded = expandedId === record.id;
                    return (
                      <Fragment key={record.id}>
                        <tr className={record.analysis.status === "NEEDS_REVIEW" ? styles.reviewRow : undefined}>
                          <td>
                            <button
                              type="button"
                              className={styles.expandButton}
                              aria-expanded={isExpanded}
                              aria-controls={`detail-${record.id}`}
                              onClick={() => setExpandedId(isExpanded ? null : record.id)}
                            >
                              <span aria-hidden="true">{isExpanded ? "−" : "+"}</span>
                              <span>{record.title}</span>
                            </button>
                            {record.professional_category && <small>{record.professional_category}</small>}
                            {record.analysis.status === "NEEDS_REVIEW" && <span className={styles.reviewBadge}>Revisar</span>}
                          </td>
                          <td>{record.organization}</td>
                          <td>{formatLocation(record)}</td>
                          <td className={styles.numericCell}>{formatVacancies(record)}</td>
                          <td><span className={`${styles.statusPill} ${record.pool.existence === "YES" ? styles.poolYes : ""}`}>{POOL_LABELS[record.pool.existence] ?? record.pool.existence}</span></td>
                          <td>{formatProcessStatus(record)}</td>
                          <td>{formatDate(getLatestPublicationDate(record))}</td>
                          <td>
                            {primarySource ? (
                              primaryUrl ? <a href={primaryUrl} target="_blank" rel="noopener noreferrer">{formatSourceLabel(primarySource.source_id)}{record.sources.length > 1 ? ` +${record.sources.length - 1}` : ""}</a> : <span>{formatSourceLabel(primarySource.source_id)}</span>
                            ) : "—"}
                          </td>
                          <td><span className={styles.completeness}>{record.analysis.completeness_pct}%</span></td>
                        </tr>
                        {isExpanded && (
                          <tr className={styles.detailRow}>
                            <td colSpan={9} id={`detail-${record.id}`}>
                              <OpportunityDetails record={record} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
              {visibleRecords.length === 0 && <div className={styles.emptyState}>No hay oportunidades que coincidan con estos filtros.</div>}
            </div>

            <div className={styles.pagination}>
              <label>Filas por página <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option><option value={236}>Todas</option></select></label>
              <div>
                <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage <= 1}>Anterior</button>
                <span>Página {safePage} de {totalPages}</span>
                <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={safePage >= totalPages}>Siguiente</button>
              </div>
            </div>

            <section className={styles.filteredSummary} aria-labelledby="filtered-summary-title">
              <div><span className={styles.sectionIndex}>02 / RESUMEN FILTRADO</span><h2 id="filtered-summary-title">Lo que muestran tus filtros</h2></div>
              <dl>
                <div><dt>Resultados</dt><dd>{filteredRecords.length}</dd></div>
                <div><dt>Plazas conocidas</dt><dd>{filteredMetrics.vacancies}</dd></div>
                <div><dt>Con bolsa</dt><dd>{filteredMetrics.pools}</dd></div>
                <div><dt>Bolsa posible</dt><dd>{filteredMetrics.possiblePools}</dd></div>
                <div><dt>Abiertas</dt><dd>{filteredMetrics.open}</dd></div>
                <div><dt>Para revisar</dt><dd>{filteredMetrics.review}</dd></div>
                <div><dt>Completitud media</dt><dd>{filteredMetrics.completeness}%</dd></div>
              </dl>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
