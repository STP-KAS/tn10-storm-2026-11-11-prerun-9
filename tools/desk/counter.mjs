// Pre-run 9 inclusion counter: pre-run 8's, with hops sorted by cohort (family-fees.mjs; two cohorts share 300, so the
// family on the submit row names the cohort, not the rate). Pre-run 8 header follows.
// Pre-run 8 inclusion counter. TESTNET-10 ONLY. Read-only: it submits nothing, holds no key, and writes no id to git.
// One process, started detached by the desk runner, on the desk's private TN10 node (stp, 2026-11-11 23:20 local: the
// desk's own node counts). It counts what the chain ACCEPTED, per minute, by the accepting chain block's header time:
//   - getVirtualChainFromBlock(includeAcceptedTransactionIds) from the node's sink, polled; a removed chain block takes
//     its counts back out of its minute (reorg), an added one puts them in.
//   - each accepted id is put in one bucket: our payments (ids the payment senders logged after a submit-OK, as a
//     52-bit prefix), our families by fee tier (ids from the family sender's submit rows, by the rate on the row),
//     coinbase (one per merged blue block: on this node the chain block's group carries the coinbase of each blue in its
//     mergeset and not its own), and other traffic (the rest).
//   - a minute is final when the counter has read a chain block at least FINAL_S seconds after the minute's end.
// Lag, every SAMPLE_S seconds: the desk node's virtual DAA against a kept public kaspad's, and the desk sink's header age.
// A minute is marked lag=1 if, in that minute, the DAA gap went over GAP_DAA, the sink age over SINK_MS, the counter read
// nothing for READ_MS, or the reference node was unread in every sample (lag=unverified). A minute that finalised more
// than LATE_S after its end is marked late. A minute the counter did not read in full (start, a gap, or a restart of the
// read from a fresh sink) is partial=1. A count is never filled in.
// Files (run folder): logs/chain-minute.log (one line per final minute; a later reorg writes the minute again with
// adjust=1), logs/chain-lag.log (one line per sample), logs/counter.log, private/counter-totals.json.
// Stop: control/COUNTER-STOP. Env: STORM_CONFIG, STORM_KIT. Args: --ref <local node number of a kept kaspad>
import fs from "node:fs";
import path from "node:path";
const KIT = process.env.STORM_KIT;
const { CFG, P, connect, to } = await import("file:///" + path.join(KIT, "lib.mjs").replace(/\\/g, "/"));
const { COHORTS, cohortOfFamily } = await import("file:///" + path.join(KIT, "family-fees.mjs").replace(/\\/g, "/"));
const HK = COHORTS.map((c) => "h_" + c);   // per-cohort hop keys
const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf("--" + n); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const FINAL_S = Number(process.env.STORM_COUNT_FINAL_S || 15), LATE_S = Number(process.env.STORM_COUNT_LATE_S || 90);
const GAP_DAA = Number(process.env.STORM_COUNT_GAP_DAA || 100), SINK_MS = Number(process.env.STORM_COUNT_SINK_MS || 30000);
const READ_MS = Number(process.env.STORM_COUNT_READ_MS || 20000), SAMPLE_S = Number(process.env.STORM_COUNT_SAMPLE_S || 10);
const POLL_MS = Number(process.env.STORM_COUNT_POLL_MS || 1000), CLASSIFY_DELAY_MS = 4000;
const isoZ = (ms = Date.now()) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");
const mkey = (ms) => new Date(ms).toISOString().slice(0, 16);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const LOG = P("logs", "counter.log"), MIN = P("logs", "chain-minute.log"), LAG = P("logs", "chain-lag.log");
const log = (s) => fs.appendFileSync(LOG, isoZ() + " " + String(s).replace(/wss?:\/\/\S+/g, "<url>").replace(/\b[0-9a-f]{64}\b/gi, "<h>").slice(0, 300) + "\n");
const STOP = P("control", "COUNTER-STOP");
const kept = JSON.parse(fs.readFileSync(P("private", "nodes.json"), "utf8"));
const REFN = Number(arg("ref", kept[0]?.n)); const ref = kept.find((x) => x.n === REFN) || kept[0];
const pre = (hex) => parseInt(String(hex).slice(0, 13), 16);   // 52-bit prefix; a Number, so the sets stay small
const norm = (h) => String(h).replace(/^0x/, "").toLowerCase();

// ---- our ids ---------------------------------------------------------------------------------------------------
const payIds = new Set(); const famCoh = new Map(); const offs = new Map();
function tail(file, onLine) {
  if (!fs.existsSync(file)) return;
  const st = fs.statSync(file); const off = offs.get(file) || 0; if (st.size <= off) return;
  const fd = fs.openSync(file, "r"); const buf = Buffer.alloc(st.size - off); fs.readSync(fd, buf, 0, buf.length, off); fs.closeSync(fd);
  const text = buf.toString("utf8"); const cut = text.lastIndexOf("\n"); if (cut < 0) return;
  offs.set(file, off + Buffer.byteLength(text.slice(0, cut + 1)));
  for (const l of text.slice(0, cut).split("\n")) if (l) onLine(l);
}
function readOurs() {
  for (const f of fs.readdirSync(P("private"))) if (/^paytx-[\d.]+\.txt$/.test(f)) tail(P("private", f), (l) => { const v = pre(l.trim()); if (Number.isFinite(v)) payIds.add(v); });
  tail(P("private", "submit-fam.jsonl"), (l) => { try { const r = JSON.parse(l); if (r.result === "ok" && r.txid) famCoh.set(pre(norm(r.txid)), "h_" + cohortOfFamily(r.family)); } catch {} });
}

