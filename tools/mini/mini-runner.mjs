// Pre-run 9 second counter: pre-run 8's, plus (a) an accepted transaction is keyed by its id, not by block and id, and a
// removed chain block takes its transactions back out of their minute (mini-dedupe.mjs, checked offline); (b) five
// cohorts (floor 1-4, double 5-7, triple 8-10, triple-pub 11-13, high 14-16). Pre-run 8 header follows.
// Pre-run 8 second counter (pre-run 7's Mini counter). Read-only on this node. One process. The desk counter is the
// primary chain count; this file's head is Mini's own read (READ, PARTIAL, NOT READ), never the desk's head.
// Starts only when this repo's PRE-RUN-OPEN is on origin and the node is synced; else HELD and exit (no waiter).
// First publish is logs/MINI-ARMED.md. Stops on logs/FAILED.md.
// No send, no mine, no key. Publishes only logs already done and counts/mini.
import fs from "node:fs";
import crypto from "node:crypto";
import dgram from "node:dgram";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { Dedupe } from "./mini-dedupe.mjs";

const require = createRequire(import.meta.url);
const HOME = String(process.env.USERPROFILE || "").replace(/\\/g, "/");   // the Mini profile; no name in the repo
const k = require(HOME + "/tn10-storm-kit/sdk/kaspa/kaspa.js");
const DIR = HOME + "/tn10-storm-2026-11-11-prerun-9-run";
const REPO = HOME + "/tn10-storm-2026-11-11-prerun-9";
const NODE_URL = fs.readFileSync(DIR + "/node-url.txt", "utf8").trim();   // local only; never in the repo
const LOCK = DIR + "/runner.lock";
const LOG = DIR + "/runner.log";
const STATE = DIR + "/state.json";
const RESOURCES = DIR + "/resources.csv";
fs.mkdirSync(DIR, { recursive: true });

function iso(ms) {
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
}
function minuteKey(ms) {
  return new Date(ms).toISOString().slice(0, 16);
}
function clean(s) {
  return String(s).replace(/wss?:\/\/\S+/g, "").replace(/https?:\/\/\S+/g, "").replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, "").slice(0, 220);
}
function log(line) {
  fs.appendFileSync(LOG, iso(Date.now()) + " " + clean(line) + "\n");
}
function resolveGit() {
  const known = HOME + "/AppData/Local/grok/git/2.55.0.windows.5/cmd/git.exe";
  if (fs.existsSync(known)) return known;
  const r = spawnSync("where.exe", ["git"], { encoding: "utf8" });
  const line = (r.stdout || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean)[0];
  if (!line) throw new Error("git path empty");
  return line;
}
const GIT = resolveGit();

if (fs.existsSync(LOCK)) {
  const old = fs.readFileSync(LOCK, "utf8").trim();
  let alive = false;
  try { process.kill(Number(old), 0); alive = true; } catch (e) { alive = !!(e && e.code === "EPERM"); }
  if (alive) { log("RUNNER refuse second lock=" + old); process.exit(0); }
  log("RUNNER stale lock=" + old);
}
fs.writeFileSync(LOCK, String(process.pid));
process.on("exit", () => { try { fs.unlinkSync(LOCK); } catch {} });

const RAW = "https://raw.githubusercontent.com/STP-KAS/tn10-storm-2026-11-11-prerun-9/main/";
const OFFERS = ["HOLD-1", "HOLD-2", "HOLD-3", "HOLD-4", "RETURN"];
const TARGET = { "HOLD-1": "1013", "HOLD-2": "1800", "HOLD-3": "2500", "HOLD-4": "1013 (observation)", RETURN: "1013" };
const COH = [["floor", 1, 4], ["double", 5, 7], ["triple", 8, 10], ["triple-pub", 11, 13], ["high", 14, 16]];
const cohOfN = (n) => (COH.find(([, a, b]) => n >= a && n <= b) || [null])[0];

