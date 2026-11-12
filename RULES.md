> **Experimental. We are just trying this.** [Disclaimer](DISCLAIMER.md) · Counts only.
>
> This page is the rule for pre-run 9. It does not start a machine. It does not arm Wednesday.

# Rules

The headmaster rule is [tn-master docs/NEURON.md](https://github.com/STP-KAS/tn-master/blob/main/docs/NEURON.md).

This repo is pre-run 9 of the Wednesday neuron. It is not that neuron. It is not Tuesday. It is not pre-run 1, 2, 3, 4, 5, 6, 7, or 8, and it does not resume any of them. Their `PRE-RUN-OPEN`, `MINI-ARMED`, `BOT-HALT`, and `FAILED` files are history in those repos. They are not gates here.

For pre-run 9 the operator does not paste. On 2026-11-12 at 01:27 Brussels time he said to go with pre-run 9. That instruction is the arm. The agents on the desk, Mini, and the bot start their own runners once the gates are facts. A sentence in chat still does not write `PRE-RUN-OPEN`: the desk runner writes it after its gates. One runner on the desk. One runner on Mini. One runner on the bot, and it sends payments only in the HOLD-4 minute.

There is no clock. There is no T0, no public window, and no latest minute. The run follows gates and targets:

1. Nodes live. Mini's existing TN10 node and the desk's existing private TN10 node are up from their own data, not wiped, synced, with DAA moving. Mini has notified Build and TN10 ops. The desk node is started with PowerShell 7 (`pwsh`), never Windows PowerShell 5.1. `KaspaPublicNode` is not started. The desk devnet is left alone.
2. The arm. The operator's instruction to start everything. No paste.
3. Hashes first. `hashes/SIXTEEN.md`, sixteen rows, with an On origin line, before any family submit. The old 8- or 32-family hash publisher is not used.
4. Families, then payments step by step, as [plan/PLAN.md](plan/PLAN.md) says.

The desk publishes [counts/desk/](counts/desk/README.md) and [counts/chain/](counts/chain/README.md), the desk counter's read (lock line (iv)). Mini publishes [counts/mini/](counts/mini/README.md). The bot publishes [counts/bot/HOLD-4.md](counts/bot/README.md). Each machine writes only its own folder.

The desk node stays up. This pre-run does not stop the desk node process and does not wipe chain data on any machine.

A fix that works is appended to [locks/LOCKED.md](locks/LOCKED.md). The pastes in this repo stay as they were at the arm. A next pre-run is a new repo and starts from that lock file.

TN10 only. Never mainnet. Counts only. No key, seed, txid, covenant id, address, host, port, or IP. A Windows profile path, if one must appear, is written as `C:\Users\Fermi\...`.

Call git by its full path. Empty output is a failed read. One commit per file. If a push of a HOLD file or of `logs/FAILED.md` fails, the runner retries the fetch and the push. If it still fails, it leaves a local FAILED file and the operator publishes it. A fetch or push error does not leave a dead run unmarked on origin.
