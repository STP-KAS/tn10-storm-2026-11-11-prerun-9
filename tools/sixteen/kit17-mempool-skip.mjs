// mempool-skip.mjs (kit17, pre-run 7, lock line (i)). The family sender's node mempool line.
// Pre-run 6: kit16 set a one-way skip at a mempool of 90,000 or more (NODE_SKIP reason=mempool_90k) and never cleared it,
// so all sixteen families stopped for the rest of the run. kit17:
//   - line = CFG.family_mempool_skip_line (default 90000). 0 means the skip does not apply to the family sender at all
//     (pre-run 7's live setting: the families keep attempting under any mempool; a full mempool shows as a mempool_full reject).
//   - with a line > 0 the skip clears as soon as the mempool reads under the line again (NODE_SKIP_CLEAR), and each skip
//     is logged with its reason so the desk runner marks every minute it covers as dirt (node-skip-fam:<reason>).
//   - at or over 90,000 a data mark is logged once per crossing (NODE_MEMPOOL_HIGH / NODE_MEMPOOL_BACK). It is not dirt.
export function mempoolSkip(label, line, phase, highLine = 90000) {
  let skipped = false, high = false;
  return {
    get skipped() { return skipped; },
    read(size) {
      const mp = Number(size);
      if (!Number.isFinite(mp)) return skipped;
      if (!high && mp >= highLine) { high = true; phase(`NODE_MEMPOOL_HIGH node=${label} mempool=${mp}`); }
      else if (high && mp < highLine) { high = false; phase(`NODE_MEMPOOL_BACK node=${label} mempool=${mp}`); }
      if (line > 0) {
        if (!skipped && mp >= line) { skipped = true; phase(`NODE_SKIP node=${label} reason=mempool_${Math.round(line / 1000)}k mempool=${mp}`); }
        else if (skipped && mp < line) { skipped = false; phase(`NODE_SKIP_CLEAR node=${label} mempool=${mp}`); }
      }
      return skipped;
    },
  };
}