function blankRec() {
  return { fam: Array(17).fill(0), noncoinbase: 0, blocks: 0, sync: "", daa: "", peers: "", unread: false };
}
let state = { subscribeMs: 0, bad: [], closed: {}, digests: {}, published: {}, prevBound: 0, tailUntil: 0, giveUp: {} };
let families = [];
let blockSets = new Map();
const txMeta = new Map();
const covOut = new Set();
const coinbase = new Set();
const DD = new Dedupe();   // pre-run 9 (a)
let lateRemovals = 0;
const headerMs = new Map();
let rpc = null;
let connected = false;
let connecting = false;
let lastBeat = Date.now();
let publishing = false;

function loadState() {
  if (!fs.existsSync(STATE)) return;
  try { state = Object.assign(state, JSON.parse(fs.readFileSync(STATE, "utf8"))); } catch { return; }
  if (!state.open) state.open = {};
  if (!state.closed) state.closed = {};
  for (const key of Object.keys(state.open)) {
    const rec = state.open[key];
    if (!rec.fam || rec.fam.length !== 17) rec.fam = Array(17).fill(0);
    rec.unread = true;
    state.closed[key] = rec;
  }
  state.open = {};
  for (const key of Object.keys(state.closed)) {
    const rec = state.closed[key];
    if (!rec.fam || rec.fam.length !== 17) rec.fam = Array(17).fill(0);
  }
}
function saveState() {
  const tmp = STATE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(state));
  fs.renameSync(tmp, STATE);
}
loadState();

function bucket(ms) {
  if (!state.subscribeMs) return null;
  if (ms < state.subscribeMs - 120000 || ms > Date.now() + 120000) return null;
  const key = minuteKey(ms);
  if (state.closed[key]) return null;
  if (!state.digests[key]) state.digests[key] = { overflow: 0, rows: {} };
  if (!state.open) state.open = {};
  if (!state.open[key]) state.open[key] = blankRec();
  return key;
}

function applyFamilies() {
  if (!families.length) return;
  const byHash = new Map(families.map((f) => [f.hash, f]));
  const bags = state.digests || {};
  for (const key of Object.keys(bags)) {
    const bag = bags[key];
    const rec = (state.open && state.open[key]) || state.closed[key];
    if (!rec || !bag || !bag.rows) continue;
    for (const hash of Object.keys(bag.rows)) {
      const fam = byHash.get(hash);
      if (!fam) continue;
      rec.fam[fam.n] += bag.rows[hash];
      delete bag.rows[hash];
    }
  }
}

function unlabeledOf(key) {
  const bag = state.digests[key];
  if (!bag) return 0;
  let n = bag.overflow || 0;
  for (const hash of Object.keys(bag.rows || {})) n += bag.rows[hash];
  return n;
}

function subDigest(key, digest) {   // pre-run 9 (a): undo one addDigest
  const rec = state.open[key]; const bag = state.digests[key]; if (!rec || !bag) return;
  const known = families.find((f) => f.hash === digest);
  if (known) { rec.fam[known.n] -= 1; return; }
  if (bag.rows[digest]) { bag.rows[digest] -= 1; if (!bag.rows[digest]) delete bag.rows[digest]; } else if (bag.overflow) bag.overflow -= 1;
}
function addDigest(key, digest) {
  const bag = state.digests[key];
  const known = families.find((f) => f.hash === digest);
  const rec = state.open[key];
  if (known) { rec.fam[known.n] += 1; return; }
  const rows = bag.rows;
  if (rows[digest]) { rows[digest] += 1; return; }
  if (Object.keys(rows).length >= 64) bag.overflow += 1;
  else rows[digest] = 1;
}

