> **Experimental. We are just trying this.** [Disclaimer](../../DISCLAIMER.md) · Counts only. No key, seed, txid, covenant id, address, host, or port.
>
> The desk counter's chain timeline for pre-run 9. Written by the desk runner after RETURN and a 5-minute tail.

# Chain timeline

One file, `TIMELINE.md`, absent until the tail after RETURN is read.

Every minute the desk counter read on the desk's private TN10 node, by accepting chain block header time: all accepted non-coinbase transactions, our payments, floor (100), double (200), triple (300), triple-pub (300, public path), and high (1000) family hops, other traffic, chain blocks, the desk node's DAA gap against a kept public kaspad, its sink age, and whether the counter kept pace. A minute marked `LAGGING`, `partial`, or `not final` is what the node had accepted then, not a network figure. Nothing is filled in. The tool is [tools/desk/counter.mjs](../../tools/desk/counter.mjs).
