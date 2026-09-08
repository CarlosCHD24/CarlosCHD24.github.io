import type { Opportunity } from "@/app/empleo-publico/opportunityUtils";

export function makeOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  const base: Opportunity = {
    schema_version: 2,
    id: "fixture-open-general",
    title: "Técnico de Administración General",
    organization: "Ayuntamiento de prueba",
    professional_category: "Administración general",
    professional_profile: null,
    specialty: null,
    position_code: null,
    personnel_type: "CAREER_CIVIL_SERVANT",
    process_kind: "POSITION_SELECTION",
    process_scheme: "ORDINARY",
    provision_method: null,
    access_channel: "FREE",
    selection_system: "OPOSICION",
    process_stage: "APPLICATION",
    locations: [{ province: "Sevilla", municipality: "Écija", site: null, unit: null }],
    vacancies_initial: 1,
    vacancies_current: 1,
    vacancy_breakdown: [{ access_channel: "FREE", quota: "GENERAL", vacancies: 1 }],
    application_mode: "FIXED_WINDOW",
    application_status: "OPEN",
    application_periods: [{ start_date: "2026-09-01", end_date: "2026-09-11" }],
    qualification_level: "BACHILLER_OR_EQUIVALENT",
    qualification_text: null,
    accepted_qualifications: [],
    additional_requirements: [],
    pool: {
      existence: "UNKNOWN",
      name: null,
      status: null,
      personnel_type: null,
      details: null,
      destinations: [],
    },
    merit_phase: null,
    merit_details: null,
    exams: [],
    sources: [{
      source_id: "BOP_SEVILLA",
      source_role: "LEGAL_PUBLICATION",
      publication_date: "2026-09-01",
      event_types: ["CALL"],
      url: "https://example.test/convocatoria",
      document_url: null,
      reference: "TEST-1",
    }],
    analysis: {
      status: "AUTO_OK",
      is_complete: true,
      completeness_pct: 100,
      confidence: 1,
    },
    notes: null,
  };

  return {
    ...base,
    ...overrides,
    pool: { ...base.pool, ...overrides.pool },
    analysis: { ...base.analysis, ...overrides.analysis },
  };
}

export const opportunityFixtures = {
  openGeneral: makeOpportunity(),
  openCompletedConflict: makeOpportunity({
    id: "fixture-open-completed",
    process_stage: "COMPLETED",
  }),
  completedActivePool: makeOpportunity({
    id: "fixture-completed-active-pool",
    application_status: "CLOSED",
    application_periods: [],
    process_stage: "COMPLETED",
    pool: { existence: "YES", status: "ACTIVE" } as Opportunity["pool"],
  }),
  internalPromotion: makeOpportunity({
    id: "fixture-internal",
    access_channel: "INTERNAL_PROMOTION",
  }),
  provision: makeOpportunity({
    id: "fixture-provision",
    process_kind: "POSITION_PROVISION",
    provision_method: "SERVICE_COMMISSION",
  }),
  reservedQuota: makeOpportunity({
    id: "fixture-reserved-quota",
    vacancy_breakdown: [{ access_channel: "FREE", quota: "DISABILITY", vacancies: 1 }],
  }),
};
