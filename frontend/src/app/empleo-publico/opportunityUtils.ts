export interface OpportunityLocation {
  province: string | null;
  municipality: string | null;
  site: string | null;
  unit: string | null;
}

export interface OpportunitySource {
  source_id: string;
  source_role: string;
  external_id?: string | null;
  publication_date: string | null;
  event_types: string[];
  url: string | null;
  document_url: string | null;
  reference: string | null;
}

export interface OpportunityRequirement {
  type: string;
  mandatory: boolean;
  text: string;
}

export interface VacancyBreakdown {
  access_channel: string;
  quota: string;
  vacancies: number | null;
}

export interface Opportunity {
  schema_version: number;
  id: string;
  title: string;
  organization: string;
  professional_category: string | null;
  professional_profile: string | null;
  specialty: string | null;
  position_code: string | null;
  personnel_type: string | null;
  process_kind: string;
  process_scheme: string | null;
  provision_method?: string | null;
  access_channel: string;
  selection_system: string;
  process_stage: string;
  locations: OpportunityLocation[];
  vacancies_initial: number | null;
  vacancies_current: number | null;
  vacancy_breakdown?: VacancyBreakdown[];
  application_mode: string | null;
  application_status: string;
  application_periods: Array<{
    start_date?: string | null;
    end_date?: string | null;
  }>;
  qualification_level: string | null;
  qualification_text: string | null;
  accepted_qualifications: string[];
  additional_requirements: Array<string | OpportunityRequirement>;
  pool: {
    existence: string;
    name: string | null;
    status: string | null;
    personnel_type: string | null;
    details: string | null;
    destinations: OpportunityLocation[];
  };
  merit_phase: string | null;
  merit_details: string | null;
  exams: Array<Record<string, unknown>>;
  sources: OpportunitySource[];
  analysis: {
    status: string;
    is_complete: boolean;
    completeness_pct: number;
    confidence: number | null;
  };
  notes: string | null;
}

export type OpportunityView = "apply" | "upcoming" | "pools" | "tracking" | "all";
export type OpportunitySortMode = "useful" | "recent" | "oldest" | "vacancies" | "title";
export type OpportunityLifecycle =
  | "OPEN_FOR_APPLICATION"
  | "UPCOMING_OR_UNCONFIRMED"
  | "ACTIVE_POOL"
  | "IN_PROGRESS_FOR_APPLICANTS"
  | "HISTORICAL"
  | "DATA_CONFLICT";
export type AudienceScope = "GENERAL" | "INTERNAL" | "MIXED" | "RESTRICTED" | "UNKNOWN";
export type RestrictionTag =
  | "INTERNAL_PROMOTION"
  | "PROVISION"
  | "SERVICE_COMMISSION"
  | "TRANSFER"
  | "OTHER_PROVISION"
  | "DISABILITY_QUOTA"
  | "INTELLECTUAL_DISABILITY_QUOTA"
  | "EXISTING_POOL_MEMBERSHIP"
  | "OTHER_ACCESS";

export interface AudienceProfile {
  scope: AudienceScope;
  label: string;
  restrictionTags: RestrictionTag[];
}

export interface DeadlineInfo {
  endDate: string | null;
  label: string;
  state: "OPEN" | "SOON" | "TODAY" | "CLOSED" | "UNKNOWN" | "NOT_APPLICABLE";
}

export interface OpportunityClassification {
  lifecycle: OpportunityLifecycle;
  lifecycleLabel: string;
  audience: AudienceProfile;
  deadline: DeadlineInfo;
  conflicts: string[];
}

export interface QuickFilters {
  generalOnly: boolean;
  openOnly: boolean;
  excludeInternal: boolean;
  excludeProvision: boolean;
  hideHistorical: boolean;
}

export interface OpportunityUrlState {
  view: OpportunityView;
  query: string;
  processKinds: string[];
  poolExistences: string[];
  poolStatuses: string[];
  statuses: string[];
  accesses: string[];
  sources: string[];
  quickFilters: QuickFilters;
  sort: OpportunitySortMode;
  pageSize: number;
  page: number;
}

