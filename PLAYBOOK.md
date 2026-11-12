> **Experimental. We are just trying this.** [Disclaimer](DISCLAIMER.md) · Kaspa Testnet-10 only; tKAS has no value.
>
> **This is the playbook for pre-run 9.** It is not Wednesday. It is not Tuesday. It is not pre-run 1, 2, 3, 4, 5, 6, 7, or 8. It does not start a machine and it does not arm one.

# Playbook

Who does what, and the gates before each machine may start. The plan is [plan/PLAN.md](plan/PLAN.md), the locks are [locks/LOCKED.md](locks/LOCKED.md), and the go files are the three GO pages. This page does not override them.

## Oversight

TN10 ops oversees this rehearsal end to end: Mini, the desk (Build), and the bot. TN10 only. Never mainnet. Do not edit the Tuesday repo, the Wednesday repo, or pre-run 1's to 8's go files. Do not write `REVIEW_CLOSED`.

For pre-run 9 the operator does not paste. On 2026-11-12 at 01:27 Brussels time he said to go with pre-run 9 (spending TN10 wallet funds as needed is approved). That is the arm. The agents start their runners once the gates are facts.

## Start gates

1. **Mini node synced.** Existing TN10 kaspad, existing data, no wipe. `isSynced` true, DAA moving.
2. **Desk node synced.** Existing private TN10 kaspad, existing data, loopback only, started with `pwsh`. No wipe. Synced, DAA moving.
3. **No other runner.** No earlier runner, waiter, or counter on any machine. Lane above the abort line. The desk's private candidate list is present and not empty (`HELD candidates-missing` otherwise).
4. **Hashes.** `hashes/SIXTEEN.md` with sixteen rows and an On origin line, from [tools/sixteen](tools/sixteen/README.md).
5. **Open.** The desk pushes `logs/PRE-RUN-OPEN.md`. Mini then pushes `logs/MINI-ARMED.md`.
6. **Counter, families, senders.** The desk runner starts the counter on its private node and waits for its start line (`HELD counter-down` otherwise). Then the genesis from the bundle that wrote `hashes/SIXTEEN.md`, the families, and the payment steps.

## Who does what

| Who | Role | What not to do |
|---|---|---|
| **Desk (Build)** | Sends the sixteen families (five cohorts: four fees, and one fee on two paths) and the payment offers. Its private TN10 node counts what the chain accepted (lock line (iv)). Publishes `hashes/SIXTEEN.md`, `logs/PRE-RUN-OPEN.md`, `counts/desk/` per step, `counts/chain/TIMELINE.md` after the tail, and `logs/METHOD.md`. | Do not stop or wipe the desk node. No Windows PowerShell 5.1, no `KaspaPublicNode`, no devnet. No 8- or 32-family publisher. No second runner. Never restart the runner mid-run. |
| **Mini** | Second chain read on its own node. Does not send, mine, or hold a key. Publishes `logs/MINI-ARMED.md`, then `counts/mini/` when the matching desk file is on origin. Each head is Mini's own read: `READ`, `PARTIAL`, or `NOT READ`. | Do not wipe. Do not repeat the desk's head as Mini's. |
| **Bot (TN10 ops)** | Sends payments in the HOLD-4 minute only, on a synced public kaspad that is not one the desk kept, or publishes a legal `NO SEND`. | Do not send on HOLD-1, HOLD-2, HOLD-3, or RETURN. One waiter. No local node. |

## Status when this repo was opened

Not a gate. A status line, so nobody guesses. Read on 2026-11-12 between 00:30Z and 01:00Z.

- Mini: existing TN10 kaspad 2.1.0 up, no wipe; its sync is read and logged by its runner before `MINI-ARMED`. Pre-run 8's Mini runner ended at 2026-11-11T23:53:42Z.
- Desk: existing private TN10 kaspad 2.1.0 up with `pwsh`, no wipe. It is not stopped for this pre-run. No pre-run 8 runner or child is running.
- Box: no local TN10 node. No bot waiter running.
- Lane and pile: lane above the abort line (about 5,500 coins). The payment key still holds 8,400 coins. Keys 2–15 got a fresh genesis coin from the lane on 2026-11-12 at about 00:47Z (14 transactions, none rejected).
- Known risks, not fixed mid-run:
  - Triple-pub's funding coins are still read from the desk node; a public node may briefly refuse a coin it has not yet seen spent. Such rejects are logged.
  - If HOLD-3 needs its one repair, the over-capacity stretch can run to about 12 minutes instead of about 4.
  - Each family is a chain of hops, so a hop waits for its parent whatever its fee (see [plan/PLAN.md](plan/PLAN.md#selection-rule)).
  - The run sees no miner's template; what a public kaspad's own template would pick is inferred, not read.

## Offline rehearsals, recorded before `PRE-RUN-OPEN`

Rehearsal A, 2026-11-12 00:40:55Z to 01:04:24Z (desk, Brussels 01:40 to 02:04). The real pre-run 9 desk runner, counter, payment sender, family sender (kit19) and builder ran against a stand-in node on the desk. The stand-in answered with realistic submit latency (payment answers about 35 ms median), accepted at most about 2,000 transactions a second on chain (so HOLD-2 at 1,800 was under it and HOLD-3 at 2,500 over it), carried about 40 tx/s of other traffic, let the desk view fall behind for 100 s inside HOLD-2, and replaced one chain block once. Nothing was sent to the network. Short times: 2-minute tail. An earlier attempt at 00:39Z was `HELD` at genesis because the rehearsal's stand-in genesis script had been overwritten with the real one; that hold left the counter running, so the runner now stops the counter on a genesis hold too.

- Preflight kept two unique kaspads (one candidate was the same kaspad as another). `FAMILY_PUBLIC_MAP 11:public-1,12:public-5,13:public-1`. The runner checked `FEE_SPLIT` and every submit row's rate and path: floor 100, double 200, triple 300 and high 1000 on the desk node, triple-pub 300 on the public nodes. 16 families attempting.
- HOLD-1 `MET` (60,630 / 60,716 / 60,914 submit-OK; included within 10 percent in 3 of 3 minutes). HOLD-2 `MET` (about 108,000 a minute submit-OK and included); all three minutes marked `LAGGING` (DAA gap up to 690, sink age up to 69 s), and the file said so. HOLD-3 `MET` on submit-OK (about 150,000 a minute) while about 109,400 of our payments were included a minute (within 10 percent in 0 of 3 minutes), the stand-in's cap.
- The rate fell to 1,013 at 00:53:12Z, as HOLD-3 was scored; the over-capacity stretch was about 3 minutes 50 seconds. HOLD-4 pinned 00:57Z and ran at 1,013 (`OBSERVATION`, 60,983 submit-OK). RETURN `MET`. The runner published `counts/chain/TIMELINE.md` and `logs/METHOD.md` (with the selection-rule section) and exited 0. No rehearsal process was left running.
- The five cohort columns rendered in every step file, with submit-to-landing per cohort. The stand-in lands hops by its own rule, so its cohort numbers are not a network result.
- What the rehearsal did not exercise: the stand-in's chain-block replacement was not seen by the counter (no `REORG` line), as in pre-run 8's rehearsal. The removal path is unchanged from pre-run 8's counter. Mini's dedupe was checked by its own offline test, not in this rehearsal.

## When something breaks

Append a worked fix to [locks/LOCKED.md](locks/LOCKED.md) in the form that page shows, and a repair line to `logs/FIXES.md`. If the run dies before RETURN, write `logs/FAILED.md`, stop every runner, waiter, and counter, and do not resume. The next attempt is a new repo that starts from this repo's lock file.
