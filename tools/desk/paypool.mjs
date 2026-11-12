// paypool.mjs: pre-run 7 payment-pool helpers (pre-run 6's, plus lock line (ii)). Pure functions plus read-only node views. TESTNET-10 ONLY.
// Pre-run 6's lesson (locks/LOCKED.md, b616d11): a restarted payment sender took its pool from the confirmed UTXO set
// while its payment chains were still in the mempool, so it re-picked coins that were already spent and missed the
// unconfirmed change; and the split across senders was assumed even, not checked (one lane got 1 coin, the other 1,999).
// Pre-run 6:
//   - a coin is free only if it is NOT spent by any mempool transaction seen on the desk node or the sender's node, and it
//     is either a confirmed UTXO or an unspent output of one of our mempool transactions (an unconfirmed chain tip);
//   - each sender writes its exact in-memory pool to a private handoff file when the runner asks it to hand off, and a
//     snapshot every few seconds; a restart reads that pool, drops what the node now shows as spent, and keeps fresh tips;
//   - the runner merges every lane's handoff with the node's free set, then deals the coins round-robin over the lanes in
//     outpoint order, so every lane gets the same count (+-1). The split is checked and logged after every load.
// Never logs an id, txid, address, key, host, or port. Coin files stay in the private run folder, never in git.
import fs from "node:fs";

export const MIN_SOMPI = 1_000_000_000n;          // 10 tKAS: below this a payment coin is not used
export const MAX_SOMPI = 10_000_000_000_000n;     // 100,000 tKAS: never spent
export const TIP_GRACE_MS = 90_000;               // a tip we made in the last 90 s may not have reached the desk node yet
export const op = (c) => `${c.outpoint.transactionId}:${c.outpoint.index}`;
const big = (x) => (typeof x === "bigint" ? x : BigInt(String(x).replace(/n$/, "")));
const spkOf = (s) => (typeof s === "string" ? { version: 0, script: s.length > 4 && /^0000/.test(s) && s.length % 2 === 0 ? s.slice(4) : s } : { version: Number(s?.version || 0), script: String(s?.script || "") });

// plain, JSON-safe coin <-> the IUtxoEntry shape createTransaction takes
export function toRow(c, made = 0) { return { o: c.outpoint.transactionId, i: Number(c.outpoint.index), a: big(c.amount).toString(), v: Number(c.scriptPublicKey?.version || 0), s: String(c.scriptPublicKey?.script || ""), d: big(c.blockDaaScore || 0n).toString(), t: made || c.t || 0 }; }
export function fromRow(r, address) { return { address, outpoint: { transactionId: r.o, index: r.i }, amount: BigInt(r.a), scriptPublicKey: { version: r.v, script: r.s }, blockDaaScore: BigInt(r.d || "0"), isCoinbase: false, t: r.t || 0 }; }
export function plain(e, address) { return { address, outpoint: { transactionId: String(e.outpoint.transactionId), index: Number(e.outpoint.index) }, amount: big(e.amount), scriptPublicKey: spkOf(e.scriptPublicKey), blockDaaScore: big(e.blockDaaScore || 0n), isCoinbase: !!e.isCoinbase, t: 0 }; }
export const usable = (c) => !c.isCoinbase && c.amount > MIN_SOMPI && c.amount < MAX_SOMPI;

// Atomic write (Windows: a reader holding the file makes rename fail; retry, then write in place).
export function writeCoins(file, coins, meta = {}) {
  const body = JSON.stringify({ ...meta, at: Date.now(), n: coins.length, coins: coins.map((c) => toRow(c)) });
  const t = file + ".tmp"; fs.writeFileSync(t, body);
  for (let i = 0; i < 50; i++) { try { fs.renameSync(t, file); return; } catch { const u = Date.now() + 2; while (Date.now() < u); } }
  fs.writeFileSync(file, body);
}
export function readCoins(file, address) {
  try { const j = JSON.parse(fs.readFileSync(file, "utf8")); return { ...j, coins: (j.coins || []).map((r) => fromRow(r, address)) }; } catch { return null; }
}

