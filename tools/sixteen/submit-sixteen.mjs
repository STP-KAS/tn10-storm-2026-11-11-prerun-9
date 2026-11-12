// submit-sixteen.mjs: pre-run 9's family start. Submits the sixteen genesis transactions from the private bundle that
// wrote hashes/SIXTEEN.md, then writes each family's state with its hop rate (family-fees.mjs: floor 1-4 100, double 5-7 200, triple 8-10 300, triple-pub 11-13 300, high 14-16 1000). TESTNET-10 ONLY.
// Never prints an id, txid, key, address, host, or port. It is not run by any tool here; the armed desk runner runs it.
//
//   STORM_CONFIG=<run config> STORM_KIT=<kit16 folder> node submit-sixteen.mjs --bundle <private bundle> --repo <clone> --git <git> [--dry]
//
// Before any submit, all of these must hold, or nothing is submitted:
//   - origin has hashes/SIXTEEN.md with sixteen rows and an On origin line, and every row is the sha256 of this
//     bundle's covenant id (a rebuilt bundle does not match and is refused);
//   - origin has logs/PRE-RUN-OPEN.md and logs/MINI-ARMED.md (the arm), and no logs/BOT-HALT.md or logs/FAILED.md;
//   - the run config's family fees match family-fees.mjs;
//   - the node is testnet-10 and synced, and every bundle's funding coin is still unspent on it.
// --dry does every check and rebuilds each transaction in wasm to check its id, and submits nothing.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { verify, shaOfId, FAMILIES } from "./sixteen-format.mjs";
import { familyRate, cohortOfFamily, feeTableMisses } from "./family-fees.mjs";

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf("--" + n); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const dry = argv.includes("--dry");
const say = (o) => console.log(JSON.stringify(o));
const stop = (reason, extra = {}, code = 3) => { say({ ok: 0, reason, dry: dry ? 1 : 0, submitted: 0, ...extra }); process.exit(code); };
const norm = (s) => String(s).replace(/^0x/i, "").toLowerCase();
const bundlePath = arg("bundle"), repo = arg("repo"), git = arg("git");
if (!bundlePath || !repo || !git || !process.env.STORM_CONFIG) stop("args", { need: "STORM_CONFIG, STORM_KIT, --bundle --repo --git" }, 2);

// ---- origin -----------------------------------------------------------------------------------------------------
const G = (a) => { const r = spawnSync(git, ["-C", repo, ...a], { encoding: "utf8" }); return { code: r.status, out: r.stdout || "" }; };
let f = G(["fetch", "origin", "main"]); if (f.code !== 0) f = G(["fetch", "origin", "main"]); if (f.code !== 0) stop("git_fetch");
const has = (rel) => G(["cat-file", "-e", `origin/main:${rel}`]).code === 0;
const show = (rel) => { let r = G(["show", `origin/main:${rel}`]); if (r.code !== 0 || !r.out.trim()) r = G(["show", `origin/main:${rel}`]); return r.code === 0 ? r.out : ""; };
if (has("logs/BOT-HALT.md")) stop("held", { held: "bot-halt" });
if (has("logs/FAILED.md")) stop("held", { held: "failed" });
const sixteen = show("hashes/SIXTEEN.md");
if (!sixteen) stop("held", { held: "no-sixteen-on-origin" });
const v = verify(sixteen, { requireOrigin: true });
if (!v.ok || v.fixture) stop("held", { held: "sixteen-not-proof", errors: v.errors });
if (!/PRE_RUN_OPEN/.test(show("logs/PRE-RUN-OPEN.md"))) stop("held", { held: "pre-run-open-absent" });
if (!/MINI_ARMED/.test(show("logs/MINI-ARMED.md"))) stop("held", { held: "mini-armed-absent" });

