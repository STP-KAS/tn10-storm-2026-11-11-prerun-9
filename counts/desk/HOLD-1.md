MET

Scored on submit-OK, not on inclusion. Inclusion, reported and not scored: in 3 of 3 minutes our payments included (desk counter) were within 10 percent of submit-OK.

# HOLD-1, desk, pre-run 9

> Counts only. Submit-OK is the desk's sender log. Included is what the desk's private TN10 node accepted on chain, read by the desk counter, by accepting chain block time. Mini's files are a second read.

Payment offer 1,013 tx/s at 150 sompi/gram, from 6 payment senders, 3 per kept public node (2 unique kaspads), each its own process and connection. Families offer 1.2 hop/s, 16 families live, one family-sender process and one builder: floor (families 1–4) 100 sompi/gram on the desk's private node, double (families 5–7) 200 sompi/gram on the desk's private node, triple (families 8–10) 300 sompi/gram on the desk's private node, triple-pub (families 11–13) 300 sompi/gram on the kept public kaspads, high (families 14–16) 1000 sompi/gram on the desk's private node (public map 11:public-1,12:public-5,13:public-1).

Payment pile: 8,400 coins on the payment key at the preflight, dealt evenly over the 6 senders before the first payment (last deal, start: 8,400 coins in all, 1,400 / 1,400 / 1,400 / 1,400 / 1,400 / 1,400, even). A deal never holds more coins than the preflight pile. A coin is re-used about once a second, so one sender's ceiling is about its pool per second.

## Submit-OK and included, per minute

| Minute (UTC) | Pay submit-OK | Our payments included | Included, all non-coinbase | Counter |
|---|---:|---:|---:|---|
| 2026-11-12T01:13 | 60,736 | 60,638 | 64,251 | kept pace |
| 2026-11-12T01:14 | 60,681 | 60,732 | 64,338 | kept pace |
| 2026-11-12T01:15 | 60,800 | 61,401 | 65,019 | kept pace |

Submit-OK counts in the minute a submit was answered. Included counts in the minute of the chain block that accepted it, so a payment submitted late in one minute can be included in the next. "Kept pace" means the desk node's DAA stayed within 100 of the kept public kaspad and its sink was under 30 s old in every sample of that minute; "LAGGING" means it did not, and the count is what the node had accepted, not a network figure.

## Chain, desk counter

| Minute (UTC) | Included, all non-coinbase | Our payments included | Floor hops (100) | Double hops (200) | Triple hops (300) | Triple-pub hops (300, public) | High hops (1000) | Other traffic | Chain blocks | DAA gap max | Sink age max, ms | Final after, s | Counter |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 2026-11-12T01:13 | 64,251 | 60,638 | 126 | 102 | 114 | 158 | 134 | 3,035 | 321 | 1 | 495 | 19 | kept pace |
| 2026-11-12T01:14 | 64,338 | 60,732 | 125 | 101 | 112 | 150 | 139 | 3,037 | 318 | 2 | 700 | 20 | kept pace |
| 2026-11-12T01:15 | 65,019 | 61,401 | 122 | 99 | 117 | 150 | 147 | 3,027 | 304 | 1 | 495 | 20 | kept pace |