export const SOURCE_LABELS: Record<string, string> = {
  BOE: "BOE",
  BOJA: "BOJA",
  BOP_SEVILLA: "BOP Sevilla",
  PAG_EMPLEO_PUBLICO: "Punto de Acceso General",
  JUNTA_EMPLEO_PUBLICO: "Junta · Empleo Público",
  JUNTA_EDUCACION_RRHH: "Junta · Educación",
  SAS_EMPLEO: "SAS",
  AYTO_SEVILLA_RRHH: "Ayuntamiento de Sevilla",
  AYTO_SEVILLA_BOLSAS: "Ayuntamiento de Sevilla · Bolsas",
  DIPUTACION_SEVILLA_RRHH: "Diputación de Sevilla",
  DIPUTACION_SEVILLA_BOLSAS: "Diputación · Bolsas",
  UNIVERSIDAD_SEVILLA_PTGAS: "Universidad de Sevilla",
  UNIVERSIDAD_SEVILLA_BOLSAS: "Universidad de Sevilla · Bolsas",
  UPO_PTGAS: "UPO",
  UPO_BOLSAS: "UPO · Bolsas",
  PUERTO_SEVILLA_EMPLEO: "Puerto de Sevilla",
};

const SOURCE_ROLE_PRIORITY: Record<string, number> = {
  LEGAL_PUBLICATION: 3,
  ORGANIZATION_PORTAL: 2,
  OFFICIAL_AGGREGATOR: 1,
  OTHER: 0,
  UNKNOWN: 0,
};

export const PROCESS_KIND_LABELS: Record<string, string> = {
  POSITION_SELECTION: "Plazas",
  POOL_SELECTION: "Bolsa",
  POSITION_PROVISION: "Provisión",
};

export const ACCESS_LABELS: Record<string, string> = {
  FREE: "Libre",
  INTERNAL_PROMOTION: "Promoción interna",
  MIXED: "Mixto",
  OTHER: "Otro",
  UNKNOWN: "Desconocido",
};

export const SELECTION_LABELS: Record<string, string> = {
  OPOSICION: "Oposición",
  CONCURSO: "Concurso",
  CONCURSO_OPOSICION: "Concurso-oposición",
  OTHER: "Otro",
  UNKNOWN: "Desconocido",
};

export const PERSONNEL_TYPE_LABELS: Record<string, string> = {
  CAREER_CIVIL_SERVANT: "Personal funcionario de carrera",
  INTERIM_CIVIL_SERVANT: "Personal funcionario interino",
  LABOR_FIXED: "Personal laboral fijo",
  LABOR_TEMPORARY: "Personal laboral temporal",
  STATUTORY_FIXED: "Personal estatutario fijo",
  UNKNOWN: "Tipo de personal por verificar",
};

export const QUALIFICATION_LEVEL_LABELS: Record<string, string> = {
  PRIMARY: "Estudios primarios o equivalente",
  BACHILLER_OR_EQUIVALENT: "Bachillerato o equivalente",
  SPECIFIC_UNIVERSITY_DEGREE: "Titulación universitaria específica",
  UNKNOWN: "Titulación por verificar",
};

export const APPLICATION_MODE_LABELS: Record<string, string> = {
  FIXED_WINDOW: "Plazo con fechas determinadas",
  CONTINUOUS: "Presentación continua",
  UNKNOWN: "Modo de solicitud por verificar",
};