function rememberTx(tx) {
  const id = String(tx.verboseData?.transactionId || tx.verboseData?.hash || "");
  if (!/^[0-9a-f]{64}$/i.test(id)) return;
  const inputs = [];
  for (const inp of tx.inputs || []) {
    const op = inp.previousOutpoint || inp.previous_outpoint;
    if (!op) continue;
    const tid = String(op.transactionId || op.transaction_id || "");
    const ix = op.index ?? op.outputIndex ?? 0;
    if (tid) inputs.push(tid.toLowerCase() + ":" + ix);
  }
  if (!(tx.inputs || []).length) coinbase.add(id.toLowerCase());
  const outputs = [];
  (tx.outputs || []).forEach((o, ix) => {
    const c = o.covenant;
    const raw = c && (c.covenantId || c.covenant_id);
    const cov = raw ? String(raw).replace(/^0x/, "").toLowerCase() : "";
    if (cov) outputs.push({ ix, cov });
  });
  txMeta.set(id.toLowerCase(), { inputs, outputs });
  if (txMeta.size > 80000) {
    let n = 0;
    for (const key of txMeta.keys()) { txMeta.delete(key); if (++n >= 20000) break; }
  }
  if (coinbase.size > 80000) {
    let n = 0;
    for (const key of coinbase.keys()) { coinbase.delete(key); if (++n >= 20000) break; }
  }
}

function classify(txid) {
  const meta = txMeta.get(txid);
  if (!meta) return null;
  const spent = meta.inputs.some((key) => covOut.has(key));
  const rows = [];
  for (const o of meta.outputs) {
    covOut.add(txid + ":" + o.ix);
    if (covOut.size > 120000) {
      let n = 0;
      for (const key of covOut.keys()) { covOut.delete(key); if (++n >= 30000) break; }
    }
    rows.push({ digest: crypto.createHash("sha256").update(o.cov).digest("hex"), kind: spent ? "hop" : "genesis" });
  }
  return rows;
}

async function headerTime(hash) {
  const h = String(hash).replace(/^0x/, "").toLowerCase();
  if (headerMs.has(h)) return headerMs.get(h);
  const res = await rpc.getBlock({ hash: h, includeTransactions: false });
  const ts = Number(res.block.header.timestamp);
  const ms = ts < 1e12 ? ts * 1000 : ts;
  headerMs.set(h, ms);
  if (headerMs.size > 20000) headerMs.clear();
  return ms;
}

function noteBad(ms) {
  const key = minuteKey(ms || Date.now());
  if (!state.bad.includes(key)) state.bad.push(key);
}

async function onChain(ev) {
  const d = ev && ev.acceptedTransactionIds ? ev : (ev && ev.data) || ev || {};
  // pre-run 9 (a): a removed chain block takes its transactions back out of their minute (only while that minute is open).
  for (const raw of d.removedChainBlockHashes || []) {
    const block = String(raw).replace(/^0x/, "").toLowerCase();
    for (const e of DD.remove(block)) {
      const rec = state.open && state.open[e.key];
      if (!rec) { lateRemovals++; continue; }
      rec.noncoinbase -= e.nonCb; for (const dg of e.digests) subDigest(e.key, dg);
    }
    for (const set of blockSets.values()) set.delete(block);
  }
  const groups = d.acceptedTransactionIds || [];
  for (const g of groups) {
    const block = String(g.acceptingBlockHash || g.accepting_block_hash || "").replace(/^0x/, "").toLowerCase();
    const ids = g.acceptedTransactionIds || g.accepted_transaction_ids || [];
    if (!block || !ids.length) continue;
    let ms;
    try { ms = await headerTime(block); } catch { noteBad(Date.now()); continue; }
    lastBeat = Date.now();
    const key = bucket(ms);
    if (!key) continue;
    const rec = state.open[key];
    if (!blockSets.has(key)) blockSets.set(key, new Set());
    blockSets.get(key).add(block);
    rec.blocks = blockSets.get(key).size;
    for (const raw of ids) {
      const txid = String(raw).replace(/^0x/, "").toLowerCase();
      if (!DD.accept(txid, block, key)) continue;   // pre-run 9 (a): one count per id while a live chain block holds it
      const nonCb = coinbase.has(txid) ? 0 : 1;
      rec.noncoinbase += nonCb;
      const rows = classify(txid);
      const dg = rows ? rows.filter((row) => row.kind === "hop").map((row) => row.digest) : [];
      for (const x of dg) addDigest(key, x);
      DD.note(txid, nonCb, dg);
    }
  }
}

