import { describe, expect, it } from "vitest";
import {
  APPLICATION_MODE_LABELS,
  DEFAULT_OPPORTUNITY_URL_STATE,
  PERSONNEL_TYPE_LABELS,
  QUALIFICATION_LEVEL_LABELS,
  compareOpportunities,
  formatDate,
  formatLocation,
  formatProcessStatus,
  formatVacancies,
  getAudienceProfile,
  getDeadlineInfo,
  getLatestPublicationDate,
  getOpportunityClassification,
  getSearchTokens,
  getPrimarySource,
  isFinishedOpportunity,
  matchesOpportunityView,
  matchesQuickFilters,
  matchesSearchQuery,
  matchesSelectedStatus,
  matchesSelectedValue,
  normalizeText,
  parseOpportunityUrlState,
  serializeOpportunityUrlState,
  type Opportunity,
} from "@/app/empleo-publico/opportunityUtils";
import { opportunityFixtures } from "../fixtures/opportunities";

const record = {
  id: "record-1",
  title: "Técnico de Administración General",
  process_kind: "POSITION_SELECTION",
  access_channel: "FREE",
  process_stage: "APPLICATION",
  application_status: "OPEN",
  locations: [
    { province: "Sevilla", municipality: "Écija", site: null, unit: null },
    { province: "Sevilla", municipality: "Osuna", site: null, unit: null },
  ],
  vacancies_current: 3,
  vacancy_breakdown: [
    { access_channel: "FREE", quota: "GENERAL", vacancies: 3 },
  ],
  application_periods: [],
  pool: {
    existence: "UNKNOWN",
    name: null,
    status: null,
    personnel_type: null,
    details: null,
    destinations: [],
  },
  analysis: {
    status: "READY",
    is_complete: true,
    completeness_pct: 100,
    confidence: 1,
  },
  sources: [
    {
      source_id: "PAG_EMPLEO_PUBLICO",
      source_role: "OFFICIAL_AGGREGATOR",
      publication_date: "2026-08-10",
      event_types: [],
      url: null,
      document_url: null,
      reference: null,
    },
    {
      source_id: "BOP_SEVILLA",
      source_role: "LEGAL_PUBLICATION",
      publication_date: "2026-08-08",
      event_types: [],
      url: null,
      document_url: null,
      reference: null,
    },
  ],
} as Opportunity;

