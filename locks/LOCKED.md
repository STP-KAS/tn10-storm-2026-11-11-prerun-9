> **Experimental. We are just trying this.** [Disclaimer](../DISCLAIMER.md) · This page does not start a machine.
>
> Lines here are locked for pre-run 2. This pre-run does not reopen them. Wednesday's plan is not edited from this page. Pre-run 1's pages are not edited from this page.

# Locked

Pre-run 2 starts from this page.

The two sections under **Carried from pre-run 1** are copied without change from [pre-run 1's locks/LOCKED.md](https://github.com/STP-KAS/tn10-storm-2026-11-11-prerun/blob/main/locks/LOCKED.md) at commit b39a506. In them, "this pre-run" and "this repo" mean pre-run 1. Every line there holds for pre-run 2 as well.

# Carried from pre-run 1

## Locked before pre-run 1

These came from the Wednesday review, through round 4, and this pre-run keeps them.

- The desk keeps every public node it used in HOLD-3. It does not drop one to free it for the bot.
- The bot sends only on a synced public node outside that set, one process, and only in the HOLD-4 minute. No free node means `NO SEND` and `no-free-node`. The bot has no local node.
- The HOLD-4 minute is the first whole UTC minute whose start is at least 3 minutes after the HOLD-3 file's On origin time. Both sides read that time from origin. An unsynced minute is still that minute. The run does not open a later one.
- Mini publishes HOLD-4 when the bot file is on origin, or `logs/BOT-HALT.md` is on origin, or the desk's HOLD-4 file has been on origin for 10 minutes. `TWO SENDERS` only when the bot file is on origin and is not `NO SEND`. Mini does not republish.
- Families 1–13 and families 14–16 use the same family-sender nodes. Fees stay 100, 200, and 150 sompi per gram. The sixteen are one build. The rate is per family, in one process. A single rate for the process is not a fee difference. A second builder is not the fix. If the funding coins are not one size, the file says so and does not call the fee the whole cause. A priority quote is not read. A fee estimate is not read.
- Mini is the only chain counter. Mini does not send. The bot stays out of HOLD-1, HOLD-2, HOLD-3, and RETURN.
- The abort line stays 2,500 coins and 18,000 usable tKAS. The desk node process is not stopped by this pre-run.
- This repo does not edit Tuesday's repo and does not edit Wednesday's repo.

## Locked during this pre-run

Nothing yet. When a fix works, append it here before the next pre-run is written.

One block per fix:

```
- UTC time.
- What failed.
- What was changed.
- Why that change stays.
```

The go files in this repo stay as they were at the paste. The next repo copies this page and bakes the new lines into its own pastes.

### Worked fixes appended on 11 Nov 2026, after pre-run 1 failed

These blocks are appended in the form above. The line `Nothing yet.` is the state before these blocks. Pre-run 2, [tn10-storm-2026-11-11-prerun-2](https://github.com/STP-KAS/tn10-storm-2026-11-11-prerun-2), starts from this page.

```
- 2026-11-11T07:21:32Z.
- What failed: the desk and Mini reset during pre-run 1, before hashes or sends. Nothing was armed for send after the reset.
- What was changed: pre-run 1 was marked failed in logs/FAILED.md and closed. It is not resumed. The next attempt is a new repo, tn10-storm-2026-11-11-prerun-2.
- Why that change stays: a failed pre-run's open and armed files are history, not live gates. A new attempt opens its own files in its own repo.
```

```
- 2026-11-11T07:16:33Z.
- What failed: the bot waiter from pre-run 1 kept polling origin after the desk and Mini had reset. A late HOLD-3 file could have made it send on a dead run.
- What was changed: the operator stopped the waiter. BOT-HALT was written. No second waiter was started.
- Why that change stays: a waiter does not outlive its run. When a run fails, its waiters are stopped and not reused. A new run gets a new paste.
```

```
- 2026-11-11T08:04:08Z.
- What failed: Mini rebooted during pre-run 1 and its TN10 kaspad was down.
- What was changed: the existing Mini TN10 kaspad was started with its existing start task and data directory. No wipe. It re-synced from its own data, finished IBD, and accepted live blocks.
- Why that change stays: before any new paste or arm, start the existing Mini TN10 kaspad if it is down. Do not wipe chain data. Re-sync first. When isSynced is true and DAA is moving, Mini notifies Build and TN10 ops. Mini does not publish a new MINI-ARMED until GO-MINI is pasted and PRE-RUN-OPEN is on origin.
```

```
- 2026-11-11T07:54:58Z.
- What failed: the desk rebooted during pre-run 1 and its private TN10 kaspad was down. Windows PowerShell 5.1 drops the start arguments and can open mainnet.
- What was changed: the existing desk private TN10 kaspad was started from its existing data, loopback only, with PowerShell 7 (pwsh). No wipe. KaspaPublicNode was not started. The desk devnet was left alone. IBD finished and the node accepted live blocks.
- Why that change stays: start the desk private TN10 node from existing data if it is down, with pwsh 7, never Windows PowerShell 5.1. Do not wipe. Do not start KaspaPublicNode. Leave the desk devnet alone. The pre-run does not stop the desk node process.
```

```
- 2026-11-11T09:59:00Z.
- What failed: pre-run 1 was gated on a wall clock and a waiter sat on that clock. The day's clock moved and the run died before hashes.
- What was changed: the operator set the next attempt as target-oriented, with no time frames.
- Why that change stays: the pre-run is target-bounded. It has no T0 after the start and no public clock. Order: hashes first (hashes/SIXTEEN.md, sixteen rows, with an On origin line), then covenant families, then gradual senders. The bot sends only in the HOLD-4 minute after desk HOLD-3 is on origin, or writes a legal NO SEND. Chat is not the start signal. The operator's paste is the arm.
```

```
- 2026-11-11T10:00:00Z.
- What failed: the desk hash tools publish only 8 or 32 families. The pre-run needs sixteen.
- What was changed: the old 8- and 32-family publisher is barred for the pre-run. A sixteen-family path is needed before any hash file is published. No hash value or covenant id is invented.
- Why that change stays: a hash file with the wrong family count is not proof. No sixteen-row file with an On origin line, no family submit.
```

# Pre-run 2

## Locked for pre-run 2

These lines are baked into this repo's own pastes. They come from the worked fixes above.

- Pre-run 1 is failed and closed. It is not resumed. Its `PRE-RUN-OPEN`, `MINI-ARMED`, `BOT-HALT`, and `FAILED` files are history in that repo, not gates here. This repo writes its own.
- A waiter does not outlive its run. If this repo's `logs/BOT-HALT.md` or `logs/FAILED.md` is on origin, every runner and waiter of this run stops and is not reused.
- Before any new paste or arm, Mini's existing TN10 kaspad is up from its own data, not wiped, and re-synced. When `isSynced` is true and DAA is moving, Mini notifies Build and TN10 ops. Mini does not publish a new `MINI-ARMED` until GO-MINI is pasted and this repo's `PRE-RUN-OPEN` is on origin.
- The desk's existing private TN10 kaspad is up from its own data, started with PowerShell 7 (`pwsh`), never Windows PowerShell 5.1. No wipe. `KaspaPublicNode` is not started. The desk devnet is left alone. This pre-run does not stop the desk node process.
- This pre-run is target-bounded. No T0 after the start, and no public clock. Hashes first: `hashes/SIXTEEN.md`, sixteen rows, with an On origin line. Then the covenant families. Then the senders, step by step. The bot sends only in the HOLD-4 minute after the desk's HOLD-3 file is on origin, or writes a legal `NO SEND`.
- Chat is not the start signal. The operator's paste is the arm.
- The old 8- or 32-family hash publisher is not used for this pre-run. A hash is never invented.
- The fee lines (100, 200, 150 sompi per gram), the abort line (2,500 coins and 18,000 usable tKAS), the HOLD-4 minute, and the node-set lines above are not loosened.
- This repo does not edit Tuesday's repo, Wednesday's repo, or pre-run 1's go files, and does not write `REVIEW_CLOSED`.

## Locked during pre-run 2

Nothing yet. When a fix works, append it here, one block per fix, in the form shown above: UTC time, what failed, what was changed, why that change stays.

```
- 2026-11-11T12:22:54Z.
- What failed: pre-run 1's sixteen-family hash step stopped with HASH_STOP build. Its genesis launch paths began launch::prerun1-, and the reference builder refuses any genesis launch path outside its allow-list ("launch path not on the storm allow-list").
- What was changed: pre-run 2's genesis launch paths begin launch::storm-2026-10-, and the hash tool refuses any other prefix before it reads the node. The desk check then built sixteen genesis transactions and sixteen rows.
- Why that change stays: a genesis launch path must start with launch::storm-2026-10-. Any other path does not build, and then there is no hash file and no send.
```

```
- 2026-11-11T15:23:08Z.
- What failed: HOLD-1 was met. In HOLD-2 the desk runner marked minutes dirty because families logged STALL marks, and the reason came out blank. The runner process was stopped mid-run to apply that scoring fix. Its children (builder broker, builder, coordinator, family sender, payment senders) died with it. The restarted runner found the family processes gone and wrote logs/FAILED.md. The run is not resumed.
- What was changed: nothing in this repo's run. The next repo carries three lines. (a) A runner is never restarted mid-run to apply a scoring fix. The run is left alone and the fix goes into a later repo. (b) If a later design must ever replace a runner, its children (builder, broker, coordinator, family sender, payment senders) are started detached, so they survive the parent. (c) A family STALL (no hop of that family landing for a while) is not dirt for HOLD scoring. GO-DESK's clean minute does not count it. A stall at the two-thirds rate is part of the congestion question, and it is logged per minute.
- Why that change stays: a scoring fix applied by restarting the runner killed a run that was sending cleanly. A stall is data about congestion and competition, not a sender fault.
```

The go files in this repo stay as they were at the paste. A next repo copies this page and bakes the new lines into its own pastes.

## Locked for pre-run 3

These lines are baked into this repo's own pastes. They come from pre-run 2's worked fixes above.

- Pre-run 2 is failed and closed. It is not resumed. Its `PRE-RUN-OPEN`, `MINI-ARMED`, `BOT-HALT`, and `FAILED` files are history in that repo, not gates here.
- Pre-run 2's genesis coins are spent. This repo publishes fresh `hashes/SIXTEEN.md` rows from the desk node with the sixteen-family publisher. Genesis launch paths begin `launch::storm-2026-10-`. A hash is never invented. The family submit uses the bundle that wrote this repo's file. Nothing rebuilds it after the publish.
- A runner is never restarted mid-run to apply a fix. The run is left alone and the fix goes into a later repo.
- The desk runner starts its children (builder broker, builder, coordinator, family sender, payment senders) detached, so they survive the parent.
- A family STALL is not dirt for HOLD scoring. It is logged per minute.
- The operator does not paste for this repo. His instruction to start everything is the arm. The agents start the runners after the gates are facts. The Mini runner refuses to publish `MINI-ARMED` unless its node is synced with DAA moving. That file on origin is Mini's synced notice to Build and TN10 ops.
- Mini's clone carries the git user name and email before its first push.
- The fee lines (100, 200, 150 sompi per gram, genesis 200), the abort line (2,500 coins and 18,000 usable tKAS), the HOLD-4 minute, the offers, and the node-set lines are not loosened.
- This repo does not edit Tuesday's repo, Wednesday's repo, or pre-run 1's or pre-run 2's go files, and does not write `REVIEW_CLOSED`.

## Locked during pre-run 3

Nothing yet. When a fix works, append it here, one block per fix, in the form shown above: UTC time, what failed, what was changed, why that change stays.

```
- 2026-11-11T15:40:21Z.
- What failed: the desk runner stopped with "readSub is not defined" on the first scored HOLD-1 minute and wrote logs/FAILED.md. The genesis, family-start, and submit-log reader section sat inside a { ... } block in an ES module, so readSub, landed, and subRows were not in scope for the scoring code. The dry start before the run only reached the gate check.
- What was changed: nothing in this repo's run. The next repo's runner has that block removed, passes a no-undef lint, and has passed an offline rehearsal on the desk through HOLD-1 scoring and a count-file render before its live run.
- Why that change stays: a runner is rehearsed offline through HOLD-1 scoring, with faked submit and payment logs and no live send, before any live run. A dry start that only reaches the gate check is not a rehearsal.
```

## Locked for pre-run 4

These lines are baked into this repo's own pastes. They come from pre-run 3's worked fixes above.

- Pre-run 3 is failed and closed. It is not resumed. Its `PRE-RUN-OPEN`, `MINI-ARMED`, and `FAILED` files are history in that repo, not gates here.
- Pre-run 3's genesis coins are spent. This repo publishes fresh `hashes/SIXTEEN.md` rows from the desk node with the sixteen-family publisher. Genesis launch paths begin `launch::storm-2026-10-`. A hash is never invented. The family submit uses the bundle that wrote this repo's file. Nothing rebuilds it after the publish.
- The desk runner passes a no-undef lint, and an offline rehearsal on the desk through HOLD-1 scoring and a count-file render, before its live run. The rehearsal fakes the submit and payment logs and sends nothing.
- A full mempool returns the payment coin to that sender's pool. It is logged as full and does not stop the sender.
- Every pre-run 2 and pre-run 3 line above stays: no runner restart mid-run, children started detached, a family stall is not dirt, the operator's start is the arm, Mini's clone has its git identity before its first push.
- The fee lines (100, 200, 150 sompi per gram, genesis 200), the abort line (2,500 coins and 18,000 usable tKAS), the HOLD-4 minute, the offers, and the node-set lines are not loosened.
- This repo does not edit Tuesday's repo, Wednesday's repo, or pre-run 1's, 2's, or 3's go files, and does not write `REVIEW_CLOSED`.

## Locked during pre-run 4

Nothing yet. When a fix works, append it here, one block per fix, in the form shown above: UTC time, what failed, what was changed, why that change stays.

```
- 2026-11-11T17:14:23Z.
- What failed: HOLD-1 and HOLD-2 were met. HOLD-3 stayed under the 3,040 offer at about 116,000–118,000 submit-OK a minute (ok-off), the expected desk signing ceiling with three payment senders. The one repair pass killed the payment senders, waited 3 seconds, then called startPay, which skipped any sender still listed in the runner's process list. Dead senders are only dropped from that list every 5 seconds, so none restarted. Minutes after the repair were 0 sent (ok-off, proc-row-missing); two samples also marked the kept nodes unsynced. A git fetch error at 2026-11-11T17:14:23Z blocked the push of counts/desk/HOLD-3.md, the runner logged FAILED and stopped, and a later fetch at 2026-11-11T17:15:50Z also failed, so logs/FAILED.md was not published by the runner. Separately, kept public nodes 1 and 4 were one kaspad reached by two hostnames, so the three kept endpoints were two backends, and no leftover synced public node was free for a bot HOLD-4 send.
- What was changed: nothing in this repo's run. The operator wrote logs/FAILED.md after the runner was gone. The next repo carries these lines. (a) After a payment-sender repair, startPay must start the missing senders. A process still named in the list is not treated as live until it is reaped, or the repair waits until the list has dropped the dead ones, then starts them. (b) If a push of a HOLD file or of FAILED.md fails, the runner retries, then leaves a local FAILED file and the operator publishes it; a fetch or push error does not leave the run unmarked on origin. (c) Kept public nodes are unique kaspads, not unique hostnames. Two hostnames that are one kaspad count as one node. The bot's leftover node must be a different kaspad, not another hostname of a kept one. If none is free and synced, the bot writes a legal NO SEND.
- Why that change stays: a repair that stops payment senders and does not start them again ends the load test. A failed git fetch left HOLD-3 and FAILED off origin while the run was already dead. Counting one kaspad twice overstated the kept set and left no honest free node for HOLD-4.
```

The go files in this repo stay as they were at the start. A next repo copies this page and bakes the new lines into its own pastes.

## Locked for pre-run 5

These lines are baked into this repo's own pastes. They come from pre-run 4's worked fixes above (commit edfcdd2 in [tn10-storm-2026-11-11-prerun-4](https://github.com/STP-KAS/tn10-storm-2026-11-11-prerun-4)). Everything above this heading is copied without change from that commit.

- Pre-run 4 is failed and closed. It is not resumed. Its `PRE-RUN-OPEN`, `MINI-ARMED`, `FIXES`, and `FAILED` files are history in that repo, not gates here.
- Pre-run 4's genesis coins are spent. This repo publishes fresh `hashes/SIXTEEN.md` rows from the desk node with the sixteen-family publisher. Genesis launch paths begin `launch::storm-2026-10-`. A hash is never invented. The family submit uses the bundle that wrote this repo's file. Nothing rebuilds it after the publish.
- (a) After a payment-sender repair, the missing senders start. The runner waits until the stopped senders are gone, takes them off its list, starts the ones that are missing, and checks that each one logged its start. A sender named in the runner's list is not counted as running unless its process is alive.
- (b) A failed push of a HOLD file or of `logs/FAILED.md` is retried, fetch and push. A FAILED file is written locally before any push. If origin still refuses, the operator publishes the local file. A fetch or push error does not leave a dead run unmarked on origin.
- (c) Kept public nodes are unique kaspads, not unique hostnames. Each node's id is read at the preflight. Two hostnames with one id count as one node and get one payment sender. A node whose id cannot be read is dropped. The bot's free node must be a different kaspad from every kept node, read in the same pass. If none is free and synced, the bot writes a legal `NO SEND` and `no-free-node`.
- The desk runner passed a no-undef lint and an offline rehearsal on the desk before this live run: HOLD-1 scoring, a count-file render, a repair that restarts the payment senders, a stall that stays clean, a dirty minute that is not a stall, two hostnames of one kaspad collapsed to one node, and a git failure that still leaves a local FAILED file. The rehearsal fakes the submit and payment logs and sends nothing.
- Known risk, not fixed mid-run: the desk signs about 116,000–118,000 payment submits a minute with three payment senders. HOLD-3's window is 164,160–200,640 a minute. Fewer unique kaspads means fewer payment senders, so HOLD-2's window (109,458–133,782) may be missed too. That is a reading, not a reason to change a runner during the run.
- Every pre-run 2, 3, and 4 line above stays: no runner restart mid-run, children started detached, a family stall is not dirt, a full mempool returns the coin, the operator's start is the arm, Mini's clone has its git identity before its first push.
- The fee lines (100, 200, 150 sompi per gram, genesis 200), the abort line (2,500 coins and 18,000 usable tKAS), the HOLD-4 minute, the offers, and the node-set lines are not loosened.
- This repo does not edit Tuesday's repo, Wednesday's repo, or pre-run 1's, 2's, 3's, or 4's go files, and does not write `REVIEW_CLOSED`.

## Locked during pre-run 5

Nothing yet. When a fix works, append it here, one block per fix, in the form shown above: UTC time, what failed, what was changed, why that change stays.


```
- 2026-11-11T19:08:27Z.
- What worked: (c) the preflight read each public node's id and kept two kaspads (local nodes 1 and 5); node 4 answered as the same kaspad as node 1 and got no sender. The bot's pass found every other endpoint to be a kept kaspad or silent, and wrote a legal NO SEND no-free-node. (a) Both repairs (HOLD-3 at 18:42:12Z, RETURN at 19:01:12Z) waited for the stopped senders to go, started both again, and both logged their start. (b) Every file reached origin on the first try; the retry path was only exercised offline.
- What failed: the restarted payment senders reloaded their coins from the desk node's UTXO index while their own payment chains were still in the mempool. After the HOLD-3 restart one sender saw only rejects at first, turned chaining off, ran out of coins, and exited; the other sent about 413 a minute. In RETURN one sender loaded 1 coin and the other 1,999, so about 29,913 a minute went out against 1,013 a second. HOLD-3, HOLD-4, and RETURN read low for that reason, not only for the offer. Two senders also reached the same ceiling as three in pre-run 4, about 118,000 a minute, which tracks the 2,000-coin payment pile.
- What was changed: nothing in this repo's run. The runner was not restarted and the pile was not changed. A next repo carries these lines: a payment sender that restarts mid-run must not take its pool from the confirmed UTXO set alone while its chains are in the mempool (it keeps its chain tips, or excludes coins already spent in the mempool and adds their unconfirmed change), and the even split of coins across senders is checked after a reload, not assumed. The payment ceiling is read against the pile size before a higher offer is called a node or network limit.
- Why that change stays: a restart that starts the processes but hands them spent or skewed coins still ends the load test, and a pile-bound ceiling must not be read as the network's.
```

The go files in this repo stay as they were at the start. A next repo copies this page and bakes the new lines into its own pastes.

## Locked for pre-run 6

These lines are baked into this repo's own pastes. They come from pre-run 5's worked fixes above (commit b616d11 in [tn10-storm-2026-11-11-prerun-5](https://github.com/STP-KAS/tn10-storm-2026-11-11-prerun-5)). Everything above this heading is copied without change from that commit.

- Pre-run 5 finished through RETURN and is closed. It is not resumed. Its `PRE-RUN-OPEN`, `MINI-ARMED`, `FIXES`, and `METHOD` files are history in that repo, not gates here.
- Pre-run 5's genesis coins are spent. This repo publishes fresh `hashes/SIXTEEN.md` rows from the desk node with the sixteen-family publisher. Genesis launch paths begin `launch::storm-2026-10-`. A hash is never invented. The family submit uses the bundle that wrote this repo's file. Nothing rebuilds it after the publish.
- (d) The payment pile is sized for HOLD-3. A payment coin is re-used about once a second, so one sender's ceiling is about its pool per second. The desk runner does not start the payments under 4,000 coins on the payment key (`HELD pile-short`). It logs the pile, the deal, and each sender's HOLD-3 and HOLD-4 share before the first payment. A payment ceiling is read against the pile size before it is called a node or network limit. The pile and the sender count are not changed once the payments are sending.
- (e) The payment pool survives a sender restart. A coin spent by a mempool transaction is not free, even if the UTXO index still lists it. An unspent output of one of our mempool transactions is a coin. Before the first payment and at the one repair, the runner deals the free coins evenly over the senders, in outpoint order, and each sender's loaded pool is read back and logged. The repair asks each sender to hand off its exact pool (the batch in flight finishes first); only a sender that does not hand off is killed, and then its last snapshot is used. The handed-off pools are checked against the node view, merged with the free set, and dealt again. A restarted sender never takes its pool from the confirmed UTXO list alone, and one sender never takes almost the whole pile.
- The desk runner passed a no-undef lint and an offline rehearsal on the desk before this live run: HOLD-1 scoring with its one repair inside HOLD-1, the pool handoff and the new deal at that repair, both senders sending at the offer after it, and a count-file render. The rehearsal fakes the family sender and the payment key's network (a local stand-in that rejects a coin already spent in the mempool and lists a coin in the UTXO index until its spender confirms) and sends nothing.
- Every pre-run 2, 3, 4, and 5 line above stays: no runner restart mid-run, children started detached, a family stall is not dirt, a full mempool returns the coin, the repair starts the missing senders, a failed HOLD or FAILED push is retried and leaves a local FAILED file, unique kaspads, the operator's start is the arm, Mini's clone has its git identity before its first push.
- The fee lines (100, 200, 150 sompi per gram, genesis 200), the abort line (2,500 coins and 18,000 usable tKAS), the HOLD-4 minute, the offers, and the node-set lines are not loosened.
- This repo does not edit Tuesday's repo, Wednesday's repo, or pre-run 1's, 2's, 3's, 4's, or 5's go files, and does not write `REVIEW_CLOSED`.

## Locked during pre-run 6

Nothing yet. When a fix works, append it here, one block per fix, in the form shown above: UTC time, what failed, what was changed, why that change stays.

```
- 2026-11-11T21:00:26Z.
- What worked: (d) the 6,000-coin payment pile was dealt fairly over the two senders before the first payment (3,000 / 3,000), and HOLD-1 (60,855 / 60,870 / 60,878 a minute) and HOLD-2 (120,337 / 120,999 / 122,285) met at exact pacing. (e) Both repairs used the handoff: each sender finished its batch, handed its pool over and exited, and nothing had to be killed (HOLD-3 at 20:33:12Z, pools 3,002 / 2,998; RETURN at 20:53:12Z, pools 3,000 / 3,000, 6,000 of 6,000 seen). Both senders loaded their lanes and sent again after each restart, with no reject run and no sender running dry, unlike pre-run 5. The pool was persisted and reused, and no sender took most of the pile. The bot wrote a legal NO SEND no-free-node for HOLD-4 (pinned minute 20:45Z). Every file reached origin on the first try. Both repairs were rehearsed offline first (R1 and R2) against fake nodes and a local origin, and both met HOLD-1 to HOLD-3 there.
- What failed: (1) The family sender latched off. At 20:31:18Z its node read a mempool of 90,000 or more, and the kit's sender set a one-way skip flag (NODE_SKIP reason=mempool_90k) that never clears. From then on, all 16 families stopped attempting, so every HOLD-3, HOLD-4 and RETURN minute was dirty (families-not-attempting=16). RETURN's payment minutes were on target (60,246 to 60,937), but RETURN still read NOT MET, and the payment repair could not fix it. (2) HOLD-3 read 132,439 to 144,595 a minute against 182,400. With 3,000 coins per sender, the pile was not the ceiling. The likely limit is submit latency on the two public kaspads (loops over 1 s, with each sender's due capped at 1.25 times its share). Node 1 also read as unread in some minutes. (3) At the HOLD-3 repair, the merged free set over-counted (7,018 against a 6,000 pile, while 88,930 inputs were spent in the mempool). The senders then dropped about 500 coins each as gone and saw 268 other rejects, so one lane fell to 2,864. The RETURN repair, with a quiet mempool, dealt exactly 6,000.
- What was changed: nothing in this run. The runner was not restarted, and the pile and the sender count were not changed. A next repo carries these lines: (i) a family sender's mempool skip must clear when the node's mempool falls back under the line, or the skip must apply only to payments, and a skip of the family node must be logged in phase.log as dirt with its reason; (ii) when every sender hands off, the deal takes the handoff pools as the truth and uses the merged node view only to drop spent coins, never to add coins; the deal total must not exceed the preflight pile; (iii) a higher payment offer needs more kept unique kaspads or more senders per kaspad, tested offline against a fake node with real submit latency, before the pile is raised again.
- Why that change stays: a one-way skip silently ends the family load for the rest of the run and makes every later step dirty, whatever the payments do. An over-counted deal hands senders coins that are already gone. Once the pile is big enough, the cap moves to the nodes, so more coins alone will not lift it.
```


The go files in this repo stay as they were at the start. A next repo copies this page and bakes the new lines into its own pastes.

## Locked for pre-run 7

These lines are baked into this repo's own pastes. They come from pre-run 6's worked fixes above (commit c527650 in [tn10-storm-2026-11-11-prerun-6](https://github.com/STP-KAS/tn10-storm-2026-11-11-prerun-6)). Everything above this heading is copied without change from that commit.

- Pre-run 6 finished through RETURN and is closed. It is not resumed. Its `PRE-RUN-OPEN`, `MINI-ARMED`, `FIXES`, and `METHOD` files are history in that repo, not gates here.
- Pre-run 6's genesis coins are spent. This repo publishes fresh `hashes/SIXTEEN.md` rows from the desk node with the sixteen-family publisher. Genesis launch paths begin `launch::storm-2026-10-`. A hash is never invented. The family submit uses the bundle that wrote this repo's file. Nothing rebuilds it after the publish.
- (i) The family sender's mempool skip is not one-way. kit17 (kit16 plus `mempool-skip.mjs`) clears a skip as soon as the node's mempool reads under the line again (`NODE_SKIP_CLEAR`). In this pre-run the skip does not apply to the families at all (`family_mempool_skip_line` 0): they keep attempting under any mempool, and a full mempool shows as a `mempool_full` reject. A family-node skip, if one is set, is logged in `logs/phase.log` with its reason, and every minute from `NODE_SKIP` to `NODE_SKIP_CLEAR` is dirt (`node-skip-fam:<reason>`). A mempool at or over 90,000 is logged as `NODE_MEMPOOL_HIGH` and is data, not dirt. The family sender has its own node: no third public kaspad answered in the TN10 resolver or the candidate lists, so it runs on the desk's private TN10 node, a unique synced kaspad that takes no payment submit. The locks say the two cohorts share one node set; they do not say that set is public. The families' node is sampled each minute, and an unread, unsynced, or DAA-still family node is dirt.
- (ii) When every payment sender hands off at the repair, the deal takes the handoff pools as the truth. The merged node view only drops coins it shows as spent by a mempool transaction, and never adds a coin. If a sender was killed, its last snapshot and the node's free set fill in, and the deal is capped at the preflight pile. No deal, at the start or at the repair, holds more coins than the preflight pile.
- (iii) The HOLD-3 limit moved from coins to nodes. Each kept unique kaspad gets three payment senders, each its own process, connection, and lane of coins (six on two kaspads; history: on 6 Oct six processes held 6,321 clean submit-OK tx/s, and ten were worse than six on 8 Oct). A slow submit loop may catch up to three times its share in one batch, not 1.25 times. The pile is 8,400 coins, 1,400 per sender. The first start checks that every sender logged `PAY_START` and starts any missing one once more. This was rehearsed offline against a stand-in whose connections answer in about 1-second loops before the live run.
- The desk runner passed a no-undef lint and offline rehearsals on the desk before this live run, with (i), (ii), and (iii) exercised. The rehearsal fakes the family sender and the payment key's network and sends nothing.
- Every pre-run 2, 3, 4, 5, and 6 line above stays: no runner restart mid-run, children started detached, a family stall is not dirt, a full mempool returns the coin, the repair starts the missing senders, the repair hands the pools off, a failed HOLD or FAILED push is retried and leaves a local FAILED file, unique kaspads not hostnames, the operator's start is the arm, Mini's clone has its git identity before its first push, Mini's node is started if it is down and never wiped, the desk node is never stopped by a pre-run and is started with PowerShell 7 only.
- The fee lines (100, 200, 150 sompi per gram, genesis 200), the abort line (2,500 coins and 18,000 usable tKAS), the HOLD-4 minute, the offers, and the node-set lines are not loosened.
- This repo does not edit Tuesday's repo, Wednesday's repo, or pre-run 1's, 2's, 3's, 4's, 5's, or 6's go files, and does not write `REVIEW_CLOSED`.

## Locked during pre-run 7

When a fix works, append it here, one block per fix, in the form shown above: UTC time, what failed, what was changed, why that change stays.

```
- 2026-11-11T22:14:13Z.
- What worked: (iii) three payment senders per kept kaspad on the same two public kaspads as pre-run 6. HOLD-3 met at 182,331 / 182,657 / 182,945 desk submit-OK a minute (pre-run 6: 132,439 to 144,595), and HOLD-4's pinned minute (22:09Z) read 223,569. No rejects and no dropped sockets; answer times 34 to 42 ms median. (i) The family node read a mempool of 90,000 or more once (22:02:38Z). It was logged as a mark, no skip was set, and all sixteen families kept attempting through RETURN. HOLD-1, HOLD-2, HOLD-3, and RETURN each met on their first three minutes, with no repair. Every count file reached origin on the first try. The bot filed a legal NO SEND no-free-node for HOLD-4.
- What failed: (1) Mini's node stopped validating the UTXO set from about 22:02Z under the load, so Mini's HOLD-3 (two of three minutes), HOLD-4, and RETURN files list their minutes as not read. Its heads repeat the desk's. (2) The covenant families nearly stopped landing from HOLD-2 on: floor (100 sompi/gram) and double (200) cohorts both lost to the 150 sompi/gram payments, and came back in RETURN. This is a finding, not a fault of the runner. (3) Submit-OK ran ahead of what blocks carried in HOLD-3 and HOLD-4. (ii) was not exercised live, because there was no repair.
- What was changed: nothing in this run. The runner was not restarted.
- Why that change stays: (i) and (iii) held under the first live run that used them. A next repo keeps them, and adds a counting path that keeps up under load before it calls any step above HOLD-2 a chain figure.
```

The go files in this repo stay as they were at the start. A next repo copies this page and bakes the new lines into its own pastes.

## Locked for pre-run 8

These lines are baked into this repo's own pastes. They come from pre-run 7's worked fixes above (commit 0dcd3c5 in [tn10-storm-2026-11-11-prerun-7](https://github.com/STP-KAS/tn10-storm-2026-11-11-prerun-7)). Everything above this heading is copied without change from that commit.

- Pre-run 7 finished through RETURN and is closed. It is not resumed. Its `PRE-RUN-OPEN`, `MINI-ARMED`, and `METHOD` files are history in that repo, not gates here.
- Pre-run 7's genesis coins are spent. This repo publishes fresh `hashes/SIXTEEN.md` rows from the desk node with the sixteen-family publisher. Genesis launch paths begin `launch::storm-2026-10-`. A hash is never invented. The family submit uses the bundle that wrote this repo's file. Nothing rebuilds it after the publish.
- (iv) A counting path that keeps up, or says it did not. On 2026-11-11 at 22:20Z the operator agreed that the desk's private TN10 node counts. The desk runner starts a read-only counter on that node (`tools/desk/counter.mjs`), detached, before the first family submit; no counter start line means `HELD counter-down` and no send. The counter reads the node's accepted chain (`getVirtualChainFromBlock` with accepted transaction ids), puts each accepted id in the minute of its accepting chain block's header time, and sorts it: our payments (ids the payment senders log after a submit-OK, kept in the private run folder only), our families by the fee on their submit row, coinbase (one per merged blue block), and other traffic. A removed chain block takes its counts back out. Every 10 s it reads the desk node's virtual DAA against a kept public kaspad's, and the desk sink's header age. A minute is final when a chain block 15 s past its end has been read. A minute is `LAGGING` if the DAA gap went over 100, the sink age over 30 s, or the counter read nothing for 20 s; `partial` if the counter did not read all of it. A count is never filled in. Each step file shows submit-OK and included side by side, after waiting up to 3 minutes for the counter; inclusion is reported, not scored. After RETURN the counter reads a 5-minute tail with every sender stopped, and `counts/chain/TIMELINE.md` lists every minute it read. A counter that exits mid-run is started once more (it is a reader, not a runner); its restart minute is partial. Mini is a second read, and its file head is its own read (`READ`, `PARTIAL`, `NOT READ`), never the desk's head.
- (v) Three family fee tiers. Families 1–6 (floor) pay 100 sompi/gram, 7–11 (double) 200, 12–16 (triple) 300. Payments 150, genesis 200. This changes the earlier fee line on purpose: pre-run 7 showed both 100 and 200 nearly stopping under payments at 150, and its 13/3 split left few double hops to read. One build, one builder process, the rate on each hop line, as before. The hashes file's cohort column says floor, double, or triple.
- The payment offers are not lowered. In pre-run 7 the blocks carried about 120,000–150,000 transactions a minute in all, so 1,013 sits under that, 2,027 about at it, and 3,040 and 4,053 over it. That spread is the congestion the question needs, and the counter shows which steps the blocks took. Scoring stays three clean minutes of submit-OK within 10 percent, or `NOT MET` after one repair.
- The bot: two unique public kaspads answered in every check through 2026-11-11T22:24Z, and the desk keeps both. The bot keeps its HOLD-4 rule and is expected to write `NO SEND no-free-node`. A third kaspad is used only if it answers synced with its own node id in the bot's pass.
- The desk runner passed a no-undef lint and an offline rehearsal on the desk before this live run, with (iv) and (v) exercised against a stand-in with block space under the HOLD-3 offer, a desk view that lags inside HOLD-2, and the submit latency of pre-run 7's rehearsal. It sends nothing to the network.
- Every pre-run 2 to 7 line above stays: no runner restart mid-run, children started detached, a family stall is not dirt, a full mempool returns the coin, the repair starts the missing senders, the repair hands the pools off and never deals more than the pile, a failed HOLD or FAILED push is retried and leaves a local FAILED file, unique kaspads not hostnames, three payment senders per kept kaspad, the family mempool skip does not apply to the families, the operator's start is the arm, Mini's clone has its git identity before its first push, Mini's node is started if it is down and never wiped, the desk node is never stopped by a pre-run and is started with PowerShell 7 only.
- The abort line (2,500 coins and 18,000 usable tKAS), the HOLD-4 minute, the offers, and the node-set lines are not loosened.
- This repo does not edit Tuesday's repo, Wednesday's repo, or pre-run 1's to 7's go files, and does not write `REVIEW_CLOSED`.

## Locked during pre-run 8

When a fix works, append it here, one block per fix, in the form shown above: UTC time, what failed or worked, what was changed, why that change stays.

```
- 2026-11-11T23:43:39Z.
- What worked: (iv) the desk's private TN10 node counted every minute from the counter's start to the end of the 5-minute tail. No minute was LAGGING: DAA gap at most 7 against the kept public kaspad, sink age at most about 1.2 s, each minute final about 20 s after its end. Every step file has submit-OK and included side by side. (v) The three tiers were verified on the submit rows (FEE_SPLIT 100/200/300) and read apart on the chain: at every congested step triple landed more than double and double more than floor. (iii) and (i) held again: six senders on two unique kaspads, HOLD-1, HOLD-2, HOLD-3 and RETURN met on their first three minutes, HOLD-4 read 234,063, no repair, every count file on origin on the first try. The bot filed a legal NO SEND no-free-node. The run needed one local fix before it opened: the desk's private run folder had no candidates file (the first open read HELD desk-node-down preflight-unread); pre-run 7's candidate list was copied in, private, and the open passed.
- What failed: nothing in the runner. Findings: blocks took about 110,000-132,000 accepted transactions a minute, so HOLD-3 and HOLD-4 built a backlog that drained through RETURN and the tail; from HOLD-2 on even the triple tier (twice the payment fee) fell to a fraction of its HOLD-1 rate, and the floor families stopped from 23:29Z. Mini read every minute but counts above the desk (it keys by block and id and does not take removed chain blocks out), so it is not a comparable second read.
- What was changed: nothing in this run. The runner was not restarted.
- Why that change stays: (iv) kept pace under the heaviest load this rehearsal has offered, so a next repo keeps the desk counter as the inclusion figure. A next repo checks its private candidates file in the open gate before it reads the node as down.
```

## Locked for pre-run 9

These lines are baked into this repo's own pastes. They come from pre-run 8's lessons and lock block (commit 9d46b1a in [tn10-storm-2026-11-11-prerun-8](https://github.com/STP-KAS/tn10-storm-2026-11-11-prerun-8)). Everything above this heading is copied without change from that commit.

- Pre-run 8 finished through RETURN and is closed. It is not resumed. Its `PRE-RUN-OPEN`, `MINI-ARMED`, and `METHOD` files are history in that repo, not gates here.
- Pre-run 8's genesis coins are spent. This repo publishes fresh `hashes/SIXTEEN.md` rows from the desk node with the sixteen-family publisher, before arming. Genesis launch paths begin `launch::storm-2026-10-`. A hash is never invented.
- (vi) Five family cohorts, one build. Floor (families 1–4) 100 sompi/gram, double (5–7) 200, triple (8–10) 300, triple-pub (11–13) 300, high (14–16) 1000. Payments 150, genesis 200. Triple-pub reads, catches up and submits on the kept public kaspads, round-robin, so it shares the payments' path; the other cohorts stay on the desk's private node. The family sender logs `FAMILY_PATH` and every row carries its path; the runner fails the run on a rate or path mismatch. This changes (v) on purpose: pre-run 8 could not tell fee from path.
- (vii) The offers are reshaped on purpose: HOLD-1 1,013, HOLD-2 1,800, HOLD-3 2,500, then the payment rate drops to 1,013 as soon as HOLD-3 is scored; the HOLD-4 observation minute and RETURN run at 1,013. Reason: pre-run 8's blocks took about 110,000–132,000 transactions a minute, so 1,800 is about at capacity and 2,500 over it, and pre-run 8's long over-capacity stretch crowded out other TN10 users. Scoring is unchanged: three clean minutes of submit-OK, or `NOT MET` after one repair. Each step file also says in how many minutes our payments were included within 10 percent of submit-OK, reported and not scored.
- (viii) The desk's private candidate list is an open check: absent or empty means `HELD candidates-missing`.
- (ix) Mini's second read counts each transaction id once and takes a removed chain block's transactions back out of a minute still open. Checked offline before the run. The desk counter stays the inclusion figure.
- The selection rule of the kaspad in use (rusty-kaspa v2.1.0, commit 01b532e) was read before the run and is cited in [plan/PLAN.md](../plan/PLAN.md#selection-rule) and `logs/METHOD.md`.
- The desk runner passed a no-undef lint and an offline rehearsal on the desk before this live run (2026-11-12 00:40Z–01:04Z): five cohorts and paths checked, HOLD-2 under and HOLD-3 over the stand-in's block space, a lagging desk view inside HOLD-2, the drop to 1,013 after HOLD-3, through RETURN, the tail, TIMELINE and METHOD. It sent nothing to the network.
- Every pre-run 2 to 8 line above stays: no runner restart mid-run, children started detached, a family stall is not dirt, a full mempool returns the coin, the repair starts the missing senders and hands the pools off, a failed HOLD or FAILED push is retried with a local FAILED file, unique kaspads, the desk counter, the desk node is never stopped.
- The abort line (2,500 coins and 18,000 usable tKAS), the HOLD-4 minute, and the node-set lines are not loosened.
- This repo does not edit Tuesday's repo, Wednesday's repo, or pre-run 1's to 8's go files, and does not write `REVIEW_CLOSED`.

## Locked during pre-run 9

When a fix works, append it here, one block per fix, in the form shown above: UTC time, what failed or worked, what was changed, why that change stays.
