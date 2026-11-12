import assert from "node:assert/strict";
import { Dedupe } from "./mini-dedupe.mjs";
// A counting model that mirrors mini-runner's use: per minute non-coinbase and per-family hops.
const counts = new Map(); const add = (k, f, d) => { const r = counts.get(k) || { n: 0, f: {} }; r.n += d; if (f) r.f[f] = (r.f[f] || 0) + d; counts.set(k, r); };
const d = new Dedupe();
function chain({ removed = [], added = [] }) {
  for (const b of removed) for (const e of d.remove(b)) { add(e.key, e.digests[0], -e.nonCb); }
  for (const [block, key, ids] of added) for (const [id, fam] of ids) { if (!d.accept(id, block, key)) continue; add(key, fam, 1); d.note(id, 1, fam ? [fam] : []); }
}
chain({ added: [["A", "m1", [["t1", "f1"], ["t2", null]]]] });
chain({ added: [["B", "m1", [["t3", null]]]] });
assert.equal(counts.get("m1").n, 3);
// reorg: A removed, its ids accepted again by C (the pre-run 8 Mini double count)
chain({ removed: ["A"], added: [["C", "m1", [["t1", "f1"], ["t2", null]]]] });
assert.equal(counts.get("m1").n, 3, "t1,t2 counted once after re-acceptance"); assert.equal(counts.get("m1").f.f1, 1);
// the same notification delivered twice / an id seen in two live groups: counted once
chain({ added: [["D", "m2", [["t3", null], ["t4", "f2"]]]] });
assert.equal(counts.get("m1").n, 3); assert.equal(counts.get("m2").n, 1); assert.equal(d.dupSkipped, 1);
// re-accepted into another minute: moves, not doubled
chain({ removed: ["D"], added: [["E", "m3", [["t4", "f2"]]]] });
assert.equal(counts.get("m2").n, 0); assert.equal(counts.get("m2").f.f2, 0); assert.equal(counts.get("m3").n, 1); assert.equal(counts.get("m3").f.f2, 1);
// removing a block that never counted anything is a no-op
assert.deepEqual(d.remove("zzz"), []);
const tot = [...counts.values()].reduce((a, r) => a + r.n, 0); assert.equal(tot, 4, "t1..t4 once each");
console.log(JSON.stringify({ ok: 1, total: tot, dup_skipped: d.dupSkipped, removed_tx: d.removedTx, removed_blocks: d.removedBlocks }));