// ---- minutes ---------------------------------------------------------------------------------------------------
const minutes = new Map();   // key -> rec
const blank = () => ({ blocks: 0, acc: 0, cb: 0, pay: 0, ...Object.fromEntries(HK.map((k) => [k, 0])), fx: 0, other: 0, gapMax: null, sinkAgeMax: null, refUnread: 0, samples: 0, noRead: 0, partial: 0, final: 0, finalAt: 0, adjust: 0 });
const rec = (key) => { if (!minutes.has(key)) minutes.set(key, blank()); return minutes.get(key); };
const blocks = new Map();    // chain block hash -> { key, counts }
const START = Date.now(); rec(mkey(START)).partial = 1;
const CK = ["acc", "cb", "pay", ...HK, "fx", "other"];
function add(key, c, sign) { const r = rec(key); for (const k of CK) r[k] += sign * c[k]; r.blocks += sign; if (r.final) r.adjust = 1; }
function classify(ids, blues) {
  const c = { acc: ids.length, cb: Math.min(blues, ids.length), pay: 0, ...Object.fromEntries(HK.map((k) => [k, 0])), fx: 0, other: 0 };
  for (const id of ids) { const p = pre(norm(id)); if (payIds.has(p)) c.pay++; else if (famCoh.has(p)) { const k = famCoh.get(p); if (k in c) c[k]++; else c.fx++; } }
  c.other = Math.max(0, c.acc - c.cb - c.pay - HK.reduce((a, k) => a + c[k], 0) - c.fx);
  return c;
}
let lastChainTs = 0, lastReadMs = Date.now();
const line = (key, r) => `${key}Z final=${r.final} acc=${r.acc} cb=${r.cb} pay=${r.pay} ${HK.map((k) => k + "=" + r[k]).join(" ")} fx=${r.fx} other=${r.other} chain_blocks=${r.blocks} gap_max=${r.gapMax ?? "-"} sink_age_max_ms=${r.sinkAgeMax ?? "-"} ref_unread=${r.refUnread}/${r.samples} late_s=${r.finalAt ? Math.round((r.finalAt - Date.parse(key + ":00Z") - 60000) / 1000) : "-"} lag=${lagOf(r)} partial=${r.partial ? 1 : 0}${r.adjust ? " adjust=1" : ""}`;
function lagOf(r) {
  if ((r.gapMax ?? 0) > GAP_DAA || (r.sinkAgeMax ?? 0) > SINK_MS || r.noRead) return "1";
  if (r.samples && r.refUnread === r.samples) return "unverified";
  if (!r.samples) return "unsampled";
  return "0";
}
function finalise() {
  for (const [key, r] of minutes) {
    const end = Date.parse(key + ":00Z") + 60000;
    if (!r.final && lastChainTs >= end + FINAL_S * 1000) { r.final = 1; r.finalAt = Date.now(); if (r.finalAt - end > LATE_S * 1000) r.late = 1; fs.appendFileSync(MIN, line(key, r) + "\n"); }
    else if (r.final && r.adjust) { fs.appendFileSync(MIN, line(key, r) + "\n"); r.adjust = 0; }
  }
}

