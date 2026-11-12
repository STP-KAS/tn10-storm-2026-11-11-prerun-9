MET

Scored on submit-OK, not on inclusion. Inclusion, reported and not scored: in 0 of 3 minutes our payments included (desk counter) were within 10 percent of submit-OK.

# HOLD-3, desk, pre-run 9

> Counts only. Submit-OK is the desk's sender log. Included is what the desk's private TN10 node accepted on chain, read by the desk counter, by accepting chain block time. Mini's files are a second read.

Payment offer 2,500 tx/s at 150 sompi/gram, from 6 payment senders, 3 per kept public node (2 unique kaspads), each its own process and connection. Families offer 1.2 hop/s, 16 families live, one family-sender process and one builder: floor (families 1–4) 100 sompi/gram on the desk's private node, double (families 5–7) 200 sompi/gram on the desk's private node, triple (families 8–10) 300 sompi/gram on the desk's private node, triple-pub (families 11–13) 300 sompi/gram on the kept public kaspads, high (families 14–16) 1000 sompi/gram on the desk's private node (public map 11:public-1,12:public-5,13:public-1).

Payment pile: 8,400 coins on the payment key at the preflight, dealt evenly over the 6 senders before the first payment (last deal, start: 8,400 coins in all, 1,400 / 1,400 / 1,400 / 1,400 / 1,400 / 1,400, even). A deal never holds more coins than the preflight pile. A coin is re-used about once a second, so one sender's ceiling is about its pool per second.

## Submit-OK and included, per minute

| Minute (UTC) | Pay submit-OK | Our payments included | Included, all non-coinbase | Counter |
|---|---:|---:|---:|---|
| 2026-11-12T01:21 | 149,910 | 124,745 | 127,744 | kept pace |
| 2026-11-12T01:22 | 149,907 | 126,219 | 129,402 | kept pace |
| 2026-11-12T01:23 | 149,937 | 120,261 | 123,198 | kept pace |

Submit-OK counts in the minute a submit was answered. Included counts in the minute of the chain block that accepted it, so a payment submitted late in one minute can be included in the next. "Kept pace" means the desk node's DAA stayed within 100 of the kept public kaspad and its sink was under 30 s old in every sample of that minute; "LAGGING" means it did not, and the count is what the node had accepted, not a network figure.

## Chain, desk counter

| Minute (UTC) | Included, all non-coinbase | Our payments included | Floor hops (100) | Double hops (200) | Triple hops (300) | Triple-pub hops (300, public) | High hops (1000) | Other traffic | Chain blocks | DAA gap max | Sink age max, ms | Final after, s | Counter |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 2026-11-12T01:21 | 127,744 | 124,745 | 0 | 1 | 10 | 10 | 101 | 2,877 | 254 | 1 | 656 | 19 | kept pace |
| 2026-11-12T01:22 | 129,402 | 126,219 | 2 | 6 | 6 | 17 | 100 | 3,052 | 274 | 1 | 556 | 20 | kept pace |
| 2026-11-12T01:23 | 123,198 | 120,261 | 0 | 1 | 10 | 9 | 100 | 2,817 | 249 | 1 | 1033 | 20 | kept pace |

