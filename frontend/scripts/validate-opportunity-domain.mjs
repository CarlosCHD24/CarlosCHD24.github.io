import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const datasetPath = resolve(process.cwd(), "public/data/convocatorias.jsonl");
const records = (await readFile(datasetPath, "utf8"))
  .split("\n")
  .filter((line) => line.trim())
  .map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`Invalid JSON on dataset line ${index + 1}: ${error}`);
    }
  });

const reviewedExceptions = new Map([
  [
    "4af5396d-7b97-4525-9623-c4ec7c868f9f",
    "Proceso de constitución completado y bolsa activa; existe una apertura extraordinaria hasta el 16/09/2026. La inscripción abierta prevalece en el visor.",
  ],
]);

const errors = [];
const warnings = [];
const ids = new Set();
const knownAccessChannels = new Set(["FREE", "INTERNAL_PROMOTION", "MIXED", "OTHER", "UNKNOWN"]);
const asOfDate = records
  .map((record) => String(record.last_verified_at ?? "").slice(0, 10))
  .filter(Boolean)
  .sort()
  .at(-1);

for (const record of records) {
  if (record.schema_version !== 2) errors.push(`${record.id ?? "unknown"}: unsupported schema version`);
  if (!record.id || ids.has(record.id)) errors.push(`${record.id ?? "unknown"}: missing or duplicate id`);
  ids.add(record.id);
  if (!record.title || !record.organization) errors.push(`${record.id}: missing title or organization`);
  if (!knownAccessChannels.has(record.access_channel)) {
    errors.push(`${record.id}: unknown access_channel ${record.access_channel}`);
  }

  for (const period of record.application_periods ?? []) {
    if (period.start_date && period.end_date && period.start_date > period.end_date) {
      errors.push(`${record.id}: application period starts after it ends`);
    }
  }

  if (record.application_status === "OPEN" && record.process_stage === "COMPLETED") {
    const reason = reviewedExceptions.get(record.id);
    if (reason) warnings.push(`${record.id}: reviewed lifecycle overlap — ${reason}`);
    else errors.push(`${record.id}: OPEN application is unexpectedly marked COMPLETED`);
  }

  if (record.application_status === "OPEN" && !(record.application_periods ?? []).some((item) => item.end_date)) {
    warnings.push(`${record.id}: open application without a structured end date`);
  }
  if (
    record.application_status === "OPEN" &&
    asOfDate &&
    (record.application_periods ?? []).some((item) => item.end_date && item.end_date < asOfDate)
  ) {
    errors.push(`${record.id}: OPEN application has an end date before dataset verification date ${asOfDate}`);
  }
}

const metrics = {
  asOfDate,
  records: records.length,
  openApplications: records.filter((record) => record.application_status === "OPEN").length,
  openWithoutDeadline: records.filter(
    (record) =>
      record.application_status === "OPEN" &&
      !(record.application_periods ?? []).some((period) => period.end_date),
  ).length,
  activePools: records.filter((record) => record.pool?.status === "ACTIVE").length,
  activePoolsWithCompletedSelection: records.filter(
    (record) => record.pool?.status === "ACTIVE" && record.process_stage === "COMPLETED",
  ).length,
  internalPromotion: records.filter((record) => record.access_channel === "INTERNAL_PROMOTION").length,
  provision: records.filter((record) => record.process_kind === "POSITION_PROVISION").length,
  unknownAccess: records.filter((record) => record.access_channel === "UNKNOWN").length,
  recordsWithKnownQualification: records.filter(
    (record) => record.qualification_level && record.qualification_level !== "UNKNOWN",
  ).length,
  recordsWithRequirements: records.filter(
    (record) => (record.additional_requirements ?? []).length > 0,
  ).length,
  unknownApplicationState: records.filter(
    (record) => record.process_stage === "APPLICATION" && record.application_status === "UNKNOWN",
  ).length,
};

console.log(`Opportunity domain validation: ${errors.length} errors, ${warnings.length} warnings.`);
console.log(JSON.stringify(metrics, null, 2));
for (const warning of warnings) console.warn(`WARNING ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);

if (records.length !== 302) {
  console.error(`ERROR expected 302 records, received ${records.length}`);
  process.exitCode = 1;
} else if (errors.length > 0) {
  process.exitCode = 1;
}
