MET

Scored on submit-OK, not on inclusion. Inclusion, reported and not scored: in 3 of 3 minutes our payments included (desk counter) were within 10 percent of submit-OK.

# HOLD-2, desk, pre-run 9

> Counts only. Submit-OK is the desk's sender log. Included is what the desk's private TN10 node accepted on chain, read by the desk counter, by accepting chain block time. Mini's files are a second read.

Payment offer 1,800 tx/s at 150 sompi/gram, from 6 payment senders, 3 per kept public node (2 unique kaspads), each its own process and connection. Families offer 1.2 hop/s, 16 families live, one family-sender process and one builder: floor (families 1–4) 100 sompi/gram on the desk's private node, double (families 5–7) 200 sompi/gram on the desk's private node, triple (families 8–10) 300 sompi/gram on the desk's private node, triple-pub (families 11–13) 300 sompi/gram on the kept public kaspads, high (families 14–16) 1000 sompi/gram on the desk's private node (public map 11:public-1,12:public-5,13:public-1).

Payment pile: 8,400 coins on the payment key at the preflight, dealt evenly over the 6 senders before the first payment (last deal, start: 8,400 coins in all, 1,400 / 1,400 / 1,400 / 1,400 / 1,400 / 1,400, even). A deal never holds more coins than the preflight pile. A coin is re-used about once a second, so one sender's ceiling is about its pool per second.

## Submit-OK and included, per minute

| Minute (UTC) | Pay submit-OK | Our payments included | Included, all non-coinbase | Counter |
|---|---:|---:|---:|---|
| 2026-11-12T01:17 | 107,859 | 105,299 | 108,389 | kept pace |
| 2026-11-12T01:18 | 107,573 | 110,240 | 113,495 | kept pace |
| 2026-11-12T01:19 | 107,985 | 108,927 | 112,250 | kept pace |

Submit-OK counts in the minute a submit was answered. Included counts in the minute of the chain block that accepted it, so a payment submitted late in one minute can be included in the next. "Kept pace" means the desk node's DAA stayed within 100 of the kept public kaspad and its sink was under 30 s old in every sample of that minute; "LAGGING" means it did not, and the count is what the node had accepted, not a network figure.

## Chain, desk counter

| Minute (UTC) | Included, all non-coinbase | Our payments included | Floor hops (100) | Double hops (200) | Triple hops (300) | Triple-pub hops (300, public) | High hops (1000) | Other traffic | Chain blocks | DAA gap max | Sink age max, ms | Final after, s | Counter |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 2026-11-12T01:17 | 108,389 | 105,299 | 16 | 25 | 48 | 51 | 130 | 2,824 | 279 | 1 | 486 | 20 | kept pace |
| 2026-11-12T01:18 | 113,495 | 110,240 | 5 | 17 | 31 | 37 | 127 | 3,044 | 265 | 1 | 685 | 20 | kept pace |
| 2026-11-12T01:19 | 112,250 | 108,927 | 26 | 34 | 51 | 59 | 128 | 3,034 | 285 | 0 | 340 | 21 | kept pace |