export const SOURCE_EVENT_LABELS: Record<string, string> = {
  ADMITTED_FINAL: "Lista definitiva de personas admitidas",
  ADMITTED_PROVISIONAL: "Lista provisional de personas admitidas",
  APPLICATION_OPENING: "Apertura de solicitudes",
  APPOINTMENT: "Nombramiento",
  BASES: "Bases",
  CALL: "Convocatoria",
  CANCELLATION: "Cancelación",
  CORRECTION: "Corrección",
  DESTINATION_FINAL: "Adjudicación definitiva de destino",
  EXAM_ANNOUNCEMENT: "Convocatoria de examen",
  EXAM_RESULT: "Resultado de examen",
  FINAL_RESULT: "Resultado final",
  MERIT_FINAL: "Valoración definitiva de méritos",
  MERIT_PHASE: "Fase de méritos",
  MERIT_PROVISIONAL: "Valoración provisional de méritos",
  OTHER: "Otra publicación",
  POOL_CREATION: "Creación de bolsa",
  POOL_EXTENSION: "Ampliación de bolsa",
  POOL_FINAL: "Bolsa definitiva",
  POOL_PROVISIONAL: "Bolsa provisional",
  POOL_UPDATE: "Actualización de bolsa",
};

export const RESTRICTION_LABELS: Record<RestrictionTag, string> = {
  INTERNAL_PROMOTION: "promoción interna",
  PROVISION: "provisión de puestos",
  SERVICE_COMMISSION: "comisión de servicios",
  TRANSFER: "traslado",
  OTHER_PROVISION: "otro sistema de provisión",
  DISABILITY_QUOTA: "cupo de discapacidad",
  INTELLECTUAL_DISABILITY_QUOTA: "cupo de discapacidad intelectual",
  EXISTING_POOL_MEMBERSHIP: "pertenencia a otra bolsa",
  OTHER_ACCESS: "acceso restringido",
};

export const POOL_LABELS: Record<string, string> = {
  YES: "Sí",
  CONDITIONAL: "Posible",
  NO: "No",
  NOT_STATED: "No indicada",
  UNKNOWN: "Desconocido",
};

export const POOL_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Bolsa vigente",
  PLANNED: "Bolsa prevista",
  INACTIVE: "Bolsa no vigente",
  EXHAUSTED: "Bolsa agotada",
  CANCELLED: "Bolsa cancelada",
  UNKNOWN: "Estado por verificar",
};

export const VIEW_OPTIONS: Array<{
  value: OpportunityView;
  label: string;
  description: string;
}> = [
  {
    value: "apply",
    label: "Para inscribirme",
    description: "Plazos abiertos; se apartan promoción interna y provisión. Los cupos o requisitos específicos se señalan en cada resultado.",
  },
  {
    value: "upcoming",
    label: "Próximas",
    description: "Convocatorias detectadas o con plazo todavía por confirmar, sin promoción interna ni provisión.",
  },
  {
    value: "pools",
    label: "Bolsas vigentes",
    description: "Bolsas activas, aunque su proceso de selección haya terminado.",
  },
  {
    value: "tracking",
    label: "Participación iniciada",
    description: "Admitidos, examen, méritos y nombramientos.",
  },
  {
    value: "all",
    label: "Todas",
    description: "El maestro completo, incluido histórico y acceso restringido.",
  },
];

const LIFECYCLE_LABELS: Record<OpportunityLifecycle, string> = {
  OPEN_FOR_APPLICATION: "Inscripción abierta",
  UPCOMING_OR_UNCONFIRMED: "Plazo por confirmar",
  ACTIVE_POOL: "Bolsa vigente",
  IN_PROGRESS_FOR_APPLICANTS: "Proceso en curso",
  HISTORICAL: "Histórico",
  DATA_CONFLICT: "Datos por revisar",
};

const CURATED_RESTRICTIONS: Record<string, RestrictionTag[]> = {
  "4af5396d-7b97-4525-9623-c4ec7c868f9f": ["EXISTING_POOL_MEMBERSHIP"],
};