// ---- read loop -------------------------------------------------------------------------------------------------
let rpc = await connect(CFG.main_node_url, 4);
let sink = norm((await to(rpc.getBlockDagInfo(), 10000)).sink);
log(`COUNTER_START pid=${process.pid} node=desk-private ref=${ref ? ref.n : "-"} final_s=${FINAL_S} gap_daa=${GAP_DAA} sink_ms=${SINK_MS}`);
const hdr = new Map();
async function header(h) {
  if (hdr.has(h)) return hdr.get(h);
  const b = await to(rpc.getBlock({ hash: h, includeTransactions: false }), 10000);
  const v = { ts: Number(b.block.header.timestamp), blues: (b.block.verboseData?.mergeSetBluesHashes || []).length };
  hdr.set(h, v); if (hdr.size > 50000) { let n = 0; for (const k of hdr.keys()) { hdr.delete(k); if (++n > 20000) break; } }
  return v;
}
const queue = [];   // { h, ids, seen }
async function pull() {
  const r = await to(rpc.getVirtualChainFromBlock({ startHash: sink, includeAcceptedTransactionIds: true }), 30000);
  lastReadMs = Date.now();
  for (const h0 of r.removedChainBlockHashes || []) { const h = norm(h0); const b = blocks.get(h); if (b) { add(b.key, b.c, -1); blocks.delete(h); log(`REORG removed chain block from ${b.key}Z`); } else { const i = queue.findIndex((q) => q.h === h); if (i >= 0) { queue.splice(i, 1); log("REORG removed chain block before it was counted"); } } }
  const groups = r.acceptedTransactionIds || [];
  const byHash = new Map(groups.map((g) => [norm(g.acceptingBlockHash), g.acceptedTransactionIds || []]));
  const added = (r.addedChainBlockHashes || []).map(norm);
  for (let i = 0; i < added.length; i += 16) await Promise.all(added.slice(i, i + 16).map((h) => header(h).catch(() => null)));
  for (const h of added) queue.push({ h, ids: byHash.get(h) || [], seen: Date.now() });
  if (added.length) sink = added[added.length - 1];
}
async function drain() {
  readOurs();
  const cut = Date.now() - CLASSIFY_DELAY_MS;   // the senders log an id after its submit; a short wait lets the log catch up
  while (queue.length && queue[0].seen <= cut) {
    const q = queue.shift(); let hv = null;
    try { hv = await header(q.h); } catch {}
    if (!hv) { const r = rec(mkey(Date.now())); r.partial = 1; log("HEADER unread; minute partial"); continue; }
    const key = mkey(hv.ts); const c = classify(q.ids, hv.blues);
    if (key < mkey(START)) rec(key).partial = 1;
    if (rec(key).final) rec(key).adjust = 1;
    add(key, c, +1); blocks.set(q.h, { key, c });
    if (hv.ts > lastChainTs) lastChainTs = hv.ts;
  }
  if (blocks.size > 40000) { const keep = Date.now() - 30 * 60000; for (const [h, b] of blocks) { if (Date.parse(b.key + ":00Z") < keep) blocks.delete(h); if (blocks.size < 30000) break; } }
}
let refRpc = null;
async function sample() {
  const key = mkey(Date.now()); const r = rec(key); r.samples++;
  let dd = null, sinkAge = null, rd = null;
  try { const d = await to(rpc.getBlockDagInfo(), 8000); dd = Number(d.virtualDaaScore); const hv = await header(norm(d.sink)); sinkAge = Date.now() - hv.ts; } catch {}
  try { if (!refRpc && ref) refRpc = await connect(ref.url, 2); rd = Number((await to(refRpc.getBlockDagInfo(), 8000)).virtualDaaScore); } catch { refRpc = null; }
  const gap = dd != null && rd != null ? rd - dd : null;
  if (rd == null) r.refUnread++;
  if (gap != null) r.gapMax = Math.max(r.gapMax ?? -1e9, gap);
  if (sinkAge != null) r.sinkAgeMax = Math.max(r.sinkAgeMax ?? 0, sinkAge);
  if (dd == null) r.noRead = 1;
  if (Date.now() - lastReadMs > READ_MS) r.noRead = 1;
  fs.appendFileSync(LAG, `${isoZ()} desk_daa=${dd ?? "-"} ref_daa=${rd ?? "-"} gap=${gap ?? "-"} sink_age_ms=${sinkAge ?? "-"} queue=${queue.length} chain_ts_behind_ms=${lastChainTs ? Date.now() - lastChainTs : "-"} pay_ids=${payIds.size} fam_ids=${famCoh.size}\n`);
}
function totals() {
  const t = { at: isoZ(), pay_ids_logged: payIds.size, fam_ids_logged: famCoh.size, minutes: minutes.size };
  for (const k of CK) t[k] = [...minutes.values()].reduce((a, r) => a + r[k], 0);
  fs.writeFileSync(P("private", "counter-totals.json"), JSON.stringify(t));
}
let nextSample = 0, fails = 0;
while (!fs.existsSync(STOP)) {
  const t0 = Date.now();
  try { await pull(); fails = 0; }
  catch (e) {
    fails++; log("PULL fail " + (e?.message || e));
    if (fails >= 3) {   // reconnect; if the start hash is gone, read again from a fresh sink and mark the gap
      try { try { await rpc.disconnect(); } catch {} rpc = await connect(CFG.main_node_url, 3); } catch {}
      try { const r2 = await to(rpc.getVirtualChainFromBlock({ startHash: sink, includeAcceptedTransactionIds: false }), 30000); void r2; }
      catch { try { sink = norm((await to(rpc.getBlockDagInfo(), 10000)).sink); rec(mkey(Date.now())).partial = 1; log("RESTART_READ from a fresh sink; this minute is partial"); } catch {} }
      fails = 0;
    }
  }
  try { await drain(); } catch (e) { log("DRAIN fail " + (e?.message || e)); }
  if (Date.now() >= nextSample) { nextSample = Date.now() + SAMPLE_S * 1000; await sample().catch(() => {}); totals(); }
  finalise();
  const w = POLL_MS - (Date.now() - t0); if (w > 0) await sleep(w);
}
await drain().catch(() => {}); finalise(); totals();
for (const [key, r] of minutes) if (!r.final) { r.partial = 1; fs.appendFileSync(MIN, line(key, r).replace("final=0", "final=0 open_at_stop=1") + "\n"); }
log("COUNTER_STOP");
try { await rpc.disconnect(); } catch {} try { await refRpc?.disconnect(); } catch {}
process.exit(0);
