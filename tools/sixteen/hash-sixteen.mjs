// hash-sixteen.mjs: build the sixteen family genesis transactions and write hashes/SIXTEEN.md rows. Does not submit.
// TESTNET-10 ONLY. Never prints an id, txid, key, address, balance, host, or port. Pre-run 7's sixteen-family path.
//
//   node hash-sixteen.mjs --config <private config.json> --out <local SIXTEEN.md> [--bundle <private bundle.json>]
//   node hash-sixteen.mjs --fixture <ids.txt> --out <local file>      format check with made-up ids, never pushed
//   node hash-sixteen.mjs --verify <file> [--require-origin] [--bundle <private bundle.json>]
//
// The bundle holds the built genesis transactions (with ids). It stays in the private run dir. The family submit uses
// that bundle, so each row is the hash of the covenant the run then submits. Rebuilding makes a new bundle and new rows.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { FAMILIES, render, verify, shaOfId, normId, isHexId, cohortOf, isoZ } from "./sixteen-format.mjs";

const require = createRequire(import.meta.url);
const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf("--" + n); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const has = (n) => argv.includes("--" + n);
const say = (o) => console.log(JSON.stringify(o));
const stop = (reason, extra = {}, code = 3) => { say({ ok: 0, reason, ...extra }); process.exit(code); };
// Strip anything that could be an id, txid, address, key, host, or port from an error before it is shown.
const clean = (e) => String(e?.message ?? e).replace(/kaspa(test)?:[a-z0-9]+/gi, "<addr>").replace(/[0-9a-f]{16,}/gi, "<hex>")
  .replace(/\b\d{1,3}(\.\d{1,3}){3}(:\d+)?\b/g, "<ip>").replace(/wss?:\/\/\S+/gi, "<url>").replace(/[A-Z]:\\\S+/g, "<path>").slice(0, 160);

const MIN_COIN = 1_500_000_000n;       // 15 tKAS, the old publishers' floor for a genesis coin
const MAX_COIN = 10_000_000_000_000n;  // 100,000 tKAS. The plan: do not spend a coin at or above this.

function bundleShas(bundlePath) {
  const b = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
  if (!Array.isArray(b) || b.length !== FAMILIES) throw new Error("bundle: need 16 entries");
  return b.map((r) => ({ family: r.family, sha: shaOfId(r.g.covenantId) }));
}

// ---- verify mode -------------------------------------------------------------------------------------------------
if (has("verify")) {
  const file = arg("verify");
  const v = verify(fs.readFileSync(file, "utf8"), { requireOrigin: has("require-origin") });
  const out = { ok: v.ok ? 1 : 0, rows: v.rows.length, fixed: v.fixedZ, on_origin: v.originZ, commit: v.originCommit, fixture: v.fixture ? 1 : 0, errors: v.errors };
  if (v.ok && arg("bundle")) {
    const want = bundleShas(arg("bundle"));
    const mism = want.filter((w) => v.rows.find((r) => r.family === w.family)?.sha !== w.sha).map((w) => w.family);
    out.bundle_match = mism.length ? 0 : 1;
    if (mism.length) { out.ok = 0; out.errors.push("rows do not match bundle for families " + mism.join(",")); }
  }
  say(out);
  process.exit(out.ok ? 0 : 4);
}

const outPath = arg("out");
if (!outPath) stop("args", { need: "--out" }, 2);

// ---- fixture mode: made-up ids, for a format check only ----------------------------------------------------------
if (has("fixture")) {
  if (/[\\/]hashes[\\/]SIXTEEN\.md$/i.test(path.resolve(outPath))) stop("fixture_out_is_repo_path", {}, 2);
  const ids = fs.readFileSync(arg("fixture"), "utf8").split(/\r?\n/).map(normId).filter(Boolean);
  if (ids.length !== FAMILIES || !ids.every(isHexId)) stop("fixture_ids", { n: ids.length }, 2);
  const body = render(ids.map((id, i) => ({ family: i + 1, sha: shaOfId(id) })), { fixture: true });
  fs.writeFileSync(outPath, body, "utf8");
  const v = verify(body);
  say({ ok: v.ok ? 1 : 0, mode: "fixture", rows: v.rows.length, fixture: 1, errors: v.errors });
  process.exit(v.ok ? 0 : 4);
}