Coinbase is taken out as one per merged blue block (on this node a chain block's accepted list carries the coinbase of each blue block it merges). Other traffic is the rest: other users' load, the genesis, and anything not in our logs.

## Hop rate per cohort, as built

Floor (families 1–4, desk private node): 100 sompi/gram per hop. Double (families 5–7, desk private node): 200 sompi/gram per hop. Triple (families 8–10, desk private node): 300 sompi/gram per hop. Triple-pub (families 11–13, kept public kaspads): 300 sompi/gram per hop. High (families 14–16, desk private node): 1000 sompi/gram per hop. The rate rides on each hop line to the one builder. Payments pay 150.

## Funding coins, as read from the desk node

The funding coins were not one size. Sizes seen, whole tKAS (coins): 30 (879), 29 (814), 31 (774), 28 (594), 32 (537), 27 (363), 33 (342), 34 (243), 26 (214), 35 (152), 36 (88), 25 (85), and 57 more sizes. The fee is not called the whole cause.

## Minutes

| Minute (UTC) | Pay submit-OK | Attempts | Rejects, rate | Rejects, full | Other | Floor OK / att / rate rej / full rej / waiting | Double OK / att / rate rej / full rej / waiting | Triple OK / att / rate rej / full rej / waiting | Triple-pub OK / att / rate rej / full rej / waiting | High OK / att / rate rej / full rej / waiting | Family stalls logged | Family node mempool-high marks | Clean |
|---|---:|---:|---:|---:|---:|---|---|---|---|---|---:|---:|---|
| 2026-11-12T01:21 | 149,910 | 149,910 | 0 | 0 | 0 | 0 / 283 / 0 / 0 / 4 | 2 / 213 / 0 / 0 / 3 | 10 / 217 / 0 / 0 / 3 | 10 / 214 / 0 / 0 / 13 | 102 / 254 / 0 / 0 / 3 | 7 | 0 | yes |
| 2026-11-12T01:22 | 149,907 | 149,907 | 0 | 0 | 0 | 2 / 285 / 0 / 0 / 4 | 6 / 213 / 0 / 0 / 3 | 6 / 214 / 0 / 0 / 3 | 17 / 217 / 0 / 0 / 13 | 100 / 255 / 0 / 0 / 3 | 3 | 0 | yes |
| 2026-11-12T01:23 | 149,937 | 149,937 | 0 | 0 | 0 | 0 / 281 / 0 / 0 / 4 | 1 / 212 / 0 / 0 / 3 | 10 / 216 / 0 / 0 / 3 | 9 / 214 / 0 / 0 / 13 | 99 / 254 / 0 / 0 / 2 | 4 | 1 | yes |

A family stall is a coordinator mark: no hop of that family landed for a while. The family was still attempting. It is logged, and it does not make the minute dirty.

A mempool-high mark means the family node read a mempool at or over 90,000. In pre-run 9 that does not stop the families: the skip does not apply to them. A skip, if one were set, is dirt with its reason (node-skip-fam) for every minute it covers, and it clears when the mempool falls back under the line.

Within 10 percent means 135,000 to 165,000 submit-OK in the minute.

## Public nodes (local numbers)

Kept: 1, 5. The family sender reads and submits floor, double, triple and high on the desk's private node, which takes no payment submit and which the desk counter reads; triple-pub (11:public-1,12:public-5,13:public-1) reads and submits on kept public kaspads, the payments' nodes.

Kept nodes are unique kaspads: each answered with its own node id at the preflight. 3 candidate endpoints passed the check and were 2 kaspads (node 4 is node 1; the second hostname was not used). 3 payment senders per kaspad.

| Node | Synced every sample | Last DAA | Pay submit-OK | Pay rejects | Dropped sockets | Answer ms, median |
|---:|---|---:|---:|---:|---:|---:|
| 1 | yes | 621103855 | 225,315 | 0 | 0 | 34 |
| 5 | yes | 621103855 | 224,439 | 0 | 0 | 38 |

## Payment senders

| Sender | Node | Pay submit-OK | Rejects | Minutes with a row |
|---|---:|---:|---:|---:|
| 1.1 | 1 | 74,818 | 0 | 3 of 3 |
| 1.2 | 1 | 75,261 | 0 | 3 of 3 |
| 1.3 | 1 | 75,236 | 0 | 3 of 3 |
| 5.1 | 5 | 74,813 | 0 | 3 of 3 |
| 5.2 | 5 | 75,037 | 0 | 3 of 3 |
| 5.3 | 5 | 74,589 | 0 | 3 of 3 |

## Hop submit to landing, per cohort

| Cohort | Landed of OK | Median ms | Slow tail (p95) ms |
|---|---:|---:|---:|
| floor | 1 of 2 | 5560 | 5560 |
| double | 7 of 9 | 34783 | 89063 |
| triple | 26 of 26 | 14706 | 68792 |
| triple-pub | 36 of 36 | 10459 | 34102 |
| high | 301 of 301 | 1582 | 2743 |

Landing is the accepting block header time the desk's coordinator read. Waiting is submitted-OK not yet landed at the minute's end. Triple and triple-pub pay the same rate; they differ only in the node a hop is read and submitted on.