function onBlock(ev) {
  const b = ev?.block || ev?.data?.block;
  if (!b?.header) return;
  const hash = String(b.header.hash || "").replace(/^0x/, "").toLowerCase();
  const ts = Number(b.header.timestamp);
  if (hash && ts) headerMs.set(hash, ts < 1e12 ? ts * 1000 : ts);
  for (const tx of b.transactions || []) rememberTx(tx);
  lastBeat = Date.now();
}

async function connect() {
  if (connecting) return;
  connecting = true;
  try {
    const next = new k.RpcClient({ url: NODE_URL, encoding: k.Encoding.Borsh, networkId: "testnet-10" });
    await next.connect({ timeoutDuration: 8000 });
    const si = await next.getServerInfo();
    if (si.networkId !== "testnet-10") { log("PREFLIGHT fail network"); process.exit(2); }
    const peers = await next.getConnectedPeerInfo();
    const n = (peers.peerInfo || []).length;
    log("PREFLIGHT synced=" + (si.isSynced ? 1 : 0) + " peers=" + n);
    if (!si.isSynced || n < 8) log("PREFLIGHT miss synced_or_peers");
    rpc = next;
    rpc.addEventListener("block-added", (ev) => { try { onBlock(ev); } catch (e) { log("block err " + clean(e.message || e)); } });
    rpc.addEventListener("virtual-chain-changed", (ev) => { onChain(ev).catch((e) => { noteBad(Date.now()); log("chain err " + clean(e.message || e)); }); });
    rpc.addEventListener("disconnect", () => { connected = false; noteBad(Date.now()); log("node disconnect"); });
    await rpc.subscribeBlockAdded();
    await rpc.subscribeVirtualChainChanged(true);
    connected = true;
    lastBeat = Date.now();
    if (!state.subscribeMs) state.subscribeMs = Date.now();
    noteBad(Date.now());
    log("subscribed");
  } catch (e) {
    connected = false;
    noteBad(Date.now());
    log("connect fail " + clean(e.message || e));
  } finally {
    connecting = false;
  }
}

let hashFail = 0;
let hashLogged = -1;
async function refreshHashes() {
  try {
    const res = await fetch(RAW + "hashes/SIXTEEN.md");
    if (!res.ok) throw new Error("http " + res.status);
    const text = await res.text();
    const next = [];
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\|\s*(\d{1,2})\s*\|\s*(floor|double|triple-pub|triple|high)\s*\|\s*`?([0-9a-f]{64})`?\s*\|\s*$/);
      if (!m) continue;
      const n = Number(m[1]);
      if (n < 1 || n > 16) continue;
      if (cohOfN(n) !== m[2]) continue;
      next.push({ n, hash: m[3] });
    }
    const strict = next.length === 16 && new Set(next.map((f) => f.n)).size === 16 && new Set(next.map((f) => f.hash)).size === 16 && /^On origin\/main at \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z, commit [0-9a-f]{7,}/m.test(text);
    if (!strict && hashLogged !== -2) { hashLogged = -2; log("hashes not sixteen with an On origin line n=" + next.length); }
    if (strict) {
      families = next;
      applyFamilies();
      hashFail = 0;
      if (families.length !== hashLogged) {
        hashLogged = families.length;
        log("hashes n=" + families.length);
      }
    }
  } catch (e) {
    hashFail++;
    if (hashFail === 1 || hashFail % 20 === 0) log("hash read failed err=" + clean(e.message || e));
  }
}

function closeMinutes() {
  if (!state.open) state.open = {};
  const now = Date.now();
  for (const key of Object.keys(state.open)) {
    const start = Date.parse(key + ":00Z");
    if (now < start + 60000) continue;
    const rec = state.open[key];
    rec.unread = state.bad.includes(key) || rec.unread;
    state.closed[key] = rec;
    delete state.open[key];
    blockSets.delete(key);
  }
}

