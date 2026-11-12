// fee-check.mjs: proves pre-run 9's hop fee split. Submits nothing and reads no node.
//   node fee-check.mjs                     table check: the five cohorts of family-fees.mjs, payments 150, hop line carries the rate
//   STORM_CONFIG=<cfg> STORM_KIT=<kit16> STORM_BUILDER_DIRECT=1 node fee-check.mjs --builder --bundle <check bundle>
//       builds hops offline in ONE builder process through kit16's buildHop, from a check bundle's genesis state and a
//       dummy funding coin, and checks fee = mass x rate per family. With --old-builder <exe> it also checks that a
//       builder without the per-hop rate is refused rather than silently paying one rate.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { familyRate, cohortOfFamily, pathOfFamily, PUBLIC_FAMILIES, feeTableMisses, hopLine, PAY_RATE, GENESIS_RATE } from "./family-fees.mjs";

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf("--" + n); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const out = { table: 0 };

// ---- table -------------------------------------------------------------------------------------------------------
const want = { 1: [100, "floor"], 4: [100, "floor"], 5: [200, "double"], 7: [200, "double"], 8: [300, "triple"], 10: [300, "triple"], 11: [300, "triple-pub"], 13: [300, "triple-pub"], 14: [1000, "high"], 16: [1000, "high"] };
for (const [f, [r, c]] of Object.entries(want)) { assert.equal(familyRate(Number(f)), r); assert.equal(cohortOfFamily(Number(f)), c); }
assert.deepEqual(PUBLIC_FAMILIES, [11, 12, 13]); assert.equal(pathOfFamily(12), "public"); assert.equal(pathOfFamily(9), "desk"); assert.equal(pathOfFamily(15), "desk");
for (const bad of [0, 17, 1.5, "x"]) assert.throws(() => familyRate(bad));
assert.equal(PAY_RATE, 150); assert.equal(GENESIS_RATE, 200);
const good = Array.from({ length: 16 }, (_, i) => ({ family: i + 1, fee_sompi_per_gram: familyRate(i + 1) }));
assert.deepEqual(feeTableMisses(good), []);
assert.deepEqual(feeTableMisses(good.map((f) => ({ ...f, fee_sompi_per_gram: 300 }))), [1, 2, 3, 4, 5, 6, 7, 14, 15, 16]);
const coin = { txid: "00".repeat(32), index: 0, amount: "10000000000" };
assert.match(hopLine(0, coin, 7, 4), / 7 100$/); assert.match(hopLine(13, coin, 7, 7), / 7 200$/); assert.match(hopLine(13, coin, 7, 12), / 7 300$/); assert.match(hopLine(13, coin, 7, 16), / 7 1000$/);
out.table = 1;

// ---- builder (offline) -------------------------------------------------------------------------------------------
if (argv.includes("--builder")) {
  const kit = (f) => pathToFileURL(path.join(process.env.STORM_KIT, f)).href;
  const { CFG } = await import(kit("lib.mjs"));
  const { startBuilder, buildHop } = await import(kit("covenant.mjs"));
  const bundle = JSON.parse(fs.readFileSync(arg("bundle"), "utf8"));
  const B = startBuilder(null);
  await B.ask("ping", 120000);
  const rows = [];
  for (const fam of [1, 4, 5, 8, 11, 14, 16]) {
    const g = bundle.find((b) => b.family === fam).g;
    const key = Number(CFG.families.find((f) => f.family === fam).key);
    const st = { covenantId: g.covenantId, owner: g.owner, txid: String(g.txid).toLowerCase(), index: 0, remaining: g.remaining, spk: g.minterSpk };
    const h = await buildHop(B, st, coin, key, 1, fam);
    const mass = Math.max(Number(h.compute), Math.ceil(Number(h.transient) / 2));
    assert.equal(h.rate, familyRate(fam));
    assert.equal(Number(h.fee), mass * familyRate(fam), `family ${fam} fee is mass x rate`);
    rows.push({ family: fam, cohort: cohortOfFamily(fam), rate: h.rate, mass, fee: Number(h.fee) });
  }
  await B.ask("quit", 10000).catch(() => {});
  const m = Object.fromEntries(rows.map((r) => [r.family, r]));
  for (const f of [5, 8, 11, 14]) assert.equal(m[1].mass, m[f].mass, "same hop shape in every tier");
  assert.equal(m[5].fee, 2 * m[1].fee, "double pays twice floor for the same mass");
  assert.equal(m[8].fee, 3 * m[1].fee, "triple pays three times floor for the same mass");
  assert.equal(m[11].fee, m[8].fee, "triple-pub pays what triple pays");
  assert.equal(m[14].fee, 10 * m[1].fee, "high pays ten times floor for the same mass");
  out.builder = rows;
  out.one_builder_process = 1;
  if (arg("old-builder")) {
    const { spawn } = await import("node:child_process");
    const child = spawn(arg("old-builder"), ["storm"], { env: { ...process.env, STORM_KEYS: CFG.keys_file, STORM_FEE_RATE: "200", STORM_ROOT: CFG.storm_root }, stdio: ["pipe", "pipe", "ignore"] });
    let buf = ""; const lines = [];
    child.stdout.on("data", (d) => { buf += d; let i; while ((i = buf.indexOf("\n")) >= 0) { lines.push(buf.slice(0, i)); buf = buf.slice(i + 1); } });
    const g = bundle.find((b) => b.family === 1).g;
    child.stdin.write(`follow ${g.covenantId} ${g.owner} ${String(g.txid).toLowerCase()} 0 ${g.remaining} ${g.minterSpk}\n${hopLine(0, coin, 1, 1)}\nquit\n`);
    await new Promise((r) => child.on("exit", r));
    const hop = JSON.parse(lines[1]);
    out.old_builder = { echoes_rate: hop.rate === undefined ? 0 : 1, fee: hop.fee, refused_by_kit16: hop.rate === undefined ? 1 : 0 };
    assert.equal(hop.rate, undefined, "old builder does not echo a rate, so kit16 refuses it");
  }
}
console.log(JSON.stringify({ ok: 1, submitted: 0, ...out }));
