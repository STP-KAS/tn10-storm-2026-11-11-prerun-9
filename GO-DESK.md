> **Experimental. We are just trying this.** [Disclaimer](DISCLAIMER.md) · Kaspa Testnet-10 only; tKAS has no value.
>
> **Paste this on the desk only.** This is **pre-run 9**, repo `tn10-storm-2026-11-11-prerun-9`. It is not Wednesday. It is not Tuesday. It is not pre-run 1, 2, 3, 4, 5, 6, 7, or 8. Mini's file is [GO-MINI.md](GO-MINI.md). The bot's file is [GO-BOT.md](GO-BOT.md).
>
> **This paste has no clock. It sends only when the gates below are true, hashes first.**

# YOU ARE THE DESK

Your first sentence is exactly this:

**DESK. I send and count on pre-run 9. This is not Wednesday.**

If the operator says this machine is Mini, or the bot, stop. Do not start a runner.

You know you are the desk because this file was pasted here. The session name does not decide it.

You send the sixteen families and the payment offers in [plan/PLAN.md](plan/PLAN.md). Your private TN10 node also counts what the chain accepted (lock line (iv)): the runner starts the counter (`tools/desk/counter.mjs`) before the first family submit, and no counter means `HELD counter-down`. Mini is a second read. The bot may send payments in the HOLD-4 minute only. You do not edit [tn10-storm-2026-11-11](https://github.com/STP-KAS/tn10-storm-2026-11-11). You do not edit [tn10-storm-2026-11-10](https://github.com/STP-KAS/tn10-storm-2026-11-10). You do not rewrite pre-run 1's to 8's go files. You do not write `REVIEW_CLOSED`. You do not stop the desk node process.

[GO.md](GO.md) is the map. It does not start a machine.

## Your node

Your node is the existing private TN10 kaspad on this desk, loopback only, on its existing data. If it is down, start it from that data with **PowerShell 7 (`pwsh`)**. Never Windows PowerShell 5.1: it drops the start arguments and can open mainnet. Do not wipe. Do not switch the binary. Do not start `KaspaPublicNode`. Leave the desk devnet alone. This pre-run does not stop the desk node process.

## The gate

This pre-run is target-bounded. There is no T0, no public clock, and no latest minute. A gate is a fact, not a time.

Stop, and do not start a runner, if any one of these is true:

- Mini has not said its TN10 node is synced (`isSynced` true, DAA moving) and has not notified Build and TN10 ops.
- Your own TN10 node is not up, not synced, or its DAA is not moving.
- A Tuesday, Wednesday, pre-run 1, 2, 3, 4, 5, 6, 7, or 8 runner or waiter is in the process list.
- The family lane would fall under **2,500 coins** or **18,000 usable tKAS**.
- The desk's private candidate list is missing or empty.
- You have no sixteen-family hash path. The old 8- or 32-family publisher does not count. The path is [tools/sixteen](tools/sixteen/README.md).

Say `HELD` and the reason: `mini-not-synced`, `desk-node-down`, `other-runner`, `lane-held`, `candidates-missing`, or `no-sixteen-hash-path`. Do not start a waiter. The operator pastes this file again when the gate is true.

When the gate is open, this read may start one runner. Publish [logs/PRE-RUN-OPEN.md](logs/README.md) in this repo. One line: `PRE_RUN_OPEN` and the UTC time. Mini and the bot read it from origin. A sentence in chat is not that line. Earlier pre-runs' `PRE-RUN-OPEN` is not that line. The chat is not the runner. A second runner is a fault.

Before the first family submit, check each public node in the local config. The check is version, synced, DAA within a few blocks of the others, UTXO index, and answer time. Drop a node that fails. Read each node's id too. A node is a kaspad, not a hostname: two hostnames that answer with one node id are one node. Keep the lowest local number of that kaspad and drop the other as same-kaspad. A node whose id cannot be read is dropped, because its uniqueness is not proven. Do not put one back after the first family submit. The local log keeps the count checked, pass or fail, and how many kaspads the passing hostnames were. No names. No node id. This check does not stop the desk node.

## Hashes first

Read [locks/LOCKED.md](locks/LOCKED.md) first. Do not reopen a locked line.

One genesis. Sixteen hashes in [hashes/SIXTEEN.md](hashes/README.md) before the first family submit. The file comes first: it may already be on origin before this paste, and it does not wait for `PRE-RUN-OPEN`. If it is on origin, do not rebuild it: submit the genesis transactions from the private bundle that wrote it (`tools/sixteen/submit-sixteen.mjs`). If it is absent, publish it once with `tools/sixteen/sixteen.ps1 -Mode publish`. Sixteen rows. The row is the family label, the cohort, and the sha256 of the lowercase hex covenant id. Floor is families 1–4, double 5–7, triple 8–10, triple-pub 11–13, high 14–16. The id stays off the repo. Fixed is the local write. On origin is the commit time you then read from origin. No On origin line, no send. A file with 8 or 32 rows is not this file. Do not use the old 8- or 32-family publisher. Do not invent a hash.

## Targets

Families: **1.2 hop/s**, boson, stagger 0, from the first family submit until RETURN closes.

Payments, in order, after the families are up. Stay on a scored offer until it is met or one repair pass is done.

| Order | Offer, tx/s | File |
|---:|---:|---|
| 1 | 1,013 | HOLD-1, `MET` or `NOT MET` |
| 2 | 1,800 | HOLD-2, `MET` or `NOT MET` |
| 3 | 2,500 | HOLD-3, `MET` or `NOT MET` |
| 4 | 1,013 | HOLD-4, `OBSERVATION` |

The rate drops to 1,013 as soon as HOLD-3 is scored, so the minutes over block space stay few. HOLD-4 and RETURN run at 1,013.
| 5 | 1,013 | RETURN, `MET` or `NOT MET` |

A clean minute: your submit path is synced, that node's DAA is moving (the kept public nodes for the payments, and the desk's private node for the families), submit-OK within 10 percent, rejects logged as rate or full, no sender-off, pool-low, node-drop, or proc-exit, no family-node skip, and every family still attempting. A family-node skip is dirt with its reason (`node-skip-fam:<reason>`) for every minute from its `NODE_SKIP` to its `NODE_SKIP_CLEAR`. In pre-run 9 the mempool skip does not apply to the families (lock line (i)), so a mempool at or over 90,000 is logged as a mark, not a skip. A family STALL mark (no hop of that family landing for a while) is logged per minute. It is not dirt: the family is still attempting. A stall at the two-thirds rate is part of the congestion question. Three of those minutes close a scored target. Mini's marks do not gate you.

