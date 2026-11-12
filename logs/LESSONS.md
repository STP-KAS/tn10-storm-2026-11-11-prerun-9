> **Experimental. We are just trying this.** [Disclaimer](../DISCLAIMER.md) · Kaspa Testnet-10 only; tKAS has no value. Pre-run 9.

# Lessons, pre-run 9

> Written by the operator after RETURN closed and the counter's tail was read. [METHOD.md](METHOD.md) is the desk runner's own summary; its last section, the reading against the selection rule, was added by the operator afterwards. Included counts are the desk counter's read of the desk's private TN10 node ([counts/chain/TIMELINE.md](../counts/chain/TIMELINE.md)), checked against a kept public kaspad every 10 s. They are one node's view of the accepted chain, not a network-wide figure. The run sees no miner's template, so anything below about how templates picked transactions is inferred, not read.

## What happened

Every step closed on its first three minutes, with no repair. The runner was not restarted, nothing was killed, and no `FAILED` file was written. Every desk count file reached origin on the first try. The bot's file needed a second push try because Mini had pushed first; no FAILED file was needed. The desk node was not stopped.

MET below means desk submit-OK, as scored. Inclusion is reported next to it, not scored.

| Step | Offer, tx/s | Desk head | Submit-OK per scored minute | Our payments included, same minutes | Payments included within 10 percent | Desk file on origin (UTC), commit |
|---|---:|---|---|---|---|---|
| HOLD-1 | 1,013 | MET | 60,736 / 60,681 / 60,800 | 60,638 / 60,732 / 61,401 | 3 of 3 | 01:16:22Z, 21f7c32 |
| HOLD-2 | 1,800 | MET | 107,859 / 107,573 / 107,985 | 105,299 / 110,240 / 108,927 | 3 of 3 | 01:20:22Z, ca99649 |
| HOLD-3 | 2,500 | MET | 149,910 / 149,907 / 149,937 | 124,745 / 126,219 / 120,261 | 0 of 3 | 01:24:22Z, 5471efe |
| HOLD-4 | 1,013 | OBSERVATION | 60,742 (pinned minute 01:28Z) | 61,190 | 1 of 1 | 01:29:24Z, eee852e |
| RETURN | 1,013 | MET | 60,935 / 60,785 / 60,680 | 61,215 / 60,756 / 60,751 | 3 of 3 | 01:33:22Z, f8a2219 |

The payment rate fell back to 1,013 at 01:24:12Z, as HOLD-3 was scored, so the over-capacity stretch was about 3 minutes 48 seconds. The bot filed `NO SEND no-free-node` for HOLD-4 (59527e5, on origin 01:29:45Z): in its pass at 01:27:30Z every answering endpoint was one of the desk's two kept kaspads. The timeline (7293ae6, 01:38:33Z) and the runner's method file (7f953c2, 01:38:36Z) followed the 5-minute tail; the desk runner ended at 01:38:38Z. Mini published a second read for every step.

## Hops per cohort

Hops included per scored minute, desk counter (sums of the scored minutes). Floor has four families, the other cohorts three, so floor's column is per four families.

| Step | Floor 100 (4 fam.) | Double 200 | Triple 300, desk | Triple-pub 300, public | High 1000 |
|---|---:|---:|---:|---:|---:|
| HOLD-1 | 373 | 302 | 343 | 458 | 420 |
| HOLD-2 | 47 | 76 | 130 | 147 | 385 |
| HOLD-3 | 2 | 8 | 26 | 36 | 301 |
| HOLD-4 | 128 | 102 | 109 | 148 | 146 |
| RETURN | 360 | 295 | 334 | 447 | 436 |

Median submit-to-landing per hop, seconds (p95 in brackets), from the step files:

| Step | Floor | Double | Triple | Triple-pub | High |
|---|---|---|---|---|---|
| HOLD-1 | 1.6 (2.9) | 1.4 (2.7) | 1.3 (2.3) | 0.9 (2.0) | 1.1 (1.7) |
| HOLD-2 | 5.7 (86.0) | 3.8 (22.7) | 2.7 (12.3) | 2.3 (10.4) | 1.2 (1.8) |
| HOLD-3 | 5.6 (one hop) | 34.8 (89.1), 7 of 9 | 14.7 (68.8) | 10.5 (34.1) | 1.6 (2.7) |
| HOLD-4 | 1.5 (2.5) | 1.5 (2.2) | 1.4 (2.2) | 0.9 (2.0) | 1.1 (1.5) |
| RETURN | 1.7 (3.5) | 1.6 (2.8) | 1.4 (2.3) | 0.9 (2.0) | 1.1 (1.6) |