Coinbase is taken out as one per merged blue block (on this node a chain block's accepted list carries the coinbase of each blue block it merges). Other traffic is the rest: other users' load, the genesis, and anything not in our logs.

## Hop rate per cohort, as built

Floor (families 1–4, desk private node): 100 sompi/gram per hop. Double (families 5–7, desk private node): 200 sompi/gram per hop. Triple (families 8–10, desk private node): 300 sompi/gram per hop. Triple-pub (families 11–13, kept public kaspads): 300 sompi/gram per hop. High (families 14–16, desk private node): 1000 sompi/gram per hop. The rate rides on each hop line to the one builder. Payments pay 150.

## Funding coins, as read from the desk node

The funding coins were not one size. Sizes seen, whole tKAS (coins): 30 (910), 29 (805), 31 (794), 28 (575), 32 (551), 33 (370), 27 (331), 34 (248), 26 (188), 35 (151), 36 (94), 25 (76), and 56 more sizes. The fee is not called the whole cause.

## Minutes

| Minute (UTC) | Pay submit-OK | Attempts | Rejects, rate | Rejects, full | Other | Floor OK / att / rate rej / full rej / waiting | Double OK / att / rate rej / full rej / waiting | Triple OK / att / rate rej / full rej / waiting | Triple-pub OK / att / rate rej / full rej / waiting | High OK / att / rate rej / full rej / waiting | Family stalls logged | Family node mempool-high marks | Clean |
|---|---:|---:|---:|---:|---:|---|---|---|---|---|---:|---:|---|
| 2026-11-12T01:17 | 107,859 | 107,859 | 0 | 0 | 0 | 16 / 289 / 0 / 0 / 4 | 25 / 228 / 0 / 0 / 3 | 48 / 230 / 0 / 0 / 3 | 51 / 231 / 0 / 0 / 13 | 130 / 268 / 0 / 0 / 3 | 0 | 0 | yes |
| 2026-11-12T01:18 | 107,573 | 107,573 | 0 | 0 | 0 | 5 / 285 / 0 / 0 / 4 | 17 / 219 / 0 / 0 / 3 | 31 / 225 / 0 / 0 / 3 | 37 / 226 / 0 / 0 / 13 | 127 / 266 / 0 / 0 / 3 | 4 | 0 | yes |
| 2026-11-12T01:19 | 107,985 | 107,985 | 0 | 0 | 0 | 26 / 293 / 0 / 0 / 4 | 34 / 228 / 0 / 0 / 3 | 51 / 234 / 0 / 0 / 3 | 59 / 238 / 0 / 0 / 13 | 128 / 271 / 0 / 0 / 3 | 0 | 0 | yes |

A family stall is a coordinator mark: no hop of that family landed for a while. The family was still attempting. It is logged, and it does not make the minute dirty.

A mempool-high mark means the family node read a mempool at or over 90,000. In pre-run 9 that does not stop the families: the skip does not apply to them. A skip, if one were set, is dirt with its reason (node-skip-fam) for every minute it covers, and it clears when the mempool falls back under the line.

Within 10 percent means 97,200 to 118,800 submit-OK in the minute.

## Public nodes (local numbers)

Kept: 1, 5. The family sender reads and submits floor, double, triple and high on the desk's private node, which takes no payment submit and which the desk counter reads; triple-pub (11:public-1,12:public-5,13:public-1) reads and submits on kept public kaspads, the payments' nodes.

Kept nodes are unique kaspads: each answered with its own node id at the preflight. 3 candidate endpoints passed the check and were 2 kaspads (node 4 is node 1; the second hostname was not used). 3 payment senders per kaspad.

| Node | Synced every sample | Last DAA | Pay submit-OK | Pay rejects | Dropped sockets | Answer ms, median |
|---:|---|---:|---:|---:|---:|---:|
| 1 | yes | 621101840 | 162,079 | 0 | 0 | 34 |
| 5 | yes | 621101840 | 161,338 | 0 | 0 | 39 |

## Payment senders

| Sender | Node | Pay submit-OK | Rejects | Minutes with a row |
|---|---:|---:|---:|---:|
| 1.1 | 1 | 54,121 | 0 | 3 of 3 |
| 1.2 | 1 | 53,801 | 0 | 3 of 3 |
| 1.3 | 1 | 54,157 | 0 | 3 of 3 |
| 5.1 | 5 | 53,752 | 0 | 3 of 3 |
| 5.2 | 5 | 53,816 | 0 | 3 of 3 |
| 5.3 | 5 | 53,770 | 0 | 3 of 3 |

## Hop submit to landing, per cohort

| Cohort | Landed of OK | Median ms | Slow tail (p95) ms |
|---|---:|---:|---:|
| floor | 47 of 47 | 5652 | 86041 |
| double | 76 of 76 | 3750 | 22657 |
| triple | 130 of 130 | 2708 | 12336 |
| triple-pub | 147 of 147 | 2341 | 10383 |
| high | 385 of 385 | 1242 | 1822 |

Landing is the accepting block header time the desk's coordinator read. Waiting is submitted-OK not yet landed at the minute's end. Triple and triple-pub pay the same rate; they differ only in the node a hop is read and submitted on.