async function sampleNode(key) {
  const rec = state.open && state.open[key];
  if (!rec || !rpc) return;
  try {
    const si = await rpc.getServerInfo();
    const dag = await rpc.getBlockDagInfo();
    const peers = await rpc.getConnectedPeerInfo();
    rec.sync = si.isSynced ? "1" : "0";
    rec.daa = String(dag.virtualDaaScore);
    rec.peers = String((peers.peerInfo || []).length);
  } catch {
    noteBad(Date.parse(key + ":00Z"));
  }
}

function sampleResources(key) {
  if (fs.existsSync(RESOURCES)) {
    const seen = fs.readFileSync(RESOURCES, "utf8");
    if (seen.includes(key + ",")) return;
  } else {
    fs.writeFileSync(RESOURCES, "minute,mempool,free_mb,cpu\n");
  }
  const started = Date.now();
  const r = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command",
    "$os=Get-CimInstance Win32_OperatingSystem; $cpu=(Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average; '{0},{1}' -f [int]($os.FreePhysicalMemory/1024), [int]$cpu"
  ], { encoding: "utf8", timeout: 2000 });
  if (r.error || Date.now() - started > 2000 || !r.stdout) return;
  const parts = r.stdout.trim().split(",");
  const free = Number(parts[0]);
  const cpu = parts[1] || "";
  if (!Number.isFinite(free) || free < 1024) return;
  pendingMempool(key, free, cpu).catch(() => {});
}

const resourcePending = new Set();
async function pendingMempool(key, free, cpu) {
  if (resourcePending.has(key) || !rpc) return;
  resourcePending.add(key);
  try {
    const info = await Promise.race([
      rpc.getInfo(),
      new Promise((_, rej) => setTimeout(() => rej(new Error("slow")), 2000)),
    ]);
    const size = info && info.mempoolSize != null ? String(info.mempoolSize) : "";
    if (!size) return;
    fs.appendFileSync(RESOURCES, [key, size, free, cpu].join(",") + "\n");
  } catch {
    return;
  }
}

function gitOnce(args) {
  let out = spawnSync(GIT, args, { cwd: REPO, encoding: "utf8" });
  let text = ((out.stdout || "") + (out.stderr || "")).trim();
  if (!text) {
    out = spawnSync(GIT, args, { cwd: REPO, encoding: "utf8" });
    text = ((out.stdout || "") + (out.stderr || "")).trim();
  }
  return { status: out.status, text };
}

function originText(path) {
  const show = gitOnce(["show", "origin/main:" + path]);
  if (show.status !== 0) return null;
  return show.text;
}
function originMs(path) {
  const got = gitOnce(["log", "-1", "--format=%cI", "origin/main", "--", path]);
  if (got.status !== 0 || !got.text) return null;
  const ms = Date.parse(got.text.trim().split(/\r?\n/)[0]);
  return Number.isFinite(ms) ? ms : null;
}

function namedMinutes(text) {
  const s = new Set();
  for (const m of text.matchAll(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/g)) s.add(m[0].replace(" ", "T"));
  return [...s].sort();
}
function windowMinutes(startMs, endMs) {
  const out = [];
  let t = Math.floor(startMs / 60000) * 60000;
  const end = Math.floor(endMs / 60000) * 60000;
  for (; t < end; t += 60000) out.push(minuteKey(t));
  return out;
}
function observationStart(hold3Ms) {
  const bound = hold3Ms + 3 * 60 * 1000;
  return Math.ceil(bound / 60000) * 60000;
}

function deskHead(text) {
  const line = text.split(/\r?\n/).map((s) => s.trim()).find((s) => /^(MET|NOT MET|OBSERVATION)\b/.test(s));
  return line ? line.match(/^(MET|NOT MET|OBSERVATION)/)[0] : "";
}
function deskNotes(text) {
  const notes = [];
  if (/one rate/i.test(text)) notes.push("one rate");
  if (/not one size/i.test(text)) notes.push("coins were not one size");
  return notes;
}

function senderMark(botText, botPresent) {
  if (!botPresent) return ["ONE SENDER", "bot-file-absent"];
  if (/^\s*NO SEND\b/m.test(botText || "")) return ["ONE SENDER", "NO SEND"];
  return ["TWO SENDERS"];
}

