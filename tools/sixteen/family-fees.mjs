// family-fees.mjs: pre-run 9's hop fee and submit path per family. Five cohorts around the payments' 150 sompi per gram.
// rusty-kaspa v2.1.0 (01b532e) weights a ready transaction by (fee/mass)^3 once the ready set is over one block's mass, so
// against 150 the relative weights are 100: 0.30, 200: 2.4, 300: 8, 1000: 296. A hop is only a candidate when its parent
// has left the mempool (a chained hop waits).
//   floor          families 1-4    100   desk private node (under the payments)
//   double         families 5-7    200   desk private node
//   triple         families 8-10   300   desk private node
//   triple-pub     families 11-13  300   the kept public kaspads, the same nodes the payments use (path, not fee)
//   high           families 14-16  1000  desk private node (far above)
// Payments pay 150. Genesis (built once by hash-sixteen.mjs) stays at 200. The builder takes any rate of 100 or more.
// Pre-run 8 ran 1-6 at 100, 7-11 at 200, 12-16 at 300, all on the desk's private node.
export const FLOOR_RATE = 100;
export const DOUBLE_RATE = 200;
export const TRIPLE_RATE = 300;
export const HIGH_RATE = 1000;
export const PAY_RATE = 150;
export const GENESIS_RATE = 200;
export const TIERS = [
  { cohort: "floor", rate: FLOOR_RATE, from: 1, to: 4, path: "desk" },
  { cohort: "double", rate: DOUBLE_RATE, from: 5, to: 7, path: "desk" },
  { cohort: "triple", rate: TRIPLE_RATE, from: 8, to: 10, path: "desk" },
  { cohort: "triple-pub", rate: TRIPLE_RATE, from: 11, to: 13, path: "public" },
  { cohort: "high", rate: HIGH_RATE, from: 14, to: 16, path: "desk" },
];
export const COHORTS = TIERS.map((t) => t.cohort);
function tierOf(family) {
  const f = Number(family);
  const t = Number.isInteger(f) ? TIERS.find((x) => f >= x.from && f <= x.to) : null;
  if (!t) throw new Error("family " + family + " is not 1..16");
  return t;
}
export const familyRate = (family) => tierOf(family).rate;
export const cohortOfFamily = (family) => tierOf(family).cohort;
export const pathOfFamily = (family) => tierOf(family).path;
export const PUBLIC_FAMILIES = TIERS.filter((t) => t.path === "public").flatMap((t) => Array.from({ length: t.to - t.from + 1 }, (_, i) => t.from + i));
// Two cohorts share 300; the rate alone does not name a cohort. Kept for old callers: the first cohort at that rate.
export const cohortOfRate = (rate) => (TIERS.find((t) => t.rate === Number(rate)) || {}).cohort || null;
export const FEE_SPLIT_LINE = TIERS.map((t) => `${t.cohort}=${t.from}-${t.to}:${t.rate}@${t.path}`).join(" ");
// The family list in a run config must say the same rates. Returns [] when it does, else the families that differ.
export function feeTableMisses(families) {
  return (families || []).filter((f) => Number(f.fee_sompi_per_gram) !== familyRate(f.family)).map((f) => Number(f.family));
}
// The one hop line for the builder: the rate rides on each hop, so one builder process carries every tier.
export const hopLine = (key, coin, nonce, family) => `hop ${key} ${coin.txid} ${coin.index} ${coin.amount} ${nonce} ${familyRate(family)}`;
