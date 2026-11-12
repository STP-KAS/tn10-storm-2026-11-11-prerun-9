> **Experimental. We are just trying this.** [Disclaimer](../../DISCLAIMER.md) · Kaspa Testnet-10 only. No key, id, address, host, or port in these files.

# Mini's second read, pre-run 9

- `mini-runner.mjs`: pre-run 8's Mini counter, pointed at this repo and the pre-run 9 offers, counting the five cohorts. Changed: it counts each accepted transaction id once (`mini-dedupe.mjs`), and when the node reports a removed chain block it takes that block's transactions back out of a minute that is still open; a removal after the minute is closed is counted as late, not applied.
- `mini-dedupe.mjs`: the txid set behind that.
- `mini-dedupe-test.mjs`: the offline check. A chain block is removed and its ids are accepted again by another block; an id is delivered twice; a block is removed and its id lands in another minute; an unknown block is removed. Each id must be counted once, in the minute that holds it last. It passed on the box before the run (4 ids, 1 duplicate skipped, 3 removed).

Pre-run 8's Mini counter keyed a transaction by accepting block and id and did not take removed chain blocks back out, so its figures sat above the desk's (hop counts about twice). This fix is meant to make the second read comparable, not to replace the desk counter.