function render(name, minutes, deskText, extra) {
  applyFamilies();
  const unread = [];
  const cohortRows = ["minute," + COH.map(([c]) => c + "_hops").join(",") + ",noncoinbase,sync,daa,merged_bps,read,unlabeled_hops"];
  const famRows = ["minute,family,hops"];
  for (const key of minutes) {
    const rec = state.closed[key] || blankRec();
    if (!state.closed[key] || rec.unread || state.bad.includes(key)) unread.push(key + "Z");
    const per = COH.map(([, a, b]) => { let n = 0; for (let i = a; i <= b; i++) n += rec.fam[i] || 0; return n; });
    const bps = ((rec.blocks || 0) / 60).toFixed(1);
    const read = unread.includes(key + "Z") ? "0" : "1";
    cohortRows.push([key + "Z", ...per, rec.noncoinbase || 0, rec.sync, rec.daa, bps, read, unlabeledOf(key)].join(","));
    for (let i = 1; i <= 16; i++) famRows.push(key + "Z," + i + "," + (rec.fam[i] || 0));
  }
  const lines = ["# " + name, ""];
  // Pre-run 8: Mini's own head, from what Mini read. The desk's head is quoted once, as the desk's, not as Mini's.
  const readN = minutes.length - unread.length;
  const own = !minutes.length ? "NOT READ" : readN === minutes.length ? "READ" : readN === 0 ? "NOT READ" : "PARTIAL";
  lines.push(own + " " + readN + " of " + minutes.length + " minutes read in full on Mini's node", "");
  const head = deskHead(deskText);
  if (head) lines.push("The desk's head for this step is " + head + ". That is the desk's verdict on its submit-OK, not Mini's.", "");
  if (extra) for (const line of extra) lines.push(line);
  if (extra) lines.push("");
  for (const note of deskNotes(deskText)) lines.push(note);
  if (deskNotes(deskText).length) lines.push("");
  lines.push(
    "Target " + TARGET[name] + ".",
    "accept_utc is the accepting block header time.",
    "Cohorts: floor families 1-4 (100), double 5-7 (200), triple 8-10 (300), triple-pub 11-13 (300, submitted on the kept public kaspads), high 14-16 (1000).",
    "Pre-run 9: each accepted id counts once while a live chain block holds it; a removed chain block takes its ids out of an open minute. Removals after a minute closed: " + lateRemovals + " (not taken out; the closed minute is not rewritten). Duplicate acceptances skipped: " + DD.dupSkipped + ".",
    "noncoinbase is accepted transactions that are not coinbase. It includes base load.",
    "sync, daa, and merged_bps are this node's marks. They do not gate the desk.",
    "",
    "## Minutes not read in full",
    "",
    unread.length ? unread.join("\n") : "none",
    "",
    "## Cohorts",
    "",
    "```",
    cohortRows.join("\n"),
    "```",
    "",
    "## Families",
    "",
    "```",
    famRows.join("\n"),
    "```",
    ""
  );
  return lines.join("\n");
}

function commitAndPush(rel) {
  const add = gitOnce(["add", "--", rel]);
  if (add.status !== 0) { log("GIT_FAIL add " + clean(add.text)); return false; }
  const commit = gitOnce(["commit", "-m", "mini publish " + rel.split("/").pop()]);
  if (commit.status !== 0 && !/nothing to commit/i.test(commit.text)) { log("GIT_FAIL commit " + clean(commit.text)); return false; }
  const pull = gitOnce(["pull", "--rebase", "origin", "main"]);
  if (pull.status !== 0) {
    gitOnce(["rebase", "--abort"]);
    log("GIT_FAIL pull " + clean(pull.text));
    return false;
  }
  let push = gitOnce(["push", "origin", "HEAD"]);
  if (push.status !== 0) push = gitOnce(["push", "origin", "HEAD"]);
  if (push.status !== 0 || !push.text) { log("GIT_FAIL push " + clean(push.text || "empty")); return false; }
  return true;
}

