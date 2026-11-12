> **Experimental. We are just trying this.** [Disclaimer](../../DISCLAIMER.md) · Counts only. No key, seed, txid, covenant id, address, host, or port.
>
> The desk's sender log and the desk counter's chain read for pre-run 9. It is not Wednesday's count.

# Desk sender log and chain read

The files are absent until each step closes. None is written before `hashes/SIXTEEN.md` has an On origin line.

| File | Target |
|---|---|
| HOLD-1.md | 1,013 tx/s |
| HOLD-2.md | 1,800 tx/s |
| HOLD-3.md | 2,500 tx/s |
| HOLD-4.md | one observation minute at 1,013 tx/s. The first line is `OBSERVATION` |
| RETURN.md | 1,013 tx/s again |

A row is submit-OK, attempts, rejects split into rate and full, and the waiting count per cohort. Each file also states the hop rate per cohort as built and path (100 for families 1–4, 200 for 5–7, 300 for 8–10, 300 for 11–13 on the public path, 1000 for 14–16) and whether the funding coins were one size, as read from the node. If they were not, it gives the sizes seen, rounded to whole tKAS, and does not call the fee the whole cause. A size is never guessed. Public nodes are local numbers. The paste is [GO-DESK.md](../../GO-DESK.md).

Pre-run 9 (lock line (iv)): each file also carries what the desk's private TN10 node accepted on chain, per minute, by accepting chain block header time: our payments, hops per cohort, other traffic, chain blocks, the desk node's DAA gap against a kept public kaspad, its sink age, and whether the counter kept pace. A lagging, partial, or not-final minute is marked and never filled in. Under the head, one line says in how many minutes our included payments were within 10 percent of submit-OK. It is reported, not scored. The whole run is in [counts/chain/TIMELINE.md](../chain/README.md).