export function normalizeText(value: unknown = "") {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatUnknownValue(value: string | null | undefined) {
  if (value == null || value === "") return "—";
  if (value === "UNKNOWN") return "Desconocido";
  if (value === "NOT_STATED") return "No indicado en las bases";
  if (/^[A-Z][A-Z0-9_]+$/.test(value)) return "Dato por verificar";
  return value;
}

export function formatSourceEvent(value: string) {
  return SOURCE_EVENT_LABELS[value] ?? "Otra publicación oficial";
}

export function formatRequirement(requirement: string | OpportunityRequirement) {
  return typeof requirement === "string" ? requirement : requirement.text;
}

export function formatLocation(record: Opportunity) {
  const locations = record.locations ?? [];
  if (!locations.length) return "No indicada";

  const first = locations[0];
  let label = first.municipality || first.province || "No indicada";
  if (first.site) label += ` · ${first.site}`;
  if (locations.length > 1) label += ` +${locations.length - 1}`;
  return label;
}

export function formatVacancies(record: Opportunity) {
  if (record.vacancies_current != null) return String(record.vacancies_current);
  return record.process_kind === "POOL_SELECTION" ? "No aplicable (bolsa)" : "No indicadas";
}

export function getLatestPublicationDate(record: Opportunity) {
  const dates = (record.sources ?? [])
    .map((source) => source.publication_date)
    .filter((date): date is string => Boolean(date))
    .sort();
  return dates.at(-1) ?? null;
}

export function formatDate(date: string | null | undefined) {
  if (!date) return "—";
  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : date;
}

export function getTodayDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getApplicationDeadline(record: Opportunity) {
  return (record.application_periods ?? [])
    .map((period) => period.end_date ?? null)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1) ?? null;
}

function differenceInCalendarDays(laterDate: string, earlierDate: string) {
  const later = Date.parse(`${laterDate}T00:00:00Z`);
  const earlier = Date.parse(`${earlierDate}T00:00:00Z`);
  return Math.round((later - earlier) / 86_400_000);
}

export function getDeadlineInfo(
  record: Opportunity,
  today = getTodayDateString(),
): DeadlineInfo {
  const endDate = getApplicationDeadline(record);

  if (record.application_status === "OPEN") {
    if (!endDate) {
      return { endDate: null, label: "Abierta · fecha fin no disponible", state: "UNKNOWN" };
    }
    const days = differenceInCalendarDays(endDate, today);
    if (days < 0) return { endDate, label: `Fin indicado: ${formatDate(endDate)}`, state: "CLOSED" };
    if (days === 0) return { endDate, label: "Cierra hoy", state: "TODAY" };
    if (days <= 3) return { endDate, label: `Cierra pronto · ${formatDate(endDate)}`, state: "SOON" };
    return { endDate, label: `Abierta hasta ${formatDate(endDate)}`, state: "OPEN" };
  }

  if (endDate) {
    return {
      endDate,
      label: endDate < today ? `Cerrada el ${formatDate(endDate)}` : `Plazo hasta ${formatDate(endDate)}`,
      state: endDate < today ? "CLOSED" : "UNKNOWN",
    };
  }

  return { endDate: null, label: "Sin plazo abierto", state: "NOT_APPLICABLE" };
}