async function publishReady() {
  if (publishing) return;
  publishing = true;
  const began = Date.now();
  try {
    const fetch = gitOnce(["fetch", "origin", "main"]);
    if (fetch.status !== 0) { log("GIT_FAIL fetch " + clean(fetch.text || "empty")); return; }
    if (originText("logs/FAILED.md") != null) { log("STOP failed-on-origin"); saveState(); process.exit(0); }
    for (const name of OFFERS) {
      if (state.published[name] || state.giveUp[name]) continue;
      if (originText("counts/mini/" + name + ".md")) { state.published[name] = iso(Date.now()); continue; }
      const desk = originText("counts/desk/" + name + ".md");
      if (!desk) return;
      const deskMs = originMs("counts/desk/" + name + ".md");
      if (!deskMs) { log("desk time unread file=" + name); return; }
      let minutes = [];
      let extra = null;
      if (name === "HOLD-4") {
        const hold3 = originMs("counts/desk/HOLD-3.md");
        if (!hold3) return;
        const start = observationStart(hold3);
        if (Date.now() < start + 60000) return;
        const bot = originText("counts/bot/HOLD-4.md");
        const halt = originText("logs/BOT-HALT.md");
        const age = Date.now() - deskMs;
        if (bot == null && halt == null && age < 10 * 60 * 1000) return;
        extra = senderMark(bot, bot != null);
        minutes = [minuteKey(start)];
        log("hold4 minute=" + minutes[0]);
      } else {
        const named = namedMinutes(desk);
        minutes = named.length ? named : windowMinutes(state.prevBound || state.subscribeMs || deskMs - 60000, deskMs);
        if (!named.length) log("desk file named no minute file=" + name);
      }
      if (!minutes.length) { log("no minutes file=" + name); return; }
      if (minutes.some((key) => Date.now() < Date.parse(key + ":00Z") + 60000)) return;
      for (const key of minutes) {
        if (!state.closed[key]) {
          const rec = blankRec();
          rec.unread = true;
          state.closed[key] = rec;
        }
      }
      const rel = "counts/mini/" + name + ".md";
      const dest = REPO + "/" + rel;
      if (!fs.existsSync(dest)) fs.writeFileSync(dest, render(name, minutes, desk, extra));
      if (!commitAndPush(rel)) { state.giveUp[name] = true; return; }
      state.published[name] = iso(Date.now());
      state.prevBound = deskMs;
      log("PUBLISHED " + rel);
      if (name === "RETURN" && !state.tailUntil) state.tailUntil = Date.now() + 15 * 60 * 1000;
      saveState();
    }
  } finally {
    if (Date.now() - began > 5000) noteBad(Date.now());
    publishing = false;
  }
}

function clockOffset() {
  return new Promise((resolve) => {
    const s = dgram.createSocket("udp4");
    const q = Buffer.alloc(48);
    q[0] = 0x1b;
    const t1 = Date.now();
    const to = setTimeout(() => { try { s.close(); } catch {} resolve(null); }, 3000);
    s.on("message", (m) => {
      const t4 = Date.now();
      clearTimeout(to);
      try { s.close(); } catch {}
      if (m.length < 48 || m[1] === 0) return resolve(null);
      const ntp = (o) => (m.readUInt32BE(o) - 2208988800) * 1000 + (m.readUInt32BE(o + 4) * 1000) / 2 ** 32;
      resolve(((m && (ntp(32) - t1) + (ntp(40) - t4)) / 2));
    });
    s.send(q, 123, "pool.ntp.org", () => {});
  });
}

function minerCount() {
  const r = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", "(Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'miner' }).Count"], { encoding: "utf8", timeout: 8000 });
  const n = parseInt(String(r.stdout || "").trim(), 10);
  return Number.isFinite(n) ? n : -1;
}

process.on("uncaughtException", (e) => { log("UNCAUGHT " + clean((e && e.stack) || e)); });
process.on("unhandledRejection", (e) => { log("REJECTION " + clean((e && e.stack) || e)); });