// The node view for one address: confirmed UTXOs, the outpoints our mempool transactions spend, and the unspent outputs of
// our mempool transactions (chain tips). rpcs: the desk node first, then any public node the payments went to.
export async function nodeView(rpcs, address, to, ms = 60000, spkHint = null) {
  const confirmed = new Map(); const spent = new Set(); const outs = new Map(); let read = 0, mempoolRead = 0;
  let spk = spkHint ? spkOf(spkHint) : null;
  for (const [i, r] of rpcs.entries()) {
    if (i === 0) {
      const bag = await to(r.getUtxosByAddresses({ addresses: [address] }), ms);
      for (const e of bag.entries || []) { const c = plain(e, address); confirmed.set(op(c), c); spk ||= c.scriptPublicKey; }
      read++;
    }
    try {
      const m = await to(r.getMempoolEntriesByAddresses({ addresses: [address], includeOrphanPool: false, filterTransactionPool: false }), ms);
      for (const a of m.entries || []) {
        for (const x of a.sending || []) for (const inp of x.transaction?.inputs || []) spent.add(`${inp.previousOutpoint.transactionId}:${inp.previousOutpoint.index}`);
        for (const x of a.receiving || []) {
          const tx = x.transaction; const id = tx?.verboseData?.transactionId || tx?.id; if (!id) continue;
          (tx.outputs || []).forEach((o, idx) => {
            const to_ = o.verboseData?.scriptPublicKeyAddress; if (to_ && String(to_) !== String(address)) return;
            outs.set(`${id}:${idx}`, { address, outpoint: { transactionId: String(id), index: idx }, amount: big(o.value), scriptPublicKey: null, blockDaaScore: 0n, isCoinbase: false, t: Date.now() });
          });
        }
      }
      mempoolRead++;
    } catch { /* a node whose mempool cannot be read adds nothing; the desk read is required below */ }
  }
  if (!mempoolRead) throw new Error("mempool unread");
  for (const c of outs.values()) c.scriptPublicKey = spk;   // every coin of this key has the one script
  return { confirmed, spent, outs, spk, read, mempoolRead };
}
// Coins the view says are free now.
export function freeOf(view) {
  const m = new Map();
  for (const [k, c] of view.confirmed) if (!view.spent.has(k) && usable(c)) m.set(k, c);
  for (const [k, c] of view.outs) if (!view.spent.has(k) && !m.has(k) && c.scriptPublicKey && usable(c)) m.set(k, c);
  return m;
}
// Check a handed-off pool against the view: spent coins are dropped; a coin the view does not know is kept only if it is
// a tip this sender made within TIP_GRACE_MS (it may not have reached the desk node yet).
// Pre-run 7, lock line (ii): with { truth: true } the coins are a handoff pool, the truth. The view only drops a coin it
// shows as spent by a mempool transaction (and a coin too small to use). A coin the view does not list is kept: a
// lagging or partial view never removes a handed-off coin, and the view never adds one.
export function validate(coins, view, now = Date.now(), opts = {}) {
  const keep = [], why = { spent: 0, gone: 0, small: 0, unlisted_kept: 0 };
  for (const c of coins) {
    const k = op(c);
    if (view.spent.has(k)) { why.spent++; continue; }
    if (!usable(c)) { why.small++; continue; }
    if (view.confirmed.has(k) || view.outs.has(k)) { keep.push(c); continue; }
    if (c.t && now - c.t < TIP_GRACE_MS) { keep.push(c); continue; }
    if (opts.truth) { why.unlisted_kept++; keep.push(c); continue; }
    why.gone++;
  }
  return { keep, why };
}
// Pre-run 7, lock line (ii): the deal never holds more coins than the preflight pile. First the handed-off coins (in
// outpoint order), then other coins, up to the cap. Returns { coins, cut }.
export function capToPile(first, rest, pile) {
  const m = new Map();
  const ord = (a) => [...new Map(a.map((c) => [op(c), c])).values()].sort((x, y) => (op(x) < op(y) ? -1 : op(x) > op(y) ? 1 : 0));
  for (const c of ord(first)) { if (m.size >= pile) break; m.set(op(c), c); }
  for (const c of ord(rest)) { if (m.size >= pile) break; if (!m.has(op(c))) m.set(op(c), c); }
  const all = new Set([...first, ...rest].map(op));
  return { coins: [...m.values()], cut: all.size - m.size };
}
// Fair deal: sort by outpoint, round-robin over n lanes. Every lane gets floor(N/n) or one more.
export function deal(coins, n) {
  const s = [...new Map(coins.map((c) => [op(c), c])).values()].sort((a, b) => (op(a) < op(b) ? -1 : op(a) > op(b) ? 1 : 0));
  const lanes = Array.from({ length: n }, () => []);
  s.forEach((c, i) => lanes[i % n].push(c));
  return lanes;
}
export function fairness(counts) {
  const min = Math.min(...counts), max = Math.max(...counts), mean = counts.reduce((a, b) => a + b, 0) / (counts.length || 1);
  return { min, max, mean: Math.round(mean), fair: counts.length > 0 && min > 0 && max - min <= Math.max(2, Math.ceil(mean * 0.1)) };
}