// ---- real mode ---------------------------------------------------------------------------------------------------
const cfgPath = arg("config");
if (!cfgPath) stop("args", { need: "--config" }, 2);
const CFG = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
for (const k of ["kaspa_sdk", "keys_file", "builder_exe", "storm_root", "main_node_url", "families"]) if (!CFG[k]) stop("config", { missing: k }, 2);
const fams = CFG.families.map((f) => ({ family: Number(f.family), key: Number(f.key), path: String(f.launch_path || "") }));
{
  const ok = fams.length === FAMILIES && fams.every((f, i) => f.family === i + 1 && Number.isInteger(f.key) && /^launch::\S+$/.test(f.path))
    && new Set(fams.map((f) => f.key)).size === FAMILIES && new Set(fams.map((f) => f.path)).size === FAMILIES;
  if (!ok) stop("config_families", { need: "families 1..16, one distinct key and one distinct launch_path each" }, 2);
}
// The reference builder (kcc20 storm.rs) only builds a genesis whose launch path starts with this prefix.
// Pre-run 1's hash step used launch::prerun1-... and the builder refused it: that was its HASH_STOP build.
const ALLOWED_PREFIX = "launch::storm-2026-10-";
const notAllowed = fams.filter((f) => !f.path.startsWith(ALLOWED_PREFIX)).map((f) => f.family);
if (notAllowed.length) stop("launch_path_not_on_builder_allow_list", { families: notAllowed, need_prefix: ALLOWED_PREFIX }, 2);
const bundlePath = arg("bundle", path.join(CFG.run_dir || path.dirname(cfgPath), "private", "genesis-bundle.json"));
const genesisFee = String(CFG.genesis_fee_sompi_per_gram ?? 200);
if (!globalThis.WebSocket && CFG.websocket_module) globalThis.WebSocket = require(CFG.websocket_module).w3cwebsocket;
const kaspa = require(CFG.kaspa_sdk);
const NET = "testnet-10";
const keyLines = fs.readFileSync(CFG.keys_file, "utf8").trim().split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
if (keyLines.length < Math.max(...fams.map((f) => f.key)) + 1) stop("keys_short", {}, 2);
const addrOf = (i) => new kaspa.PrivateKey(keyLines[i]).toKeypair().toAddress(NET).toString();
const to = (p, ms, l) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error(l + " timeout")), ms))]);

let rpc;
try {
  rpc = new kaspa.RpcClient({ url: CFG.main_node_url, encoding: kaspa.Encoding.Borsh, networkId: NET });
  await to(rpc.connect({ timeoutDuration: 8000, blockAsyncConnect: true }), 12000, "connect");
} catch (e) { stop("node_connect", { why: clean(e) }); }
const si = await to(rpc.getServerInfo(), 8000, "info").catch((e) => stop("node_info", { why: clean(e) }));
if (si.networkId !== NET) stop("not_testnet_10");
if (!si.isSynced) stop("node_not_synced");
if (si.hasUtxoIndex === false) stop("node_no_utxoindex");

// Outpoints already spent by a transaction in the node's mempool (for example a funding send that has not landed).
const addrs = fams.map((f) => addrOf(f.key));
const spent = new Set();
try {
  const mp = await to(rpc.getMempoolEntriesByAddresses({ addresses: addrs, includeOrphanPool: true, filterTransactionPool: false }), 30000, "mempool");
  for (const a of mp.entries || []) for (const s of a.sending || []) for (const inp of s.transaction?.inputs || []) {
    const op = inp.previousOutpoint || inp.outpoint;
    if (op) spent.add(normId(op.transactionId) + ":" + Number(op.index));
  }
} catch (e) { stop("mempool_read", { why: clean(e) }); }