Coinbase is taken out as one per merged blue block (on this node a chain block's accepted list carries the coinbase of each blue block it merges). Other traffic is the rest: other users' load, the genesis, and anything not in our logs.

## Hop rate per cohort, as built

Floor (families 1–4, desk private node): 100 sompi/gram per hop. Double (families 5–7, desk private node): 200 sompi/gram per hop. Triple (families 8–10, desk private node): 300 sompi/gram per hop. Triple-pub (families 11–13, kept public kaspads): 300 sompi/gram per hop. High (families 14–16, desk private node): 1000 sompi/gram per hop. The rate rides on each hop line to the one builder. Payments pay 150.

## Funding coins, as read from the desk node

The funding coins were not one size. Sizes seen, whole tKAS (coins): 30 (933), 31 (826), 29 (807), 32 (591), 28 (544), 33 (403), 27 (296), 34 (268), 35 (166), 26 (114), 36 (98), 37 (58), and 59 more sizes. The fee is not called the whole cause.

## Minutes

| Minute (UTC) | Pay submit-OK | Attempts | Rejects, rate | Rejects, full | Other | Floor OK / att / rate rej / full rej / waiting | Double OK / att / rate rej / full rej / waiting | Triple OK / att / rate rej / full rej / waiting | Triple-pub OK / att / rate rej / full rej / waiting | High OK / att / rate rej / full rej / waiting | Family stalls logged | Family node mempool-high marks | Clean |
|---|---:|---:|---:|---:|---:|---|---|---|---|---|---:|---:|---|
| 2026-11-12T01:13 | 60,736 | 60,736 | 0 | 0 | 0 | 127 / 337 / 0 / 0 / 4 | 103 / 256 / 0 / 0 / 3 | 115 / 260 / 0 / 0 / 3 | 158 / 272 / 0 / 0 / 13 | 134 / 274 / 0 / 0 / 3 | 0 | 0 | yes |
| 2026-11-12T01:14 | 60,681 | 60,681 | 0 | 0 | 0 | 125 / 339 / 0 / 0 / 4 | 101 / 255 / 0 / 0 / 3 | 112 / 258 / 0 / 0 / 3 | 150 / 266 / 0 / 0 / 13 | 139 / 269 / 0 / 0 / 3 | 0 | 0 | yes |
| 2026-11-12T01:15 | 60,800 | 60,800 | 0 | 0 | 0 | 122 / 328 / 0 / 0 / 4 | 99 / 251 / 0 / 0 / 3 | 117 / 259 / 0 / 0 / 3 | 148 / 267 / 0 / 0 / 11 | 147 / 280 / 0 / 0 / 3 | 0 | 0 | yes |

A family stall is a coordinator mark: no hop of that family landed for a while. The family was still attempting. It is logged, and it does not make the minute dirty.

A mempool-high mark means the family node read a mempool at or over 90,000. In pre-run 9 that does not stop the families: the skip does not apply to them. A skip, if one were set, is dirt with its reason (node-skip-fam) for every minute it covers, and it clears when the mempool falls back under the line.

Within 10 percent means 54,702 to 66,858 submit-OK in the minute.

## Public nodes (local numbers)

Kept: 1, 5. The family sender reads and submits floor, double, triple and high on the desk's private node, which takes no payment submit and which the desk counter reads; triple-pub (11:public-1,12:public-5,13:public-1) reads and submits on kept public kaspads, the payments' nodes.

Kept nodes are unique kaspads: each answered with its own node id at the preflight. 3 candidate endpoints passed the check and were 2 kaspads (node 4 is node 1; the second hostname was not used). 3 payment senders per kaspad.

| Node | Synced every sample | Last DAA | Pay submit-OK | Pay rejects | Dropped sockets | Answer ms, median |
|---:|---|---:|---:|---:|---:|---:|
| 1 | yes | 621099753 | 91,289 | 0 | 0 | 33 |
| 5 | yes | 621099753 | 90,928 | 0 | 0 | 38 |

## Payment senders

| Sender | Node | Pay submit-OK | Rejects | Minutes with a row |
|---|---:|---:|---:|---:|
| 1.1 | 1 | 30,533 | 0 | 3 of 3 |
| 1.2 | 1 | 30,363 | 0 | 3 of 3 |
| 1.3 | 1 | 30,393 | 0 | 3 of 3 |
| 5.1 | 5 | 30,374 | 0 | 3 of 3 |
| 5.2 | 5 | 30,383 | 0 | 3 of 3 |
| 5.3 | 5 | 30,171 | 0 | 3 of 3 |

## Hop submit to landing, per cohort

| Cohort | Landed of OK | Median ms | Slow tail (p95) ms |
|---|---:|---:|---:|
| floor | 374 of 374 | 1596 | 2901 |
| double | 303 of 303 | 1446 | 2726 |
| triple | 344 of 344 | 1327 | 2299 |
| triple-pub | 456 of 456 | 939 | 2002 |
| high | 420 of 420 | 1111 | 1659 |

Landing is the accepting block header time the desk's coordinator read. Waiting is submitted-OK not yet landed at the minute's end. Triple and triple-pub pay the same rate; they differ only in the node a hop is read and submitted on.
