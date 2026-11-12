// Pre-run 8 payment process (pre-run 7's, plus one line: each submit-OK id is logged for the desk's inclusion counter).
// Pre-run 7 payment process. STORM_PAY_PER_NODE of these per kept public node (unique kaspad), each with its own
// connection and its own lane of coins (lock line (iii): the HOLD-3 limit moved from coins to node submit loops, so the
// load is spread over more processes per kaspad). Key 16, fee 150 sompi per gram. Counts only.
// Args: --slot i --of N   (sender i of private/senders.json; each row names its sender id, its node, and the node url)
// Rate: control/PAY-RATE is the desk total; this process sends its even share, paced on the clock (a loop that takes a
// little over a second still sends share per second, not share per loop). Pre-run 7: a slow loop may catch up to
// STORM_PAY_CATCHUP (default 3) times the share in one batch; pre-run 6's 1.25x cap held HOLD-3 at 1,900 per 2-second loop.
// Each paid coin's change output is re-used at once (spends a mempool parent; never an orphan).
// Pre-run 6 pool rules (locks/LOCKED.md, pre-run 6 lesson; tools/desk/paypool.mjs):
//   - The pool comes from the lane file the runner wrote for this slot (an even deal of the free coins), checked against the
//     node view: a coin spent by a mempool transaction is dropped, an unconfirmed tip of ours is a coin. It is never taken
//     from the confirmed UTXO list alone. Without a lane file: this slot's last snapshot, checked the same way; without
//     that, this slot's deal of the node's free set.
//   - A coin is out of the pool while its payment is in flight. It comes back only as its change tip (OK), or as itself
//     (mempool full, or an rpc error that does not show it spent).
//   - control/PAY-HANDOFF-<n> (or PAY-HANDOFF): finish the batch in flight, write the exact pool to the private handoff
//     file, log PAY_HANDOFF, exit. The runner's repair uses this instead of killing the sender, so no tip is lost.
//   - A snapshot of the pool is written every 5 s, so a crash leaves a pool to check.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const KIT = process.env.STORM_KIT;
const { CFG, to, connect, P, phase, reason, massOf, sleep, END, STOPF } = await import("file:///" + KIT.replace(/\\/g, "/") + "/lib.mjs");
const { keyAddress } = await import("file:///" + KIT.replace(/\\/g, "/") + "/covenant.mjs");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PP = await import("file:///" + path.join(HERE, "paypool.mjs").replace(/\\/g, "/"));
const require = createRequire(import.meta.url);
const k = require(CFG.kaspa_sdk);
const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i > 0 ? process.argv[i + 1] : d; };
const SLOT = Number(arg("slot")), OF = Number(arg("of"));
const senders = JSON.parse(fs.readFileSync(P("private", "senders.json"), "utf8"));
const ME = senders[SLOT];
const NODE = ME.url;
const NN = ME.n;                           // local node number for the logs
const SID = ME.id;                         // sender id: <node>.<k>
const CATCH = Number(process.env.STORM_PAY_CATCHUP || 3);
const KEY = 16, FEE_RATE = 150n;
const lines = fs.readFileSync(CFG.keys_file, "utf8").trim().split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
const pk = new k.PrivateKey(lines[KEY]);
const addr = keyAddress(KEY);
let rpc = await connect(NODE, 4);
const lrpc = await connect(CFG.main_node_url, 4);   // lane check and pool view on the desk node
phase(`PAY_START sender=${SID} node=${NN} of=${OF} key=16 fee=150 catchup=${CATCH}`);
const op = PP.op;
const used = new Map();   // outpoint -> ms: a coin this process spent or saw rejected is not reloaded for 120 s
const LANE = P("private", `pool-${SID}.json`), SNAP = P("private", `pool-${SID}.snap.json`), HAND = P("private", `pool-${SID}.handoff.json`);
let pool = [];
// Pre-run 8: the desk counter (counter.mjs) tells our payments from other traffic by these ids. Private run folder only,
// a 13-hex prefix per line, written once per batch. Never in git.
const PAYTX = P("private", `paytx-${SID}.txt`); let paybuf = [];
const flushIds = () => { if (paybuf.length) { try { fs.appendFileSync(PAYTX, paybuf.join("\n") + "\n"); } catch {} paybuf = []; } };
async function view() { return PP.nodeView([lrpc, rpc], addr, to, 60000); }
async function load(first) {
  const v = await view(); const now = Date.now();
  for (const [o, t] of used) if (now - t > 120000) used.delete(o);
  let src = "node", cand = null, truth = false;
  if (first) {
    const lane = PP.readCoins(LANE, addr);
    if (lane && lane.slot === SLOT && lane.of === OF && now - lane.at < 15 * 60000) { src = "lane"; cand = lane.coins; truth = !!lane.truth; try { fs.renameSync(LANE, LANE + ".used"); } catch {} }
    else { const snap = PP.readCoins(SNAP, addr); if (snap && snap.coins.length) { src = "snap"; cand = snap.coins; } }
  }
  let why = { spent: 0, gone: 0, small: 0, unlisted_kept: 0 };
  if (cand) { const r = PP.validate(cand, v, now, { truth }); pool = r.keep.filter((c) => !used.has(op(c))); why = r.why; }   // (ii): a handoff lane is the truth
  if (!cand || !pool.length) { src = cand ? src + "+node" : "node"; pool = PP.deal([...PP.freeOf(v).values()].filter((c) => !used.has(op(c))), OF)[SLOT] || []; }
  phase(`PAY_POOL sender=${SID} node=${NN} n=${pool.length} from=${src}${truth ? "-truth" : ""} dropped_spent=${why.spent} dropped_gone=${why.gone} dropped_small=${why.small} unlisted_kept=${why.unlisted_kept || 0} free_seen=${PP.freeOf(v).size} mempool_spent_seen=${v.spent.size}`);
}
await load(true);
const rateFile = P("control", "PAY-RATE");
let minute = new Date().toISOString().slice(0, 16);
let ok = 0, attempts = 0, rateRej = 0, full = 0, other = 0, share = 0;
function roll(now) {
  const m = new Date(now).toISOString().slice(0, 16);
  if (m === minute) return;
  fs.appendFileSync(P("logs", `pay-minute-${SID}.log`), `${minute}Z sender=${SID} node=${NN} ok=${ok} attempts=${attempts} rate=${rateRej} full=${full} other=${other} share=${share} pool=${pool.length}\n`);
  minute = m; ok = 0; attempts = 0; rateRej = 0; full = 0; other = 0;
}
const payStop = P("control", "PAY-STOP");            // all payment senders (lane, runner)
const myStop = () => P("control", `PAY-STOP-${SID}`);  // this sender only (a rate reject)
const handoff = () => fs.existsSync(P("control", `PAY-HANDOFF-${SID}`)) || fs.existsSync(P("control", "PAY-HANDOFF"));
const bare = (c) => ({ address: c.address, outpoint: c.outpoint, amount: c.amount, scriptPublicKey: c.scriptPublicKey, blockDaaScore: c.blockDaaScore, isCoinbase: false });
let massMax = 0, massN = 0;
let recon = false, laneAt = 0, rateStopped = false, chain = true, fails = 0, snapAt = 0, last = 0, handed = false;
while (Date.now() < END && !fs.existsSync(STOPF) && !fs.existsSync(payStop) && !fs.existsSync(myStop())) {
  if (handoff()) { handed = true; break; }
  const now = Date.now();
  roll(now);
  if (now - snapAt > 5000) { snapAt = now; try { PP.writeCoins(SNAP, pool, { slot: SLOT, of: OF, node: NN, sender: SID }); } catch {} }
  if (now - laneAt > 30000) {
    laneAt = now;
    try {
      const bag = await to(lrpc.getUtxosByAddresses({ addresses: [keyAddress(0)] }), 30000);
      const coins = (bag.entries || []).filter((e) => !e.isCoinbase && BigInt(e.amount) > 300_000_000n);
      const usable = Math.round(coins.reduce((s, e) => s + Number(e.amount) - 3e8, 0) / 1e8);
      if (coins.length < 2500 || usable < 18000) { phase(`PAY_STOP sender=${SID} node=${NN} reason=lane`); fs.writeFileSync(payStop, "lane\n"); break; }
    } catch { phase(`PAY_LANE sender=${SID} node=${NN} unread`); }
  }
  let total = 0;
  try { total = Number(fs.readFileSync(rateFile, "utf8").trim()) || 0; } catch {}
  share = Math.floor(total / OF) + (SLOT < total % OF ? 1 : 0);
  if (!share) { last = 0; await sleep(500); continue; }
  const dt = last ? Date.now() - last : 1000; last = Date.now();
  const due = Math.max(0, Math.min(Math.ceil(share * CATCH), Math.round((share * dt) / 1000)));
  const slice = pool.splice(0, due);   // these coins are in flight: out of the pool until their result is known
  if (!slice.length && !due) { await sleep(50); continue; }
  if (!slice.length) { try { await load(false); } catch { phase(`PAY_LANE sender=${SID} node=${NN} pool-unread`); } if (!pool.length) { phase(`PAY_STOP sender=${SID} node=${NN} reason=pool`); break; } continue; }
  const t0 = Date.now();
  await Promise.all(slice.map(async (coin) => {
    attempts++;
    try {
      // One-in one-out payments of one key have one mass. The draft is built for the first coin and every 64th after, and
      // the largest mass seen is used, so the fee stays mass x 150 without a second build per payment (signing headroom).
      if (!massMax || ++massN % 64 === 0) { const draft = k.createTransaction([bare(coin)], [new k.PaymentOutput(new k.Address(addr), BigInt(coin.amount) - 1_000_000n)], 0n, undefined, 1); massMax = Math.max(massMax, massOf(draft)); }
      const fee = BigInt(massMax) * FEE_RATE;
      if (BigInt(coin.amount) <= fee + PP.MIN_SOMPI) { other++; return; }
      const outAmt = BigInt(coin.amount) - fee;
      const tx = k.createTransaction([bare(coin)], [new k.PaymentOutput(new k.Address(addr), outAmt)], 0n, undefined, 1);
      const signed = k.signTransaction(tx, [pk], true);
      const res = await to(rpc.submitTransaction({ transaction: signed, allowOrphan: false }), 8000, "submit");
      ok++; used.set(op(coin), Date.now());
      const id = String(res?.transactionId || signed.id || "");
      if (/^[0-9a-f]{64}$/.test(id)) paybuf.push(id.slice(0, 13));
      if (chain && /^[0-9a-f]{64}$/.test(id)) pool.push({ address: coin.address, outpoint: { transactionId: id, index: 0 }, amount: outAmt, scriptPublicKey: coin.scriptPublicKey, blockDaaScore: coin.blockDaaScore, isCoinbase: false, t: Date.now() });
    } catch (e) {
      const why = reason(e);
      if (why === "mempool_full") { full++; pool.push(coin); return; }   // not spent: the coin goes back; a full mempool does not stop this sender
      if (why === "rpc") pool.push(coin);                                   // not known to be spent
      else used.set(op(coin), Date.now());
      if (why === "rpc") other++;
      else if ((why === "fee" || why === "mass") && !rateStopped) { rateRej++; rateStopped = true; phase(`PAY_STOP sender=${SID} node=${NN} reason=rate`); fs.writeFileSync(myStop(), "rate\n"); }
      else { other++; if (++fails > 200 && chain && ok === 0) { chain = false; phase(`PAY_CHAIN sender=${SID} node=${NN} off`); } }
      if (why === "rpc" && !recon) { recon = true; try { rpc = await connect(NODE, 2); } catch { phase(`NODE_DROP node=${NN} sender=${SID}`); } finally { recon = false; } }
    }
  }));
  flushIds();
  const wait = 1000 - (Date.now() - t0);
  if (wait > 0) await sleep(wait);
}
flushIds();
roll(Date.now() + 60000);
try { PP.writeCoins(handed ? HAND : SNAP, pool, { slot: SLOT, of: OF, node: NN, sender: SID }); } catch {}
if (handed) phase(`PAY_HANDOFF sender=${SID} node=${NN} n=${pool.length}`);
else phase(`PAY_EXIT sender=${SID} node=${NN}`);
try { await rpc.disconnect(); } catch {}
try { await lrpc.disconnect(); } catch {}
process.exit(0);