Whole run, as read by the end of the tail: 1,803,584 payment submit-OKs, all of them included. Family hops included: floor 1,507, double 1,302, triple 1,543, triple-pub 2,023, high 2,720.

## What this seems to show

- **The counter kept pace.** Every whole minute from 01:12Z to the end of the tail was marked kept pace: DAA gap at most 4 against the kept public kaspad, sink age at most about 1.2 s, each minute final about 20 s after its end. No minute was `LAGGING`. The start minute (01:11Z) was partial and the last tail minute (01:38Z) not final, as marked.
- **Block space again sat at about 120,000–130,000 a minute when pushed.** HOLD-2 at 1,800 tx/s was included as sent (all non-coinbase 108,000–113,000 a minute). HOLD-3 at 2,500 was not: all non-coinbase stayed at 123,000–130,000 a minute (about 2,050–2,160 tx/s) while submit-OK was about 150,000. The backlog drained within about two minutes of the rate drop: by 01:26Z inclusion was back to submit level.
- **Other users were not pushed out this time.** Other traffic read about 2,800–3,400 a minute throughout, including HOLD-3. In pre-run 8, with nine minutes over capacity, it fell to 7–30 a minute. The shorter over-capacity stretch seems to be the reason, but this run did not test that directly.
- **HOLD-2 was at capacity, not comfortably under it.** Payments were included as sent, but the families already slowed by fee tier (floor to 13 percent of its HOLD-1 rate, double 25 percent, triple 38 percent, high 92 percent). So "just under the block limit" for payments is already congested for chained, low-fee transactions.
- **The 1000 tier was barely touched by the load.** High landed every OK hop in every step, with a median of 1.1–1.6 s; in HOLD-3 it still carried 301 hops (72 percent of its HOLD-1 rate) while triple carried 26.
- **Fee order held at every congested step, in the order of the cubed weights.** The size of the gaps is not the size of the weights, though; see [METHOD.md](METHOD.md#reading-against-the-selection-rule).
- **The node path matters, by about 0.4 s a hop and more under load.** Triple and triple-pub paid the same 300. Submitted on the payments' public kaspads, triple-pub was faster at every step (median 0.9 s against 1.3–1.4 s uncongested; 10.5 s against 14.7 s in HOLD-3) and landed about a third more hops. Uncongested, triple-pub was even faster than high on the desk node (0.9 s against 1.1 s), so the desk node's relay hop costs more than the fee buys when blocks are not full. Under HOLD-3 the fee mattered more than the path: both 300 cohorts fell to under a tenth of their HOLD-1 rate (26 of 343, 36 of 458).
- **Mini's dedupe fixed its totals, not its hop counts.** Mini's non-coinbase matched the desk within about 0.5 percent every minute (for example 127,989 against 127,744 at 01:21Z). Its hop columns were exactly twice the desk's in every row. Its `classify()` writes one row per covenant output, and each hop transaction has two covenant outputs. Recorded, not fixed mid-run. Mini also left 793 removals after a minute had closed in place (by design, logged). The desk counter stays the inclusion figure.

## Spend

- Payment fees: the pile's coin total went from 196,388.47 tKAS (pre-run 8's end snapshot, this run's start) to 191,994.94 tKAS (this run's end snapshot): 4,393.53 tKAS for 1,803,584 payments, about 0.0024 tKAS each. 8,400 coins before and after.
- The family lane read 5,558 coins and 255,428 usable tKAS before `fund9.mjs`, and 5,541 coins and 245,475 usable tKAS after the run: 9,953 tKAS. That covers the 14 fresh genesis coins for keys 2–15, the 16 genesis transactions, about 1 tKAS locked per landed hop (9,095 hops on the counter), and the hop fees (the 1000 tier pays about 0.13 tKAS a hop). It is not split further here.
- Both stay far above the abort line (2,500 coins, 18,000 usable tKAS).

## What a next attempt could try (not opened)

1. Hold payments at a set fraction below the measured band (for example 1,500 tx/s) as well as at it, to see where the chained low-fee tiers start to slow.
2. Put every cohort on the public kaspads (or every cohort on the desk node), so path and fee are not mixed across cohorts again; or keep one same-fee pair as here, which gave the cleanest single reading.
3. Read the miners' side if any miner's template or mempool can be read, so the weight model can be tested, not inferred.
4. Fix Mini's `classify()` to count one hop per transaction, and check it offline before a run.
5. The bot stays a `NO SEND` until a third unique kaspad answers.