log("RUNNER clock=prerun-9 start pid=" + process.pid);
const off = await clockOffset();
log("CLOCK " + (off == null ? "unread" : off.toFixed(1)));
if (off == null || Math.abs(off) > 80) log("PREFLIGHT miss clock");
const miners = minerCount();
log("MINERS n=" + miners);
if (miners !== 0) log("PREFLIGHT miss miners");
if (!fs.existsSync(REPO + "/.git")) { log("HELD no-clone"); process.exit(3); }
if (!gitOnce(["config", "user.name"]).text || !gitOnce(["config", "user.email"]).text) { log("HELD no-git-identity"); process.exit(3); }
{
  const f = gitOnce(["fetch", "origin", "main"]);
  if (f.status !== 0) { log("HELD git-fetch " + clean(f.text)); process.exit(3); }
  if (originText("logs/FAILED.md") != null) { log("HELD failed-on-origin"); process.exit(3); }
  if (originText("logs/PRE-RUN-OPEN.md") == null) { log("HELD no-open-file"); process.exit(3); }
  const pc = new k.RpcClient({ url: NODE_URL, encoding: k.Encoding.Borsh, networkId: "testnet-10" });
  await pc.connect({ timeoutDuration: 8000 });
  const si = await pc.getServerInfo();
  const d1 = BigInt((await pc.getBlockDagInfo()).virtualDaaScore);
  await new Promise((r) => setTimeout(r, 3000));
  const d2 = BigInt((await pc.getBlockDagInfo()).virtualDaaScore);
  try { await pc.disconnect(); } catch {}
  if (si.networkId !== "testnet-10" || !si.isSynced || !si.hasUtxoIndex || d2 <= d1) { log("HELD mini-not-synced"); process.exit(3); }
  log("GATE open-file on origin, node synced, daa moving");
  if (originText("logs/MINI-ARMED.md") == null) {
    gitOnce(["checkout", "main"]);
    const ff = gitOnce(["merge", "--ff-only", "origin/main"]);
    if (ff.status !== 0) { log("HELD git-ff " + clean(ff.text)); process.exit(3); }
    fs.mkdirSync(REPO + "/logs", { recursive: true });
    fs.writeFileSync(REPO + "/logs/MINI-ARMED.md", "MINI_ARMED " + iso(Date.now()) + "\n");
    if (!commitAndPush("logs/MINI-ARMED.md")) { log("HELD armed-push-failed"); process.exit(3); }
    log("PUBLISHED logs/MINI-ARMED.md");
  } else log("MINI-ARMED already on origin");
}
await refreshHashes();
if (!families.length) { log("HELD no-sixteen-hashes"); process.exit(3); }
await connect();

let lastHash = 0;
let lastPub = 0;
let lastResource = "";
let lastStallLog = 0;
const timer = setInterval(() => {
  const now = Date.now();
  if (!connected && !connecting) connect();
  const closing = minuteKey(now - 5000);
  if (state.open && state.open[closing] && !state.open[closing].daa && now >= Date.parse(closing + ":00Z") + 55000) {
    sampleNode(closing).catch(() => {});
  }
  closeMinutes();
  if (connected && now - lastBeat > 20000) {
    noteBad(now);
    if (now - lastStallLog > 60000) { lastStallLog = now; log("read stall"); }
  }
  if (lastResource !== minuteKey(now - 60000) && now - (Math.floor(now / 60000) * 60000) > 5000) {
    lastResource = minuteKey(now - 60000);
    sampleResources(lastResource);
  }
  if (now - lastHash > 30000) { lastHash = now; refreshHashes().catch(() => {}); }
  if (now - lastPub > 20000) { lastPub = now; publishReady().catch((e) => log("publish err " + clean(e.message || e))); }
  if (state.tailUntil && now >= state.tailUntil) {
    clearInterval(timer);
    saveState();
    log("RUNNER end");
    process.exit(0);
  }
  saveState();
}, 5000);
setInterval(() => { DD.prune(); log("HEARTBEAT connected=" + (connected ? 1 : 0) + " dedupe_ids=" + DD.acc.size + " dup_skipped=" + DD.dupSkipped + " removed_tx=" + DD.removedTx + " late_removals=" + lateRemovals); }, 60000);