export function getAudienceProfile(record: Opportunity): AudienceProfile {
  const restrictionTags = [...(CURATED_RESTRICTIONS[record.id] ?? [])];
  const quotas = (record.vacancy_breakdown ?? []).map((item) => item.quota);
  const hasGeneralQuota = quotas.includes("GENERAL");

  if (quotas.includes("INTELLECTUAL_DISABILITY")) {
    restrictionTags.push("INTELLECTUAL_DISABILITY_QUOTA");
  } else if (quotas.includes("DISABILITY")) {
    restrictionTags.push("DISABILITY_QUOTA");
  }

  if (record.access_channel === "INTERNAL_PROMOTION") {
    restrictionTags.push("INTERNAL_PROMOTION");
  }

  if (record.process_kind === "POSITION_PROVISION") {
    restrictionTags.push("PROVISION");
    if (record.provision_method === "SERVICE_COMMISSION") restrictionTags.push("SERVICE_COMMISSION");
    else if (record.provision_method === "TRANSFER") restrictionTags.push("TRANSFER");
    else restrictionTags.push("OTHER_PROVISION");
  }

  if (record.access_channel === "OTHER" && record.process_kind !== "POSITION_PROVISION") {
    restrictionTags.push("OTHER_ACCESS");
  }

  const uniqueTags = [...new Set(restrictionTags)];
  if (record.access_channel === "INTERNAL_PROMOTION") {
    return { scope: "INTERNAL", label: "Promoción interna", restrictionTags: uniqueTags };
  }
  if (record.access_channel === "MIXED") {
    return { scope: "MIXED", label: "Acceso mixto", restrictionTags: uniqueTags };
  }
  if (
    record.process_kind === "POSITION_PROVISION" ||
    record.access_channel === "OTHER" ||
    uniqueTags.includes("EXISTING_POOL_MEMBERSHIP") ||
    (uniqueTags.some((tag) => tag.includes("DISABILITY")) && !hasGeneralQuota)
  ) {
    const label = uniqueTags.includes("EXISTING_POOL_MEMBERSHIP")
      ? "Solo integrantes de otra bolsa"
      : uniqueTags.includes("INTELLECTUAL_DISABILITY_QUOTA")
        ? "Cupo discapacidad intelectual"
        : uniqueTags.includes("DISABILITY_QUOTA")
          ? "Cupo de discapacidad"
          : record.process_kind === "POSITION_PROVISION"
            ? "Provisión restringida"
            : "Acceso restringido";
    return { scope: "RESTRICTED", label, restrictionTags: uniqueTags };
  }
  if (record.access_channel === "FREE") {
    return {
      scope: "GENERAL",
      label: uniqueTags.some((tag) => tag.includes("DISABILITY"))
        ? "Acceso libre · incluye cupo reservado"
        : "Acceso libre",
      restrictionTags: uniqueTags,
    };
  }
  return { scope: "UNKNOWN", label: "Acceso por verificar", restrictionTags: uniqueTags };
}

export function getOpportunityClassification(
  record: Opportunity,
  today = getTodayDateString(),
): OpportunityClassification {
  const deadline = getDeadlineInfo(record, today);
  const conflicts: string[] = [];
  if (record.process_stage === "COMPLETED" && record.application_status === "OPEN") {
    conflicts.push("La fase figura como completada, pero el plazo está abierto.");
  }
  if (record.application_status === "OPEN" && deadline.state === "CLOSED") {
    conflicts.push("El estado figura abierto, pero la fecha final indicada ya ha pasado.");
  }

  let lifecycle: OpportunityLifecycle;
  if (record.application_status === "OPEN" && deadline.state !== "CLOSED") {
    lifecycle = "OPEN_FOR_APPLICATION";
  } else if (conflicts.length > 0) {
    lifecycle = "DATA_CONFLICT";
  } else if (record.pool.status === "ACTIVE") {
    lifecycle = "ACTIVE_POOL";
  } else if (record.process_stage === "COMPLETED" || record.process_stage === "CANCELLED") {
    lifecycle = "HISTORICAL";
  } else if (
    record.process_stage === "DETECTED" ||
    (record.process_stage === "APPLICATION" && record.application_status === "UNKNOWN")
  ) {
    lifecycle = "UPCOMING_OR_UNCONFIRMED";
  } else {
    lifecycle = "IN_PROGRESS_FOR_APPLICANTS";
  }

  return {
    lifecycle,
    lifecycleLabel: LIFECYCLE_LABELS[lifecycle],
    audience: getAudienceProfile(record),
    deadline,
    conflicts,
  };
}

export function matchesOpportunityView(
  record: Opportunity,
  view: OpportunityView,
  today = getTodayDateString(),
) {
  if (view === "all") return true;
  const classification = getOpportunityClassification(record, today);
  if (view === "pools") return record.pool.status === "ACTIVE";
  if (view === "tracking") return classification.lifecycle === "IN_PROGRESS_FOR_APPLICANTS";

  const isBroadlyAvailable =
    classification.audience.scope !== "INTERNAL" && record.process_kind !== "POSITION_PROVISION";
  if (view === "apply") {
    return classification.lifecycle === "OPEN_FOR_APPLICATION" && isBroadlyAvailable;
  }
  return classification.lifecycle === "UPCOMING_OR_UNCONFIRMED" && isBroadlyAvailable;
}