describe("employment presentation helpers", () => {
  it("normalizes case and Spanish diacritics without changing source data", () => {
    expect(normalizeText("Técnico · Écija")).toBe("tecnico ecija");
    expect(normalizeText("Bolsa—Dibujo (2026/27)")).toBe("bolsa dibujo 2026 27");
  });

  it("matches unordered natural terms across multiple indexed fields", () => {
    const teachingPool = {
      ...record,
      title: "Bolsa docente — Profesores de Enseñanza Secundaria — Dibujo",
      organization: "Junta de Andalucía",
    } as Opportunity;
    expect(getSearchTokens("Dibujo, bolsa PROFESORES secundaria docente")).toEqual([
      "dibujo", "bolsa", "profesores", "secundaria", "docente",
    ]);
    expect(matchesSearchQuery(teachingPool, "Dibujo bolsa Profesores Secundaria docente")).toBe(true);
    expect(matchesSearchQuery(record, "Ayuntamiento técnico Écija")).toBe(false);
    expect(matchesSearchQuery(
      { ...record, organization: "Ayuntamiento de Écija" },
      "Écija técnico ayuntamiento",
    )).toBe(true);
  });

  it("translates contract enums used in the public detail", () => {
    expect(PERSONNEL_TYPE_LABELS.LABOR_FIXED).toBe("Personal laboral fijo");
    expect(QUALIFICATION_LEVEL_LABELS.PRIMARY).toBe("Estudios primarios o equivalente");
    expect(APPLICATION_MODE_LABELS.FIXED_WINDOW).toBe("Plazo con fechas determinadas");
  });

  it("formats multiple locations and vacancies", () => {
    expect(formatLocation(record)).toBe("Écija +1");
    expect(formatVacancies(record)).toBe("3");
  });

  it("uses the latest publication date but prioritizes a legal source", () => {
    expect(getLatestPublicationDate(record)).toBe("2026-08-10");
    expect(formatDate(getLatestPublicationDate(record))).toBe("10/08/2026");
    expect(getPrimarySource(record)?.source_id).toBe("BOP_SEVILLA");
  });

  it("renders an open application as the most useful status", () => {
    expect(formatProcessStatus(record)).toBe("Solicitudes abiertas");
  });

  it("only treats a completed process with no open application or active pool as historical", () => {
    expect(isFinishedOpportunity(record)).toBe(false);
    expect(isFinishedOpportunity({
      ...record,
      process_stage: "COMPLETED",
      application_status: "UNKNOWN",
    })).toBe(true);
    expect(isFinishedOpportunity({ ...record, process_stage: "COMPLETED" })).toBe(false);
    expect(isFinishedOpportunity({
      ...record,
      process_stage: "COMPLETED",
      application_status: "UNKNOWN",
      pool: { ...record.pool, status: "ACTIVE" },
    })).toBe(false);
    expect(isFinishedOpportunity({ ...record, process_stage: "APPOINTMENT" })).toBe(false);
  });

  it("makes an open application prevail and reports a completed-stage overlap", () => {
    const classification = getOpportunityClassification(
      { ...record, process_stage: "COMPLETED" },
      "2026-09-08",
    );
    expect(classification.lifecycle).toBe("OPEN_FOR_APPLICATION");
    expect(classification.conflicts).toHaveLength(1);
  });

  it("keeps active pools in their own useful view", () => {
    const activePool = {
      ...record,
      application_status: "UNKNOWN",
      process_stage: "COMPLETED",
      pool: { ...record.pool, existence: "YES", status: "ACTIVE" },
    } as Opportunity;
    expect(getOpportunityClassification(activePool, "2026-09-08").lifecycle).toBe("ACTIVE_POOL");
    expect(matchesOpportunityView(activePool, "pools", "2026-09-08")).toBe(true);
    expect(matchesOpportunityView(activePool, "apply", "2026-09-08")).toBe(false);
  });

  it("formats known, urgent and missing open deadlines explicitly", () => {
    expect(getDeadlineInfo(record, "2026-09-08").label).toBe("Abierta · fecha fin no disponible");
    const withDeadline = {
      ...record,
      application_periods: [{ start_date: "2026-09-01", end_date: "2026-09-11" }],
    } as Opportunity;
    expect(getDeadlineInfo(withDeadline, "2026-09-08")).toMatchObject({
      endDate: "2026-09-11",
      state: "SOON",
      label: "Cierra pronto · 11/09/2026",
    });
    expect(getDeadlineInfo(withDeadline, "2026-09-11")).toMatchObject({
      state: "TODAY",
      label: "Cierra hoy",
    });
    expect(getOpportunityClassification(withDeadline, "2026-09-12")).toMatchObject({
      lifecycle: "DATA_CONFLICT",
    });
  });

  it("derives audience from structured access, provision and quota fields", () => {
    expect(getAudienceProfile(record)).toMatchObject({ scope: "GENERAL", label: "Acceso libre" });
    expect(getAudienceProfile({ ...record, access_channel: "INTERNAL_PROMOTION" })).toMatchObject({
      scope: "INTERNAL",
      label: "Promoción interna",
    });
    expect(getAudienceProfile({
      ...record,
      vacancy_breakdown: [{ access_channel: "FREE", quota: "DISABILITY", vacancies: 1 }],
    })).toMatchObject({ scope: "RESTRICTED", label: "Cupo de discapacidad" });
    expect(getAudienceProfile({ ...record, process_kind: "POSITION_PROVISION" })).toMatchObject({
      scope: "RESTRICTED",
      label: "Provisión restringida",
    });
  });

  it("keeps internal promotion and provision out of the application view", () => {
    expect(matchesOpportunityView(record, "apply", "2026-09-08")).toBe(true);
    expect(matchesOpportunityView({ ...record, access_channel: "INTERNAL_PROMOTION" }, "apply", "2026-09-08")).toBe(false);
    expect(matchesOpportunityView({ ...record, process_kind: "POSITION_PROVISION" }, "apply", "2026-09-08")).toBe(false);
  });

  it("matches any selected value while treating an empty selection as all", () => {
    expect(matchesSelectedValue(record.process_kind, [])).toBe(true);
    expect(matchesSelectedValue(record.process_kind, ["POOL_SELECTION", "POSITION_SELECTION"])).toBe(true);
    expect(matchesSelectedValue(record.process_kind, ["POOL_SELECTION"])).toBe(false);
  });

  it("combines multiple status choices with OR semantics", () => {
    expect(matchesSelectedStatus(record, [])).toBe(true);
    expect(matchesSelectedStatus(record, ["ADMISSION", "OPEN"])).toBe(true);
    expect(matchesSelectedStatus(record, ["ADMISSION", "EXAM"])).toBe(false);
    expect(matchesSelectedStatus(record, ["APPLICATION"])).toBe(true);
  });

  it("orders useful opportunities by action, audience, known deadline and stable tie-breakers", () => {
    const closesFirst = {
      ...record,
      id: "closes-first",
      title: "Cierra primero",
      application_periods: [{ end_date: "2026-09-11" }],
    } as Opportunity;
    const closesLater = {
      ...record,
      id: "closes-later",
      title: "Cierra después",
      application_periods: [{ end_date: "2026-09-17" }],
    } as Opportunity;
    const unknownDeadline = { ...record, id: "unknown-deadline", title: "Sin fecha" } as Opportunity;
    const internal = { ...closesFirst, id: "internal", access_channel: "INTERNAL_PROMOTION" } as Opportunity;

    const sorted = [unknownDeadline, internal, closesLater, closesFirst]
      .sort((a, b) => compareOpportunities(a, b, "useful", "2026-09-08"));
    expect(sorted.map((item) => item.id)).toEqual([
      "closes-first",
      "closes-later",
      "unknown-deadline",
      "internal",
    ]);
    expect(compareOpportunities(closesFirst, { ...closesFirst }, "useful", "2026-09-08")).toBe(0);
  });

  it("combines quick exclusions with AND semantics and preserves active pools", () => {
    const allQuickFilters = {
      generalOnly: true,
      openOnly: true,
      excludeInternal: true,
      excludeProvision: true,
      hideHistorical: true,
    };
    expect(matchesQuickFilters(record, allQuickFilters, "2026-09-08")).toBe(true);
    expect(matchesQuickFilters(
      { ...record, access_channel: "INTERNAL_PROMOTION" },
      allQuickFilters,
      "2026-09-08",
    )).toBe(false);
    expect(matchesQuickFilters(
      { ...record, process_kind: "POSITION_PROVISION" },
      allQuickFilters,
      "2026-09-08",
    )).toBe(false);

    const activeCompletedPool = {
      ...record,
      application_status: "CLOSED",
      process_stage: "COMPLETED",
      pool: { ...record.pool, existence: "YES", status: "ACTIVE" },
    } as Opportunity;
    expect(matchesQuickFilters(
      activeCompletedPool,
      { ...allQuickFilters, generalOnly: false, openOnly: false },
      "2026-09-08",
    )).toBe(true);
  });

  it("uses shared fixtures for normal, conflicting and restricted lifecycle cases", () => {
    expect(getOpportunityClassification(opportunityFixtures.openGeneral, "2026-09-08").lifecycle).toBe("OPEN_FOR_APPLICATION");
    expect(getOpportunityClassification(opportunityFixtures.openCompletedConflict, "2026-09-08").conflicts).toHaveLength(1);
    expect(matchesOpportunityView(opportunityFixtures.completedActivePool, "pools", "2026-09-08")).toBe(true);
    expect(getAudienceProfile(opportunityFixtures.internalPromotion).scope).toBe("INTERNAL");
    expect(getAudienceProfile(opportunityFixtures.provision).scope).toBe("RESTRICTED");
    expect(getAudienceProfile(opportunityFixtures.reservedQuota).scope).toBe("RESTRICTED");
  });

  it("round-trips valid URL state and safely removes unknown parameters", () => {
    const state = {
      ...DEFAULT_OPPORTUNITY_URL_STATE,
      view: "all" as const,
      query: "peón Sevilla",
      processKinds: ["POSITION_SELECTION"],
      poolStatuses: ["ACTIVE"],
      accesses: ["GENERAL"],
      quickFilters: { ...DEFAULT_OPPORTUNITY_URL_STATE.quickFilters, hideHistorical: true },
      sort: "vacancies" as const,
      pageSize: 50,
      page: 2,
    };
    const serialized = serializeOpportunityUrlState(state);
    expect(parseOpportunityUrlState(new URLSearchParams(serialized))).toEqual(state);

    const invalid = parseOpportunityUrlState(new URLSearchParams(
      "view=INVALID&process=DROP_TABLE&sort=RANDOM&size=-1&page=-4&source=INVENTED",
    ));
    expect(invalid).toEqual(DEFAULT_OPPORTUNITY_URL_STATE);
    expect(serializeOpportunityUrlState(DEFAULT_OPPORTUNITY_URL_STATE)).toBe("");
  });
});
