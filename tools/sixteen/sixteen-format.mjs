// sixteen-format.mjs: the one shape of hashes/SIXTEEN.md for pre-run 9. Pure functions. No ids are ever written.
// Row: family label, cohort, sha256 of the lowercase hex covenant id. Cohorts come from family-fees.mjs: floor 1-4 (100), double 5-7 (200),
// triple 8-10 (300), triple-pub 11-13 (300, submitted on the kept public kaspads), high 14-16 (1000).
import crypto from "node:crypto";
import { TIERS } from "./family-fees.mjs";

export const FAMILIES = 16;
export const FIXTURE_MARK = "FIXTURE. NOT FOR PUSH.";
export const cohortOf = (family) => (TIERS.find((t) => family >= t.from && family <= t.to) || {}).cohort || null;
export const normId = (s) => String(s).trim().replace(/^0x/i, "").toLowerCase();
export const isHexId = (s) => /^[0-9a-f]{64}$/.test(s);
export const shaOfId = (id) => crypto.createHash("sha256").update(normId(id), "utf8").digest("hex");
export const isoZ = (d = new Date()) => d.toISOString().replace(/\.\d+Z$/, "Z");

// rows: [{ family, sha }]. Returns the file body. Throws if the rows are not exactly families 1..16.
export function render(rows, { fixedZ = isoZ(), fixture = false, label = "pre-run 9" } = {}) {
  const sorted = checkRows(rows);
  const lines = [
    "> **Experimental. We are just trying this.** [Disclaimer](../DISCLAIMER.md) · Kaspa Testnet-10 only. No covenant id in this file.",
    "",
    "# Sixteen families",
    "",
  ];
  if (fixture) lines.push(`**${FIXTURE_MARK}** These rows are sha256 of made-up ids, for a format check only. They are not covenant hashes.`, "");
  lines.push(
    `Fixed ${fixedZ}, before the first family submit. sha256 of the lowercase hex id. The id is not in this file. This is hashes/SIXTEEN.md for ${label}. ${TIERS.map((t) => `${t.cohort[0].toUpperCase() + t.cohort.slice(1)} is families ${t.from}–${t.to}.`).join(" ")}`,
    "",
    "| Family | Cohort | sha256 |",
    "|---:|---|---|",
    ...sorted.map((r) => `| ${r.family} | ${cohortOf(r.family)} | \`${r.sha}\` |`),
    "",
  );
  return lines.join("\n");
}

export function checkRows(rows) {
  if (!Array.isArray(rows) || rows.length !== FAMILIES) throw new Error(`rows: need ${FAMILIES}, have ${rows?.length}`);
  const sorted = [...rows].sort((a, b) => a.family - b.family);
  const seen = new Set();
  sorted.forEach((r, i) => {
    if (r.family !== i + 1) throw new Error("rows: families must be 1..16 once each");
    if (!/^[0-9a-f]{64}$/.test(r.sha)) throw new Error(`rows: family ${r.family} sha is not 64 lowercase hex`);
    if (seen.has(r.sha)) throw new Error(`rows: family ${r.family} repeats a sha`);
    seen.add(r.sha);
  });
  return sorted;
}

// Parses and checks a SIXTEEN.md body. Returns { ok, errors, rows, fixedZ, originZ, originCommit, fixture }.
export function verify(text, { requireOrigin = false } = {}) {
  const errors = [];
  const body = String(text).replace(/\r\n/g, "\n");
  const rowRe = /^\| (\d+) \| (floor|double|triple-pub|triple|high) \| `([0-9a-f]{64})` \|$/;
  const anyRow = body.split("\n").filter((l) => /^\| \d+ \|/.test(l));
  const rows = [];
  for (const l of anyRow) {
    const m = l.match(rowRe);
    if (!m) { errors.push("bad row: " + l.slice(0, 40)); continue; }
    const family = Number(m[1]);
    if (cohortOf(family) !== m[2]) errors.push(`family ${family} cohort ${m[2]} is wrong`);
    rows.push({ family, cohort: m[2], sha: m[3] });
  }
  if (anyRow.length !== FAMILIES) errors.push(`row count ${anyRow.length}, need ${FAMILIES}`);
  try { if (rows.length === FAMILIES) checkRows(rows); } catch (e) { errors.push(e.message); }
  if (!/^\| Family \| Cohort \| sha256 \|$/m.test(body)) errors.push("header row missing");
  const fixed = body.match(/^Fixed (\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ)\b/m);
  if (!fixed) errors.push("Fixed line missing");
  const origin = body.match(/^On origin\/main at (\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ), commit ([0-9a-f]{7,40})\./m);
  if (requireOrigin && !origin) errors.push("On origin line missing");
  const fixture = body.includes(FIXTURE_MARK);
  if (/\b[0-9a-f]{64}\b/.test(body.replace(/`[0-9a-f]{64}`/g, ""))) errors.push("a bare 64-hex string outside a row");
  if (/kaspatest:|kaspa:|\b\d{1,3}(\.\d{1,3}){3}\b|C:\\Users\\(?!Fermi\\)/i.test(body)) errors.push("an address, IP, or profile path is in the file");
  return { ok: errors.length === 0, errors: errors.length > 6 ? [...errors.slice(0, 5), `and ${errors.length - 5} more`] : errors, rows, fixedZ: fixed?.[1] ?? null, originZ: origin?.[1] ?? null, originCommit: origin?.[2] ?? null, fixture };
}

export function originLine(z, shortSha) {
  return `On origin/main at ${z}, commit ${shortSha}. That commit put these rows on GitHub. Fixed is the local write. On origin is that commit's time.`;
}

// Puts the On origin line right after the Fixed line. Leaves the rows alone.
export function withOrigin(text, z, shortSha) {
  const body = String(text).replace(/\r\n/g, "\n");
  if (/^On origin\/main at /m.test(body)) throw new Error("On origin line already present");
  const out = body.replace(/^(Fixed .+)$/m, (m) => m + "\n\n" + originLine(z, shortSha));
  if (out === body) throw new Error("Fixed line missing");
  return out;
}