/**
 * Los atajos se combinan con AND. Dentro de cada filtro avanzado, los valores
 * seleccionados se combinan con OR. Una bolsa activa nunca se considera
 * histórica aunque el proceso que la originó figure como completado.
 */
export function matchesQuickFilters(
  record: Opportunity,
  filters: QuickFilters,
  today = getTodayDateString(),
) {
  const classification = getOpportunityClassification(record, today);
  if (filters.generalOnly && classification.audience.scope !== "GENERAL") return false;
  if (filters.openOnly && classification.lifecycle !== "OPEN_FOR_APPLICATION") return false;
  if (filters.excludeInternal && classification.audience.scope === "INTERNAL") return false;
  if (filters.excludeProvision && record.process_kind === "POSITION_PROVISION") return false;
  if (
    filters.hideHistorical &&
    classification.lifecycle === "HISTORICAL" &&
    record.pool.status !== "ACTIVE"
  ) return false;
  return true;
}

function compareLatestUpdate(a: Opportunity, b: Opportunity) {
  return (getLatestPublicationDate(b) ?? "").localeCompare(getLatestPublicationDate(a) ?? "");
}

/** Orden total y determinista. "Más útiles" prioriza acción, acceso general y urgencia. */
export function compareOpportunities(
  a: Opportunity,
  b: Opportunity,
  mode: OpportunitySortMode,
  today = getTodayDateString(),
) {
  if (mode === "oldest") {
    const result = (getLatestPublicationDate(a) ?? "").localeCompare(getLatestPublicationDate(b) ?? "");
    if (result !== 0) return result;
  } else if (mode === "vacancies") {
    const result = (b.vacancies_current ?? -1) - (a.vacancies_current ?? -1);
    if (result !== 0) return result;
  } else if (mode === "title") {
    const result = a.title.localeCompare(b.title, "es");
    if (result !== 0) return result;
  } else if (mode === "recent") {
    const result = compareLatestUpdate(a, b);
    if (result !== 0) return result;
  } else {
    const lifecyclePriority: Record<OpportunityLifecycle, number> = {
      OPEN_FOR_APPLICATION: 0,
      UPCOMING_OR_UNCONFIRMED: 1,
      ACTIVE_POOL: 2,
      IN_PROGRESS_FOR_APPLICANTS: 3,
      DATA_CONFLICT: 4,
      HISTORICAL: 5,
    };
    const audiencePriority: Record<AudienceScope, number> = {
      GENERAL: 0,
      MIXED: 1,
      UNKNOWN: 2,
      RESTRICTED: 3,
      INTERNAL: 4,
    };
    const aClassification = getOpportunityClassification(a, today);
    const bClassification = getOpportunityClassification(b, today);
    const lifecycle = lifecyclePriority[aClassification.lifecycle] - lifecyclePriority[bClassification.lifecycle];
    if (lifecycle !== 0) return lifecycle;
    const audience = audiencePriority[aClassification.audience.scope] - audiencePriority[bClassification.audience.scope];
    if (audience !== 0) return audience;

    if (aClassification.lifecycle === "OPEN_FOR_APPLICATION") {
      const aDeadline = aClassification.deadline.endDate;
      const bDeadline = bClassification.deadline.endDate;
      if (aDeadline && bDeadline && aDeadline !== bDeadline) return aDeadline.localeCompare(bDeadline);
      if (aDeadline && !bDeadline) return -1;
      if (!aDeadline && bDeadline) return 1;
    }

    const update = compareLatestUpdate(a, b);
    if (update !== 0) return update;
  }

  const title = a.title.localeCompare(b.title, "es");
  return title !== 0 ? title : a.id.localeCompare(b.id);
}

export function getPrimarySource(record: Opportunity) {
  return [...(record.sources ?? [])].sort((a, b) => {
    const role =
      (SOURCE_ROLE_PRIORITY[b.source_role] ?? 0) -
      (SOURCE_ROLE_PRIORITY[a.source_role] ?? 0);
    if (role !== 0) return role;
    return (b.publication_date ?? "").localeCompare(a.publication_date ?? "");
  })[0] ?? null;
}

