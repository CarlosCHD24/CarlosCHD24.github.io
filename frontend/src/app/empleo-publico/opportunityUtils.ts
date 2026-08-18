export interface OpportunityLocation {
  province: string | null;
  municipality: string | null;
  site: string | null;
  unit: string | null;
}

export interface OpportunitySource {
  source_id: string;
  source_role: string;
  publication_date: string | null;
  event_types: string[];
  url: string | null;
  document_url: string | null;
  reference: string | null;
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
  access_channel: string;
  selection_system: string;
  process_stage: string;
  locations: OpportunityLocation[];
  vacancies_initial: number | null;
  vacancies_current: number | null;
  application_mode: string | null;
  application_status: string;
  application_periods: Array<{
    start_date?: string | null;
    end_date?: string | null;
  }>;
  qualification_level: string | null;
  qualification_text: string | null;
  accepted_qualifications: string[];
  additional_requirements: string[];
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

export const POOL_LABELS: Record<string, string> = {
  YES: "Sí",
  CONDITIONAL: "Posible",
  NO: "No",
  NOT_STATED: "No indicada",
  UNKNOWN: "Desconocido",
};

export function normalizeText(value: unknown = "") {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function formatUnknownValue(value: string | null | undefined) {
  if (value == null || value === "") return "—";
  if (value === "UNKNOWN") return "Desconocido";
  if (value === "NOT_STATED") return "No indicado en las bases";
  return value;
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
  return record.process_kind === "POOL_SELECTION" ? "Bolsa" : "—";
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
  ].filter(Boolean).join(" "));
}
