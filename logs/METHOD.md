# Method, pre-run 9

> Counts only. Desk side. Submit-OK is the desk sender log; included is the desk counter's read of what the desk's private TN10 node accepted on chain. Mini's files are a second read.

Accepted hops per cohort, as the desk's coordinator read them: floor 1,503, double 1,299, triple 1,540, triple-pub 2,010, high 2,717.

Payment submit-OK and included per scored minute:

- HOLD-1: MET on submit-OK, submit-OK 60,736 / 60,681 / 60,800; our payments included 60,638 / 60,732 / 61,401; hops included floor/double/triple/triple-pub/high 373/302/343/458/420; counter minutes not kept-pace 0 of 3.
- HOLD-2: MET on submit-OK, submit-OK 107,859 / 107,573 / 107,985; our payments included 105,299 / 110,240 / 108,927; hops included floor/double/triple/triple-pub/high 47/76/130/147/385; counter minutes not kept-pace 0 of 3.
- HOLD-3: MET on submit-OK, submit-OK 149,910 / 149,907 / 149,937; our payments included 124,745 / 126,219 / 120,261; hops included floor/double/triple/triple-pub/high 2/8/26/36/301; counter minutes not kept-pace 0 of 3.
- HOLD-4: OBSERVATION, submit-OK 60,742; our payments included 61,190; hops included floor/double/triple/triple-pub/high 128/102/109/148/146; counter minutes not kept-pace 0 of 1.
- RETURN: MET on submit-OK, submit-OK 60,935 / 60,785 / 60,680; our payments included 61,215 / 60,756 / 60,751; hops included floor/double/triple/triple-pub/high 360/295/334/447/436; counter minutes not kept-pace 0 of 3.

Decent on the desk side: HOLD-1 met.

## Selection rule, read before the run

The desk node and the kept public kaspads answered serverVersion 2.1.0 at the preflight. In rusty-kaspa tag v2.1.0 (commit 01b532e8b553523216471682649693af92f0fd16), `mining/src/mempool/model/frontier.rs` `build_selector` takes every ready transaction best-first while the ready set's mass fits one block, and otherwise samples at random with weight (fee/mass)^3 (`ALPHA = 3` in `mining/src/mempool/model/frontier/selectors.rs`, weight in `mining/src/mempool/model/frontier/feerate_key.rs`): `sample_inplace` above four blocks' mass, `MutatingTreeSelector` between one and four. Only a transaction with no parent in the mempool is in the ready set (`mining/src/mempool/model/transactions_pool.rs`), so a chained hop is not a candidate until its parent is out of the mempool. Against payments at 150, the weights are 0.30 (100), 2.4 (200), 8 (300) and 296 (1000). A higher fee raises the odds; it does not buy a place in a queue. This is the source's rule, read from the code; the run does not see a miner's template.

Hop rates per hop, one builder: floor (families 1–4) 100 sompi/gram on the desk's private node, double (families 5–7) 200 sompi/gram on the desk's private node, triple (families 8–10) 300 sompi/gram on the desk's private node, triple-pub (families 11–13) 300 sompi/gram on the kept public kaspads, high (families 14–16) 1000 sompi/gram on the desk's private node. Payments 150. The funding coins were not one size, so the fee is not called the whole cause. Triple-pub (11:public-1,12:public-5,13:public-1) was read and submitted on the kept public kaspads; every other cohort on the desk's private TN10 node, which took no payment submit and also ran the counter. Payments: 6 senders, 3 per kept kaspad, 2 unique kaspads, pile 8,400 coins.

## Misses

- none

## Fixes

- none

## On origin

- counts/desk/HOLD-1.md: 2026-11-12T01:16:22Z
- counts/desk/HOLD-2.md: 2026-11-12T01:20:22Z
- counts/desk/HOLD-3.md: 2026-11-12T01:24:22Z
- counts/desk/HOLD-4.md: 2026-11-12T01:29:24Z
- counts/desk/RETURN.md: 2026-11-12T01:33:22Z
- counts/chain/TIMELINE.md: 2026-11-12T01:38:33Z
