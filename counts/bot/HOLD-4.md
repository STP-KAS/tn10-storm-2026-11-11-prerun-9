NO SEND no-free-node

# HOLD-4, bot sender log, pre-run 9

> Counts only. The bot's sender log. It is not a chain count. The desk counter and Mini count the chain.

Pinned minute (UTC): 2026-11-12T01:28. It is the first whole UTC minute whose start is at least 3 minutes after the desk's HOLD-3 file's On origin time, 2026-11-12T01:24:22Z (commit 5471efe). Fee 150 sompi/gram. Own coins only.

The bot sent nothing in this minute. Submit-OK 0, attempts 0, rejects rate 0, full 0.

## Why there was no free node

The desk kept public nodes 1, 5 (local numbers) through HOLD-4. The bot's local config holds the desk's other candidates and three more public endpoints. They were read at 2026-11-12T01:27:30Z, before the minute:

| Node (bot label) | In the desk's kept set | Answered | Synced, DAA moving | Same kaspad as a kept node |
|---|---|---|---|---|
| desk 1 | yes | yes | yes | — |
| desk 2 | no | no | — | — |
| desk 3 | no | no | — | — |
| desk 4 | no | yes | yes | yes |
| desk 5 | yes | yes | yes | — |
| extra 1 | no | yes | yes | yes |
| extra 2 | no | yes | yes | yes |
| extra 3 | no | yes | yes | yes |

Same kaspad means the same node id, read in the same pass, as a node in the kept set. A send there is a send on a node the desk is still using, and a second process on that node. GO-BOT says to skip a node that does not answer synced and not to take a node the desk is still using. Nothing was left, so the line is `NO SEND` and `no-free-node`. The bot did not wait for a node to appear. Coins were not the reason.

No txid, key, seed, address, host, port, or covenant id is in this file.
