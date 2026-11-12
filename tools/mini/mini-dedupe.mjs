// mini-dedupe.mjs (pre-run 9): Mini's counter keys an accepted transaction by its id, not by block and id, and a removed
// chain block takes its transactions back out. Pre-run 8's Mini counted a transaction once per accepting block, so a
// transaction accepted, removed with its chain block, and accepted again was counted twice. Pure bookkeeping, no I/O.
export class Dedupe {
  constructor(maxAgeMs = 30 * 60000) { this.acc = new Map(); this.byBlock = new Map(); this.maxAgeMs = maxAgeMs; this.dupSkipped = 0; this.removedTx = 0; this.removedBlocks = 0; }
  // true when this id is new (count it); false when a live chain block already accepted it (skip).
  accept(txid, block, key, now = Date.now()) {
    if (this.acc.has(txid)) { this.dupSkipped++; return false; }
    const e = { block, key, at: now, nonCb: 0, digests: [] };
    this.acc.set(txid, e);
    if (!this.byBlock.has(block)) this.byBlock.set(block, []);
    this.byBlock.get(block).push(txid);
    return true;
  }
  note(txid, nonCb, digests) { const e = this.acc.get(txid); if (e) { e.nonCb = nonCb; e.digests = digests || []; } }
  // A removed chain block: returns the entries it had counted ({ txid, key, nonCb, digests }), which the caller takes out.
  remove(block) {
    const ids = this.byBlock.get(block); if (!ids) return [];
    this.byBlock.delete(block); this.removedBlocks++;
    const out = [];
    for (const txid of ids) { const e = this.acc.get(txid); if (e && e.block === block) { this.acc.delete(txid); out.push({ txid, ...e }); this.removedTx++; } }
    return out;
  }
  prune(now = Date.now()) {
    if (this.acc.size < 200000) return;
    for (const [txid, e] of this.acc) { if (now - e.at > this.maxAgeMs) { this.acc.delete(txid); const l = this.byBlock.get(e.block); if (l) { const i = l.indexOf(txid); if (i >= 0) l.splice(i, 1); if (!l.length) this.byBlock.delete(e.block); } } }
  }
}
