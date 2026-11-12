> **Experimental. We are just trying this.** [Disclaimer](DISCLAIMER.md) · Kaspa Testnet-10 only; tKAS has no value.
>
> **This is a pre-run. Pre-run 9.** It is not the Wednesday run. It is not the Tuesday run. It is not pre-run 1, 2, 3, 4, 5, 6, 7, or 8. A read does not start a runner.

# tn10-storm-2026-11-11-prerun-9

**Pre-run 9 of the Wednesday neuron.** The neuron stays [tn10-storm-2026-11-11](https://github.com/STP-KAS/tn10-storm-2026-11-11). This repo does not edit that repo, does not write `REVIEW_CLOSED`, and does not set or move a clock for it. [tn10-storm-2026-11-10](https://github.com/STP-KAS/tn10-storm-2026-11-10) (Tuesday) is not edited from here either.

**Where this starts.** Pre-runs 1 to 4 failed and are closed. Pre-runs 5 to 8 finished through RETURN and are closed. The index of all of them is the [pre-run 2 README](https://github.com/STP-KAS/tn10-storm-2026-11-11-prerun-2#pre-runs-in-this-rehearsal). This repo starts from [pre-run 8's locks/LOCKED.md](https://github.com/STP-KAS/tn10-storm-2026-11-11-prerun-8/blob/9d46b1a/locks/LOCKED.md) at commit 9d46b1a, copied here as [locks/LOCKED.md](locks/LOCKED.md), with a pre-run 9 section added at the end.

## What pre-run 8 left open

Pre-run 8 had a counting node that kept up. It seemed to show that TN10's blocks took about 110,000–132,000 transactions a minute (roughly 1,800–2,200 tx/s), and that covenant hops landed in fee order (300 before 200 before 100) once the blocks were full. But two things were tangled. HOLD-3 and HOLD-4 were well over block space, so every tier also waited behind a backlog. And every family went through the desk's private node while the payments went straight to two public nodes, so the node path differed as well as the fee. The fee-ordering rule of the kaspad version in use had not been read either.

## What pre-run 9 tries

The question: how covenant families with different fees land when the network is congested but not over capacity, and when it is over capacity.

- **The selection rule, read first.** All kaspads in use answered version 2.1.0. In rusty-kaspa v2.1.0 the block template takes every ready transaction while they fit, and otherwise picks at random with weight (fee/mass)³. A transaction whose parent is still in the mempool is not a candidate. File and commit are in [plan/PLAN.md](plan/PLAN.md#selection-rule). So a higher fee should raise a hop's odds without guaranteeing it, and a chained hop waits for its parent whatever its fee.
- **Five cohorts, one build.** Floor (families 1–4) 100 sompi/gram, double (5–7) 200, triple (8–10) 300, triple-pub (11–13) 300, high (14–16) 1000. Payments 150. Triple-pub pays what triple pays but is read and submitted on the kept public kaspads, the payments' own nodes, so the path effect can be read apart from the fee. High is far above everything else.
- **Offers shaped for the question.** HOLD-1 1,013 tx/s (under block space), HOLD-2 1,800 (about at the low end of what blocks took, the main measured step), HOLD-3 2,500 (over it), then the rate drops back to 1,013 as soon as HOLD-3 is scored. The HOLD-4 minute is an observation at 1,013, and RETURN is 1,013. The over-capacity part is meant to be about four minutes, not nine as in pre-run 8, because in pre-run 8 our load crowded out other TN10 users while the backlog lasted.
- **Counting.** The desk's private node counts, as in pre-run 8, now per cohort. Mini's second read was changed to count each transaction id once and to take removed chain blocks back out (checked offline); it is still a second read, not the inclusion figure.
- **Kept as before.** Scoring is three clean minutes of submit-OK, or `NOT MET` after one repair. MET means submit-OK, not inclusion; each step file also says in how many minutes our payments were included within 10 percent. The bot sends in HOLD-4 only if a third unique public kaspad is free.

All locked lines from earlier pre-runs stay: no runner restart mid-run, children detached, a family stall is not dirt, a full mempool returns the coin, the repair starts missing senders and hands pools off, git retries with a local FAILED file, unique kaspads, the abort line, the desk node is never stopped.

## Machines

| Machine | Go file | First sentence |
|---|---|---|
| Desk | [GO-DESK.md](GO-DESK.md) | DESK. I send and count on pre-run 9. This is not Wednesday. |
| Mini | [GO-MINI.md](GO-MINI.md) | MINI. I count pre-run 9 as the second read. I do not send. This is not Wednesday. |
| Bot | [GO-BOT.md](GO-BOT.md) | GROKBOT. I send payments on the pre-run 9 HOLD-4 only. I do not count. This is not Wednesday. |

The operator does not paste. On 2026-11-12 at 01:27 Brussels time he said to go with pre-run 9; that is the arm. The agents start the runners once the gates are facts. [GO.md](GO.md) is the map, [PLAYBOOK.md](PLAYBOOK.md) has the roles and gates, and [plan/PLAN.md](plan/PLAN.md) has the targets and the reasons.

## Gates, in order

No clock. Each gate is a fact read from a node or from origin.

1. Mini's TN10 node is up from its own data, synced, DAA moving.
2. The desk's private TN10 node is up from its own data (PowerShell 7), synced, DAA moving.
3. No other runner or waiter is up. The lane is above the abort line (2,500 coins, 18,000 usable tKAS). The desk's private candidate list is present.
4. `hashes/SIXTEEN.md` is on origin: sixteen rows and an On origin line, from the sixteen-family path.
5. The desk pushes `logs/PRE-RUN-OPEN.md`; Mini pushes `logs/MINI-ARMED.md`.
6. The desk counter is up. Then the families, then the payment steps.

## What a decent result is

- `hashes/SIXTEEN.md` on origin before the first family submit.
- HOLD-1 met.
- Every step file carries submit-OK and an inclusion count per minute, each minute marked kept pace or lagging, and hops per minute for all five cohorts.
- Submit-to-landing per cohort for HOLD-2 (under capacity) and HOLD-3 (over it), with triple and triple-pub side by side.
- A HOLD-4 desk file, a bot file or a legal `NO SEND`, and a Mini file.
- No id, txid, key, address, host, or port in this repo.

A miss stays in this repo. A next attempt is a new repo and starts from this repo's lock file.

**Part of [tn-master](https://github.com/STP-KAS/tn-master).** The rule is [docs/NEURON.md](https://github.com/STP-KAS/tn-master/blob/main/docs/NEURON.md). This pre-run is its own row. It is not row 47.