export function formatSourceLabel(sourceId: string) {
  return SOURCE_LABELS[sourceId] ?? sourceId.replaceAll("_", " ");
}

export function formatProcessStatus(record: Opportunity) {
  if (record.process_stage === "CANCELLED") return "Cancelado";
  if (record.application_status === "OPEN") return "Solicitudes abiertas";
  if (record.application_status === "CLOSED" && record.process_stage === "APPLICATION") {
    return "Solicitudes cerradas";
  }

  const labels: Record<string, string> = {
    DETECTED: "Detectado",
    CALL: "Convocatoria",
    APPLICATION: "Solicitudes",
    ADMISSION: "Admitidos",
    EXAM: "Examen",
    MERITS: "Méritos",
    FINAL_RESULT: "Resultado final",
    APPOINTMENT: "Nombramiento",
    POOL: "Bolsa",
    COMPLETED: "Finalizado",
    UNKNOWN: "Estado desconocido",
  };
  return labels[record.process_stage] ?? record.process_stage.replaceAll("_", " ");
}

export function isFinishedOpportunity(record: Opportunity) {
  return getOpportunityClassification(record).lifecycle === "HISTORICAL";
}

export function matchesSelectedValue(
  value: string,
  selectedValues: readonly string[],
) {
  return selectedValues.length === 0 || selectedValues.includes(value);
}

export function matchesSelectedStatus(
  record: Opportunity,
  selectedStatuses: readonly string[],
) {
  if (selectedStatuses.length === 0) return true;

  return selectedStatuses.some((status) => {
    if (status === "OPEN") return record.application_status === "OPEN";
    if (status === "REVIEW") return record.analysis.status === "NEEDS_REVIEW";
    return record.process_stage === status;
  });
}

export function getSearchableText(record: Opportunity) {
  return normalizeText([
    record.title,
    record.organization,
    record.professional_category,
    record.professional_profile,
    record.specialty,
    ...record.locations.flatMap((location) => [
      location.municipality,
      location.province,
      location.site,
      location.unit,
    ]),
    getAudienceProfile(record).label,
    ...getAudienceProfile(record).restrictionTags.map((tag) => RESTRICTION_LABELS[tag]),
    ...(record.accepted_qualifications ?? []),
    ...(record.additional_requirements ?? []).map(formatRequirement),
  ].filter(Boolean).join(" "));
}

export function getSearchTokens(query: string) {
  return [...new Set(normalizeText(query).split(" ").filter(Boolean))];
}

/** Todos los términos deben aparecer, pero pueden estar en campos y posiciones diferentes. */
export function matchesSearchQuery(record: Opportunity, query: string) {
  const tokens = getSearchTokens(query);
  if (tokens.length === 0) return true;
  const searchableText = getSearchableText(record);
  return tokens.every((token) => searchableText.includes(token));
}

const URL_DEFAULT_QUICK_FILTERS: QuickFilters = {
  generalOnly: false,
  openOnly: false,
  excludeInternal: false,
  excludeProvision: false,
  hideHistorical: false,
};

export const DEFAULT_OPPORTUNITY_URL_STATE: OpportunityUrlState = {
  view: "apply",
  query: "",
  processKinds: [],
  poolExistences: [],
  poolStatuses: [],
  statuses: [],
  accesses: [],
  sources: [],
  quickFilters: URL_DEFAULT_QUICK_FILTERS,
  sort: "useful",
  pageSize: 25,
  page: 1,
};

const VALID_URL_VALUES = {
  view: new Set<OpportunityView>(["apply", "upcoming", "pools", "tracking", "all"]),
  process: new Set(["POSITION_SELECTION", "POOL_SELECTION", "POSITION_PROVISION"]),
  pool: new Set(["YES", "CONDITIONAL", "NO", "UNKNOWN", "NOT_STATED"]),
  poolStatus: new Set(["ACTIVE", "PLANNED", "INACTIVE", "EXHAUSTED", "CANCELLED", "UNKNOWN"]),
  status: new Set(["OPEN", "DETECTED", "APPLICATION", "ADMISSION", "EXAM", "MERITS", "FINAL_RESULT", "APPOINTMENT", "COMPLETED", "CANCELLED", "REVIEW"]),
  access: new Set<AudienceScope>(["GENERAL", "INTERNAL", "MIXED", "RESTRICTED", "UNKNOWN"]),
  source: new Set(Object.keys(SOURCE_LABELS)),
  sort: new Set<OpportunitySortMode>(["useful", "recent", "oldest", "vacancies", "title"]),
};