const coins = [];
const used = new Set();
const sizes = new Set();
for (let i = 0; i < fams.length; i++) {
  const f = fams[i];
  let bag;
  try { bag = await to(rpc.getUtxosByAddresses({ addresses: [addrs[i]] }), 30000, "utxos"); }
  catch (e) { stop("utxo_read", { family: f.family, why: clean(e) }); }
  const ok = (bag.entries || []).filter((e) => {
    const a = BigInt(e.amount), op = normId(e.outpoint.transactionId) + ":" + Number(e.outpoint.index);
    return !e.isCoinbase && a >= MIN_COIN && a < MAX_COIN && !spent.has(op) && !used.has(op);
  });
  // Largest eligible coin first, ties by outpoint: one fixed choice for one UTXO set.
  ok.sort((a, b) => {
    const d = BigInt(b.amount) - BigInt(a.amount);
    if (d !== 0n) return d > 0n ? 1 : -1;
    const at = normId(a.outpoint.transactionId), bt = normId(b.outpoint.transactionId);
    return at < bt ? -1 : at > bt ? 1 : Number(a.outpoint.index) - Number(b.outpoint.index);
  });
  const fund = ok[0];
  if (!fund) stop("no_coin", { family: f.family, cohort: cohortOf(f.family) });
  used.add(normId(fund.outpoint.transactionId) + ":" + Number(fund.outpoint.index));
  sizes.add(String(fund.amount));
  coins.push(fund);
}
try { await rpc.disconnect(); } catch {}

// One builder, spawned directly (the 10 Nov publisher's path; pre-run 1's hash step stopped inside the build).
const errFile = path.join(path.dirname(bundlePath), "hash-sixteen-builder.err");
fs.mkdirSync(path.dirname(bundlePath), { recursive: true });
const child = spawn(CFG.builder_exe, ["storm"], {
  env: { ...process.env, STORM_KEYS: CFG.keys_file, STORM_FEE_RATE: genesisFee, STORM_ROOT: CFG.storm_root },
  stdio: ["pipe", "pipe", "pipe"],
});
child.stderr.on("data", (d) => fs.appendFileSync(errFile, String(d).split(/\r?\n/).filter(Boolean).map((l) => isoZ() + " " + l + "\n").join("")));
let buf = "";
const waiters = [];
child.stdout.on("data", (d) => {
  buf += d; let i;
  while ((i = buf.indexOf("\n")) >= 0) { const l = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (l && waiters.length) waiters.shift()(l); }
});
child.on("exit", (c) => { while (waiters.length) waiters.shift()(JSON.stringify({ ok: false, error: "builder exit " + c })); });
child.on("error", (e) => { while (waiters.length) waiters.shift()(JSON.stringify({ ok: false, error: "builder spawn " + e.code })); });
const ask = (line, ms = 180000) => new Promise((res, rej) => {
  const t = setTimeout(() => rej(new Error("builder timeout")), ms);
  waiters.push((l) => { clearTimeout(t); try { res(JSON.parse(l)); } catch { rej(new Error("builder non-json")); } });
  child.stdin.write(line + "\n");
});
const rows = [];
const bundle = [];
let at = "ping";
try {
  const ping = await ask("ping", 120000);
  if (!ping.ok) throw new Error("ping: " + (ping.error || "not ok"));
  for (let i = 0; i < fams.length; i++) {
    const f = fams[i], fund = coins[i];
    at = "family " + f.family;
    const g = await ask(`genesis ${f.key} ${fund.outpoint.transactionId} ${fund.outpoint.index} ${fund.amount} ${f.path}`);
    if (!g.ok) throw new Error("genesis: " + (g.error || "not ok"));
    const id = normId(g.covenantId ?? "");
    if (!isHexId(id)) throw new Error("genesis: no 64-hex covenant id");
    if (!g.tx || !g.txid) throw new Error("genesis: no transaction");
    rows.push({ family: f.family, sha: shaOfId(id) });
    bundle.push({ family: f.family, key: f.key, path: f.path, g });
  }
  at = "quit";
  await ask("quit", 10000).catch(() => {});
} catch (e) {
  try { child.kill(); } catch {}
  stop("build", { at, why: clean(e) });
} finally { try { child.kill(); } catch {} }

if (new Set(rows.map((r) => r.sha)).size !== FAMILIES) stop("duplicate_covenant");
const body = render(rows, { fixedZ: isoZ() });
const v = verify(body);
if (!v.ok) stop("format", { errors: v.errors });
fs.writeFileSync(bundlePath, JSON.stringify(bundle));
fs.writeFileSync(outPath, body, "utf8");
say({ ok: 1, mode: "real", rows: rows.length, fixed: v.fixedZ, coins_one_size: sizes.size === 1 ? 1 : 0, genesis_fee: Number(genesisFee), pushed: 0 });
