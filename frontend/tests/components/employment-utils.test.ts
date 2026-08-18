import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatLocation,
  formatProcessStatus,
  formatVacancies,
  getLatestPublicationDate,
  getPrimarySource,
  normalizeText,
  type Opportunity,
} from "@/app/empleo-publico/opportunityUtils";

const record = {
  id: "record-1",
  title: "Técnico de Administración General",
  process_kind: "POSITION_SELECTION",
  process_stage: "APPLICATION",
  application_status: "OPEN",
  locations: [
    { province: "Sevilla", municipality: "Écija", site: null, unit: null },
    { province: "Sevilla", municipality: "Osuna", site: null, unit: null },
  ],
  vacancies_current: 3,
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
    expect(normalizeText("Técnico · Écija")).toBe("tecnico · ecija");
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
});