function validValues<T extends string>(params: URLSearchParams, key: string, allowed: Set<T>) {
  return [...new Set(params.getAll(key).filter((value): value is T => allowed.has(value as T)))];
}

export function parseOpportunityUrlState(params: URLSearchParams): OpportunityUrlState {
  const viewValue = params.get("view") as OpportunityView | null;
  const sortValue = params.get("sort") as OpportunitySortMode | null;
  const pageValue = Number(params.get("page"));
  const sizeValue = params.get("size");
  const pageSize = sizeValue === "all"
    ? 0
    : [25, 50, 100].includes(Number(sizeValue))
      ? Number(sizeValue)
      : DEFAULT_OPPORTUNITY_URL_STATE.pageSize;

  return {
    view: viewValue && VALID_URL_VALUES.view.has(viewValue) ? viewValue : DEFAULT_OPPORTUNITY_URL_STATE.view,
    query: (params.get("q") ?? "").slice(0, 200),
    processKinds: validValues(params, "process", VALID_URL_VALUES.process),
    poolExistences: validValues(params, "pool", VALID_URL_VALUES.pool),
    poolStatuses: validValues(params, "poolStatus", VALID_URL_VALUES.poolStatus),
    statuses: validValues(params, "status", VALID_URL_VALUES.status),
    accesses: validValues(params, "access", VALID_URL_VALUES.access),
    sources: validValues(params, "source", VALID_URL_VALUES.source),
    quickFilters: {
      generalOnly: params.get("general") === "1",
      openOnly: params.get("open") === "1",
      excludeInternal: params.get("noInternal") === "1",
      excludeProvision: params.get("noProvision") === "1",
      hideHistorical: params.get("noHistorical") === "1",
    },
    sort: sortValue && VALID_URL_VALUES.sort.has(sortValue) ? sortValue : DEFAULT_OPPORTUNITY_URL_STATE.sort,
    pageSize,
    page: Number.isInteger(pageValue) && pageValue > 0 ? Math.min(pageValue, 10_000) : 1,
  };
}

export function serializeOpportunityUrlState(state: OpportunityUrlState) {
  const params = new URLSearchParams();
  if (state.view !== DEFAULT_OPPORTUNITY_URL_STATE.view) params.set("view", state.view);
  if (state.query.trim()) params.set("q", state.query.trim());
  for (const value of state.processKinds) params.append("process", value);
  for (const value of state.poolExistences) params.append("pool", value);
  for (const value of state.poolStatuses) params.append("poolStatus", value);
  for (const value of state.statuses) params.append("status", value);
  for (const value of state.accesses) params.append("access", value);
  for (const value of state.sources) params.append("source", value);
  if (state.quickFilters.generalOnly) params.set("general", "1");
  if (state.quickFilters.openOnly) params.set("open", "1");
  if (state.quickFilters.excludeInternal) params.set("noInternal", "1");
  if (state.quickFilters.excludeProvision) params.set("noProvision", "1");
  if (state.quickFilters.hideHistorical) params.set("noHistorical", "1");
  if (state.sort !== DEFAULT_OPPORTUNITY_URL_STATE.sort) params.set("sort", state.sort);
  if (state.pageSize !== DEFAULT_OPPORTUNITY_URL_STATE.pageSize) params.set("size", state.pageSize === 0 ? "all" : String(state.pageSize));
  if (state.page !== DEFAULT_OPPORTUNITY_URL_STATE.page) params.set("page", String(state.page));
  const value = params.toString();
  return value ? `?${value}` : "";
}
