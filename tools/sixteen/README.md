> **Experimental. We are just trying this.** [Disclaimer](../../DISCLAIMER.md) · Kaspa Testnet-10 only. No covenant id, key, address, host, or port in this folder.
>
> This folder is a tool. Reading it does not start a machine, arm a runner, or send.

# Sixteen-family hash path

This is the desk's path to [hashes/SIXTEEN.md](../../hashes/README.md) for pre-run 9 (first written for pre-run 6), and the family start that uses it. It is not the old desk publisher, which writes 8 or 32 families and is not used here.

| File | What it does |
|---|---|
| `sixteen-format.mjs` | The one shape of `SIXTEEN.md`: sixteen rows, family label, cohort, sha256 of the lowercase hex covenant id, a Fixed line, then an On origin line. Floor is families 1–4, double 5–7, triple 8–10, triple-pub 11–13, high 14–16. |
| `hash-sixteen.mjs` | Reads the family coins from the desk's own synced TN10 node, builds the sixteen genesis transactions in one reference builder, and writes the rows. It does not submit. It keeps the built transactions in a private bundle on the desk. |
| `publish-sixteen.mjs` | Reads the stop files from origin, pushes the rows (`Publish the sixteen family-id hashes.`), reads that commit's time back from origin, and pushes the On origin line (`Record the origin time of the sixteen family-id hashes.`). |
| `sixteen.ps1` | The desk wrapper. PowerShell 7 only. `-Mode check` builds and verifies locally and pushes nothing. `-Mode publish` builds once from the coins on the node at that moment, verifies, and publishes. |
| `submit-sixteen.mjs` | The family start, run by the armed desk runner only. It submits the sixteen genesis transactions from the bundle that wrote `SIXTEEN.md`, and writes each family's state with its hop rate. `--dry` checks everything and submits nothing. |
| `family-fees.mjs` | The hop rate and submit path per family: 100 for families 1–4, 200 for 5–7, 300 for 8–10, 300 for 11–13 on the public path, 1000 for 14–16. Payments 150. Genesis 200. |
| `fee-check.mjs` | The proof of the fee split. Submits nothing. |
| `builder-hop-rate.patch` | The change to the reference builder: an optional rate on each hop line. |
| `kit16-hop-rate.patch` | The change to the desk family sender (kit15 to kit16): each hop carries its family's rate. |
| `kit19-public-path.patch` | The pre-run 9 change to the family sender (kit18 to kit19): families named in the private config read, catch up and submit on a public kaspad; every row carries its path; one `FAMILY_PATH` line. |

The private config, the key file, the node address, the bundle, and the kit stay on the desk. They are not in this repo.

## Hashes first

`SIXTEEN.md` lands before the paste. It is not an arm and not a send. `publish-sixteen.mjs` does not wait for `logs/PRE-RUN-OPEN.md` or `logs/MINI-ARMED.md`. It reads them and reports them, and that is all.

It writes nothing if any of these is true on `origin/main`:

- `logs/BOT-HALT.md` is there.
- `logs/FAILED.md` is there.
- `hashes/SIXTEEN.md` is already there. It is not republished.

The file must verify, every row must match the private bundle, and a format-check fixture is refused for a GitHub origin. Git is called by its full path. If a push fails, the tool rebases on origin and tries once more. If that fails too, it stops and says the git error.

After a publish, nothing rebuilds the bundle. A rebuilt bundle gives other rows, and `submit-sixteen.mjs` refuses it.

## Nothing sends before the file

`submit-sixteen.mjs` submits nothing unless all of these hold:

- Origin has `hashes/SIXTEEN.md` with sixteen rows and an On origin line, and every row is the sha256 of this bundle's covenant id.
- Origin has `logs/PRE-RUN-OPEN.md` and `logs/MINI-ARMED.md`. That is the arm.
- Origin has no `logs/BOT-HALT.md` and no `logs/FAILED.md`.
- The run config says 100 for families 1–4, 200 for 5–7, 300 for 8–13, and 1000 for 14–16.
- The node is testnet-10 and synced, and every bundle funding coin is still unspent on it.

If a funding coin is gone, the published hashes cannot land. The run fails, and a next repo rebuilds. Until the family submit, nothing on the desk spends the sixteen funding coins in the bundle. The bot's paste already waits for `SIXTEEN.md` on origin.

## Builder launch path

The reference builder builds a genesis only when the launch path starts with `launch::storm-2026-10-`. Anything else is refused with `launch path not on the storm allow-list`. Pre-run 1's hash step used a `launch::prerun1-…` path, and that refusal was its `HASH_STOP build`. `hash-sixteen.mjs` checks the prefix before it reads the node. This line is in [locks/LOCKED.md](../../locks/LOCKED.md).

## Hop fees

Before this change, one builder process had one rate (`STORM_FEE_RATE`), and each hop started from a 5,000,000 sompi fee. The fee rose only when mass times rate was higher. A pre-run hop's mass is 13,046, so mass times 200 is 2,609,200. Every hop paid the flat 5,000,000 sompi at 100 or at 200, so there was no fee difference between the cohorts.

With `builder-hop-rate.patch`, a hop line may end with its own rate. The fee is then exactly mass times that rate. The builder echoes the rate back, and kit16 refuses a builder that does not, so an old builder cannot silently pay one rate. Without the rate, a hop is built as before. Genesis is unchanged: the patched builder gave the same sixteen genesis rows as the old one on the same coins.

kit16 is kit15 with `kit16-hop-rate.patch`. The one family-sender process and the one builder carry every cohort, and each hop carries `familyRate(family)`. The sender does not start if the run config's family fees are not 100 and 200. Each submit row logs the rate and the fee.

`fee-check.mjs` on the desk, offline, in one builder process, from a check bundle and a dummy funding coin, built hops for families 1, 13, 14, and 16:

| Family | Cohort | Rate | Mass | Fee, sompi |
|---:|---|---:|---:|---:|
| 1 | floor | 100 | 13,046 | 1,304,600 |
| 13 | floor | 100 | 13,046 | 1,304,600 |
| 14 | double | 200 | 13,046 | 2,609,200 |
| 16 | double | 200 | 13,046 | 2,609,200 |

The old builder, given the same hop line, paid 5,000,000 and echoed no rate, so kit16 refuses it. Nothing was submitted.

## Coin sizes

`hash-sixteen.mjs` reports `coins_one_size`. On 11 Nov the sixteen genesis coins were not one size. The desk count files say whether the funding coins were one size, as read from the node. A size is never guessed.

## Checked on the desk, 11 Nov 2026

`-Mode check` on the desk, against its own synced TN10 node, built sixteen genesis transactions and wrote sixteen rows locally. The file verified, and the rows matched the bundle. Two builds on the same coins gave the same rows. Nothing was submitted.

## Pre-run 9 fee check

`fee-check.mjs --builder` on the desk, offline, one builder process, check bundle and dummy funding coin, built hops for families 1, 4, 5, 8, 11, 14, and 16 and checked that each fee is exactly the hop mass (13,046) times its family's rate: 1,304,600 at 100, 2,609,200 at 200, 3,913,800 at 300 (triple and triple-pub alike), 13,046,000 at 1000. It passed. Nothing was submitted.