Your payment senders use every kept kaspad that answers synced. Three processes per kept kaspad (lock line (iii)), each with its own connection and its own lane of coins; a second hostname of one kaspad is still the same kaspad and gets no senders of its own. Skip a node that does not answer. Through HOLD-4 you keep every node you used in HOLD-3. Do not drop one to free it. Families 1–10 and 14–16 run on the desk's private TN10 node, which takes no payment submit (lock line (i)). Families 11–13 (triple-pub) read, catch up and submit on the kept public kaspads, mapped round-robin in the local config, so their path is the payments' path. The family sender logs `FAMILY_PATH` once and every submit row carries its path; a mismatch with the config fails the run. The node list stays off this repo. Your file lists the local node numbers once.

The payment pile is at least **6,000 coins** before the run starts, or the runner says `HELD` and `pile-short`; pre-run 9 funds 8,400, so each of six senders holds 1,400. A slow submit loop may catch up to three times its share in one batch. Before the first payment the runner deals the free coins evenly over the senders. A coin spent by a mempool transaction is not free, even if the UTXO index still lists it. An unconfirmed change tip of ours is a coin. Each sender's loaded pool is read back and logged. The pile and the sender count are not changed once the payments are sending.

A repair may restart the sender, move the submit to another synced public node, or repair the builder. Each is tried once for that reason. Waiting is not another try. A sender restart is only done when every stopped sender has started again: the runner asks each sender to hand off its pool, each one finishes the batch in flight, writes its exact pool, and exits; only a sender that does not hand off is killed, and then its last snapshot is used. The runner waits until the stopped processes are gone, takes the handed-off pools as the truth when every sender handed off (the node view only drops coins it shows as spent, and never adds coins), caps any deal at the preflight pile, deals them evenly again, starts the missing senders, and checks that each one logged its start and its pool. A restarted sender never takes its pool from the confirmed UTXO list alone. A sender still named in the runner's list but no longer running is started again. A repair that moves the family sender moves every desk-path cohort. A repair does not raise the fee, start or stop the desk node, start a second builder, bring the bot in, or open a second runner. Then publish `NOT MET` if the minute is still dirty. HOLD-3 `NOT MET` still opens HOLD-4.

The HOLD-4 minute is the first whole UTC minute whose start is at least 3 minutes after the HOLD-3 file's On origin time. Read that time from origin. Publish that minute. If the path is not synced, the first line stays `OBSERVATION` and one line says the path was not synced. Do not open a later minute. The rate in that minute is 1,013. Do not wait for the bot.

