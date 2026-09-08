import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACCESS_LABELS,
  APPLICATION_MODE_LABELS,
  PERSONNEL_TYPE_LABELS,
  POOL_LABELS,
  POOL_STATUS_LABELS,
  PROCESS_KIND_LABELS,
  QUALIFICATION_LEVEL_LABELS,
  SELECTION_LABELS,
  SOURCE_EVENT_LABELS,
  SOURCE_LABELS,
  compareOpportunities,
  formatProcessStatus,
  getOpportunityClassification,
  matchesOpportunityView,
  type Opportunity,
} from "@/app/empleo-publico/opportunityUtils";

const asOfDate = "2026-09-08";
const records = readFileSync(resolve(process.cwd(), "public/data/convocatorias.jsonl"), "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line) as Opportunity);

describe("complete opportunity dataset domain", () => {
  it("classifies every record with a lifecycle and an audience", () => {
    expect(records).toHaveLength(302);
    for (const record of records) {
      const classification = getOpportunityClassification(record, asOfDate);
      expect(classification.lifecycle).toBeTruthy();
      expect(classification.lifecycleLabel).toBeTruthy();
      expect(classification.audience.scope).toBeTruthy();
      expect(classification.audience.label).toBeTruthy();
    }
  });

  it("has a Spanish presentation label for every currently visible contract enum", () => {
    for (const record of records) {
      expect(PERSONNEL_TYPE_LABELS[record.personnel_type ?? "UNKNOWN"]).toBeTruthy();
      expect(QUALIFICATION_LEVEL_LABELS[record.qualification_level ?? "UNKNOWN"]).toBeTruthy();
      expect(APPLICATION_MODE_LABELS[record.application_mode ?? "UNKNOWN"]).toBeTruthy();
      expect(SELECTION_LABELS[record.selection_system]).toBeTruthy();
      expect(ACCESS_LABELS[record.access_channel]).toBeTruthy();
      expect(PROCESS_KIND_LABELS[record.process_kind]).toBeTruthy();
      expect(POOL_LABELS[record.pool.existence]).toBeTruthy();
      expect(POOL_STATUS_LABELS[record.pool.status ?? "UNKNOWN"]).toBeTruthy();
      expect(formatProcessStatus(record)).not.toMatch(/^[A-Z][A-Z0-9_]+$/);
      for (const source of record.sources) {
        expect(SOURCE_LABELS[source.source_id]).toBeTruthy();
        for (const eventType of source.event_types) expect(SOURCE_EVENT_LABELS[eventType]).toBeTruthy();
      }
    }
  });

  it("keeps internal promotion and provision out of the default application view", () => {
    const applicationView = records.filter((record) => matchesOpportunityView(record, "apply", asOfDate));
    expect(applicationView).toHaveLength(19);
    expect(applicationView.some((record) => record.access_channel === "INTERNAL_PROMOTION")).toBe(false);
    expect(applicationView.some((record) => record.process_kind === "POSITION_PROVISION")).toBe(false);
  });

  it("preserves every active pool in the active-pool view", () => {
    const activePools = records.filter((record) => record.pool.status === "ACTIVE");
    const poolView = records.filter((record) => matchesOpportunityView(record, "pools", asOfDate));
    expect(activePools).toHaveLength(29);
    expect(poolView.map((record) => record.id).sort()).toEqual(
      activePools.map((record) => record.id).sort(),
    );
  });

  it("keeps active and planned pools in separate categories", () => {
    expect(records.filter((record) => record.pool.status === "ACTIVE")).toHaveLength(29);
    expect(records.filter((record) => record.pool.status === "PLANNED")).toHaveLength(74);
    const activeAndOpen = records.filter(
      (record) => record.pool.status === "ACTIVE" && record.application_status === "OPEN",
    );
    expect(activeAndOpen).toHaveLength(1);
    expect(matchesOpportunityView(activeAndOpen[0], "pools", asOfDate)).toBe(true);
    expect(getOpportunityClassification(activeAndOpen[0], asOfDate).lifecycle).toBe("OPEN_FOR_APPLICATION");
  });

  it("keeps the reviewed teaching overlap visible with its restriction and deadline", () => {
    const record = records.find((item) => item.id === "4af5396d-7b97-4525-9623-c4ec7c868f9f");
    expect(record).toBeDefined();
    const classification = getOpportunityClassification(record!, asOfDate);
    expect(classification).toMatchObject({
      lifecycle: "OPEN_FOR_APPLICATION",
      audience: {
        scope: "RESTRICTED",
        label: "Solo integrantes de otra bolsa",
      },
      deadline: {
        endDate: "2026-09-16",
        state: "OPEN",
      },
    });
    expect(classification.conflicts).toHaveLength(1);
    expect(matchesOpportunityView(record!, "apply", asOfDate)).toBe(true);
    expect(matchesOpportunityView(record!, "pools", asOfDate)).toBe(true);
  });

  it("gives every open application a date or an explicit unknown-date label", () => {
    const openRecords = records.filter((record) => record.application_status === "OPEN");
    expect(openRecords).toHaveLength(20);
    for (const record of openRecords) {
      const { deadline } = getOpportunityClassification(record, asOfDate);
      expect(deadline.endDate || deadline.label === "Abierta · fecha fin no disponible").toBeTruthy();
    }
  });

  it("keeps the urgent named opportunities near the front of the useful order", () => {
    const sorted = records
      .filter((record) => matchesOpportunityView(record, "apply", asOfDate))
      .sort((a, b) => compareOpportunities(a, b, "useful", asOfDate));
    const peonIndex = sorted.findIndex((record) => record.title === "Peón/a — 106 plazas");
    const upoIndex = sorted.findIndex((record) => record.position_code === "IMEE/2026");

    expect(peonIndex).toBeGreaterThanOrEqual(0);
    expect(upoIndex).toBeGreaterThan(peonIndex);
    expect(sorted[peonIndex].application_periods[0].end_date).toBe("2026-09-11");
    expect(sorted[upoIndex].application_periods[0].end_date).toBe("2026-09-17");
  });
});