// ---- bundle and fees --------------------------------------------------------------------------------------------
const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
if (!Array.isArray(bundle) || bundle.length !== FAMILIES) stop("bundle");
const mism = bundle.filter((b) => v.rows.find((r) => r.family === b.family)?.sha !== shaOfId(b.g.covenantId)).map((b) => b.family);
if (mism.length) stop("bundle_not_the_published_one", { families: mism });
if (!process.env.STORM_KIT) stop("args", { need: "STORM_KIT (the kit16 folder)" }, 2);
const kit = (f) => pathToFileURL(path.join(process.env.STORM_KIT, f)).href;
const { CFG, to, connect, P, phase, sleep } = await import(kit("lib.mjs"));
const { materialize, spkAddress, keyAddress } = await import(kit("covenant.mjs"));
const miss = feeTableMisses(CFG.families);
if (miss.length || (CFG.families || []).length !== FAMILIES) stop("fee_table", { families: miss });

// ---- node and coins ---------------------------------------------------------------------------------------------
const rpc = await connect(CFG.main_node_url, 3).catch(() => stop("node_connect"));
const si = await to(rpc.getServerInfo(), 8000).catch(() => stop("node_info"));
if (!si.isSynced) stop("node_not_synced");
const txs = [];
for (const row of bundle) {
  const g = row.g;
  const tx = materialize(g.tx);
  if (norm(tx.id) !== norm(g.txid)) stop("tx_id_mismatch", { family: row.family });
  const op = g.tx.inputs[0].previousOutpoint;
  const bag = await to(rpc.getUtxosByAddresses({ addresses: [keyAddress(Number(row.key))] }), 30000).catch(() => stop("utxo_read", { family: row.family }));
  const live = (bag.entries || []).some((e) => norm(e.outpoint.transactionId) === norm(op.transactionId) && Number(e.outpoint.index) === Number(op.index));
  if (!live) stop("bundle_coin_gone", { family: row.family, note: "the published hashes cannot land; the run fails, a new repo rebuilds" });
  txs.push({ row, g, tx });
}
const plan = bundle.map((b) => ({ family: b.family, cohort: cohortOfFamily(b.family), rate: familyRate(b.family) }));
if (dry) { say({ ok: 1, dry: 1, submitted: 0, families: FAMILIES, coins_live: FAMILIES, fees: plan.map((p) => `${p.family}:${p.rate}`).join(",") }); try { await rpc.disconnect(); } catch {} process.exit(0); }

// ---- submit -----------------------------------------------------------------------------------------------------
let ok = 0;
for (const { row, g, tx } of txs) {
  try {
    await to(rpc.submitTransaction({ transaction: tx, allowOrphan: false }), 20000, "submit");
    const minterAddr = spkAddress(g.minterSpk);
    const end = Date.now() + 60000;
    let landed = null;
    while (Date.now() < end) {
      const u = await rpc.getUtxosByAddresses({ addresses: [minterAddr] });
      landed = (u.entries || []).find((e) => norm(e.outpoint.transactionId) === norm(g.txid) && e.outpoint.index === 0) || null;
      if (landed) break;
      await sleep(400);
    }
    if (!landed) { phase("FAMILY_DROP family=" + row.family + " reason=no_genesis"); continue; }
    const rate = familyRate(row.family);
    const st = { covenantId: g.covenantId, owner: g.owner, txid: norm(g.txid), index: 0, remaining: g.remaining, spk: g.minterSpk, seq: 0, amount: String(landed.amount), cohort: cohortOfFamily(row.family), fee_sompi_per_gram: rate };
    fs.writeFileSync(P("state", "family-" + row.family + ".json"), JSON.stringify(st));
    phase("GENESIS family=" + row.family + " cohort=" + st.cohort + " hop_rate=" + rate + " included");
    ok++;
  } catch { phase("FAMILY_DROP family=" + row.family + " reason=submit"); }
}
say({ ok: ok === FAMILIES ? 1 : 0, dry: 0, submitted: ok });
try { await rpc.disconnect(); } catch {}
process.exit(ok === FAMILIES ? 0 : 3);