Fees, sompi per gram: families 1–4 (floor) pay **100**, 5–7 (double) **200**, 8–10 (triple) **300**, 11–13 (triple-pub) **300** on the public path, 14–16 (high) **1000**. Payments pay **150**. Genesis 200 (lock line (v)). The sixteen are one build: one program, one hop shape, one minter size, one token size. That token size is the size this plan calls about 1 tKAS locked per landed hop. Build every tier in the one family-sender process. Only triple-pub's submit path differs. The rate is per family: it rides on each hop line to the one builder, so a hop's fee is its mass times 100, 200, 300, or 1000 ([tools/sixteen](tools/sixteen/README.md#hop-fees)). A single rate on the whole process is a miss. Log it. Do not call the fee the cause. Do not start a second builder. If the funding coins are not one size, the file says so and does not call the fee the whole cause. Storage mass can move with the rate, because the fee comes out of the funding coin. That move is the fee. It is not a second knob. Do not read a priority quote. Do not read a fee estimate. A full mempool is logged as full and does not stop that sender. A reject for the rate stops that sender. Leave the fee. Log the miss. Leave the others up.

## What you publish

One file under [counts/desk/](counts/desk/README.md) when that step closes. Before it renders, the runner waits up to 3 minutes for the counter to finalise the step's minutes; a minute that is still open is written as `not final`, never guessed. Each file carries, per minute, submit-OK next to what the desk node accepted: our payments, hops for each of the five cohorts, other traffic, and whether the counter kept pace (the desk node's DAA within 100 of a kept public kaspad and its sink under 30 s old in every sample), or `LAGGING`. After RETURN the counter reads a 5-minute tail with the senders stopped, and the runner publishes `counts/chain/TIMELINE.md`. A scored file opens with `MET` or `NOT MET`. HOLD-4 opens with `OBSERVATION`. Each minute: submit-OK, attempts, rejects split into rate and full, and the waiting count (submitted-OK not yet landed) for each cohort. Each public node: a local number, synced, DAA, submit-OK, rejects, dropped sockets, answer time. Per cohort, per target: the submit-to-landing median and the slow tail. An id used to match stays off the repo.

Call git by its full path. Empty output is a failed read. Read once more. One commit per file. If a push of a HOLD file fails, retry the fetch and the push. If it still fails, the run fails: see below. You write `counts/desk/` and `counts/chain/`. You do not write `counts/mini/` or `counts/bot/`.

When RETURN is on origin, met or `NOT MET`, stop the families and the payments. Write [logs/METHOD.md](logs/README.md). If a fix worked, append it to [locks/LOCKED.md](locks/LOCKED.md) in the form that page shows. Do not rewrite this paste. Then one commit on tn-master for this pre-run's row only. Do not change Wednesday's row into a result from this pre-run.

If the run dies before RETURN, write `logs/FAILED.md` locally first, then push it to this repo, retrying the fetch and the push. If origin still refuses, the local FAILED file stays on the desk and the operator publishes it. A fetch or push error never leaves a dead run unmarked on origin. Stop your runner and do not resume. The next attempt is a new repo.

Abort line **2,500 coins** and **18,000 usable tKAS**. Do not lower it. Do not print a balance. Do not spend a coin at or above 100,000 tKAS.

## What you refuse

- Sending before the gate is true, or before `hashes/SIXTEEN.md` has an On origin line.
- Sending while a Tuesday, Wednesday, pre-run 1, 2, 3, 4, 5, 6, 7, or 8 runner is up.
- Treating a chat sentence, or a pre-run 1, 2, 3, 4, 5, 6, 7, or 8 file, as the start.
- Starting your node with Windows PowerShell 5.1, starting `KaspaPublicNode`, or touching the desk devnet.
- Stopping the desk node, deleting chain data, or switching the binary.
- The old 8- or 32-family hash publisher, or an invented hash.
- Editing the Tuesday repo, the Wednesday repo, or pre-run 1's to 8's go files, or writing `REVIEW_CLOSED`.
- A second runner, or a waiter that sits on a gate.
- A live run of a runner that has not passed the offline rehearsal through HOLD-1 scoring and a count-file render.
- Restarting the runner mid-run to apply a fix, scoring or other. Leave the run alone and fix it in a later repo. The runner starts its children (broker, builder, coordinator, family sender, payment senders) detached, so they survive the parent.
- Bringing the bot in on a scored offer.
- An id, a txid, a key, a seed, an address, a host, a port, or an IP in this repo or in chat.
- Rewriting this page after the paste to match the result.
