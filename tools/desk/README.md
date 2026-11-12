> **Experimental. We are just trying this.** [Disclaimer](../../DISCLAIMER.md) · Kaspa Testnet-10 only. No key, id, address, host, or port in these files.

# Desk runner, pre-run 9

Pre-run 8's runner, counter and senders, with the pre-run 9 changes (see the pre-run 9 section of [locks/LOCKED.md](../../locks/LOCKED.md)).

- `desk-runner.mjs`: five cohorts (floor 1–4 at 100, double 5–7 at 200, triple 8–10 at 300, triple-pub 11–13 at 300 on the public path, high 14–16 at 1000). Offers HOLD-1 1,013, HOLD-2 1,800, HOLD-3 2,500, then the rate drops to 1,013 as soon as HOLD-3 is scored; HOLD-4 and RETURN at 1,013. It writes the triple-pub node map into the private run config (round-robin over the kept kaspads), checks the family sender's `FEE_SPLIT` and `FAMILY_PATH` lines and every submit row's rate and path, and fails the run on a mismatch. Preflight says `HELD candidates-missing` if the private candidate list is absent or empty. Each step file has per-cohort columns, and one line under the head on how many minutes our payments were included within 10 percent of submit-OK. A genesis hold also stops the counter.
- `counter.mjs`: pre-run 8's read-only counter on the desk's private node, sorting family hops into the five cohorts.
- `pay2.mjs`, `paypool.mjs`, `preflight.mjs`: pre-run 8's, unchanged.

The family sender itself is kit19, which stays on the desk; its change is [tools/sixteen/kit19-public-path.patch](../sixteen/kit19-public-path.patch).

Everything pre-run 8's runner did stays: one runner, detached children, unique kaspads, three senders per kaspad, the fair deal and the handoff repair, git retries with a local FAILED file, never restarted mid-run.
