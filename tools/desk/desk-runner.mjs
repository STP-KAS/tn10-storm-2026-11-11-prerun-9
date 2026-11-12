// Pre-run 9 desk runner. One process. Pre-run 8's runner plus:
//   (vi)   five family cohorts (family-fees.mjs): floor 1-4 at 100, double 5-7 at 200, triple 8-10 at 300, triple-pub 11-13
//          at 300 submitted on the kept public kaspads (the payments' nodes), high 14-16 at 1000. One process, one builder
//          (kit19). The runner maps each public family to a kept kaspad (family_public_urls in the private config) and
//          checks FEE_SPLIT and FAMILY_PATH lines and the path on the submit rows. Counts are per cohort (h_<cohort>).
//   (vii)  offers reshaped for the question: HOLD-1 1,013 (under block space), HOLD-2 1,800 (near it, not over), HOLD-3
//          2,500 (over, kept short), then the rate drops to 1,013 as soon as HOLD-3's minutes are scored; the HOLD-4
//          minute is an observation at 1,013 (the backlog drain); RETURN 1,013. Scored on submit-OK; each step file also
//          says how many minutes had our payments included within 10 percent of submit-OK (reported, not scored).
//   (viii) the open gate checks the private candidates file before it reads any node (HELD candidates-missing).
// Pre-run 8 header follows.
// Pre-run 8 desk runner. One process. Pre-run 7's runner plus:
//   (iv)  the desk's private TN10 node counts what the chain accepted (counter.mjs, a detached read-only child started
//         before the first family submit): per minute, by accepting chain block time, our payments, our families by fee
//         tier, coinbase and other traffic, with the desk node's DAA gap and sink age against a kept public kaspad each
//         sample. A minute whose read lagged is marked; a count is never filled in. Each step file carries submit-OK and
//         included side by side; after RETURN the counter reads a 5-minute tail and counts/chain/TIMELINE.md is written.
//   (v)   three family fee tiers against the payments' 150: floor 1-6 at 100, double 7-11 at 200, triple 12-16 at 300.
// Pre-run 7 header follows.
// Pre-run 7 desk runner. One process. TESTNET-10 ONLY. Never restarted mid-run (locks/LOCKED.md).
// Pre-run 7 lock lines carried here (locks/LOCKED.md, pre-run 6 lock at c527650):
//   (i)   the family sender is on the desk's private TN10 node (a unique synced kaspad that takes no payment submit), and
//         its mempool skip no longer applies to families (kit17: family_mempool_skip_line 0). If a skip is ever set, it
//         clears when the mempool falls back under the line, and every minute it covers is dirt with its reason
//         (node-skip-fam:<reason>), read from phase.log NODE_SKIP / NODE_SKIP_CLEAR.
//   (ii)  when every sender hands off, the deal takes the handoff pools as the truth; the node view only drops coins it
//         shows as spent, never adds. Any deal is capped at the preflight pile.
//   (iii) STORM_PAY_PER_NODE payment senders (default 3) per kept unique kaspad, each its own process and connection;
//         a slow loop may catch up to STORM_PAY_CATCHUP (default 3) times its share (pay2.mjs).
// Pre-run 6 lesson carried here (locks/LOCKED.md, b616d11): the payment pool survives a sender restart.
//   (d) before the first payment and at the one repair, the runner deals the free payment coins evenly over the senders
//       (tools/desk/paypool.mjs): a coin spent by a mempool transaction is not free, an unconfirmed tip of ours is. Each
//       sender gets a private lane file. The repair asks the senders to hand off (control/PAY-HANDOFF-<n>): each one
//       finishes its batch in flight, writes its exact pool, and exits. Only a sender that does not hand off in 30 s is
//       killed, and then its last snapshot is used. The handed-off pools are checked against the node view, merged with
//       the node's free set, and dealt again. The split is logged (POOL_SPLIT) and each sender's loaded pool is checked
//       against it (POOL_LOADED). The pile is read against the offers before a ceiling is called a node limit.
// Pre-run 4 lessons carried here (locks/LOCKED.md, edfcdd2):
//   (a) a payment-sender repair waits until the killed senders are gone, drops them from the list itself, starts the
//       missing ones, and checks that each one logged PAY_START. startPay starts any sender that is not alive, whatever
//       the list says.
//   (b) a HOLD or FAILED push that fails is retried (fetch and push), and a FAILED file is always written locally first
//       (logs/FAILED.local.md in the run folder) so the operator can publish it if origin stays unreachable.
//   (c) kept public nodes are unique kaspads (preflight reads each node id); two hostnames of one kaspad are one node.
// Children (broker, coordinator, family sender, payment senders) start detached through WMI, outside this process tree and job,
// so they survive the parent. The runner tracks them by pid.
//   --mode open : gates, then publish logs/PRE-RUN-OPEN.md once. Exits. Not a send.
//   --mode run  : gates (PRE-RUN-OPEN and MINI-ARMED on origin), genesis from the published bundle, families on kit16 +
//                 the patched builder (100/200 per hop), payments HOLD-1..3, the HOLD-4 minute, RETURN, METHOD.md.
// A missing gate is HELD and an exit. It never waits on a gate. It never rebuilds the bundle or republishes SIXTEEN.md.
// Env: STORM_CONFIG (this run's config), STORM_KIT (kit16). Args: --repo <clone> --git <git.exe> --bundle <published bundle> --six <tools dir>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf("--" + n); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const MODE = arg("mode"), REPO = arg("repo"), GIT = arg("git"), BUNDLE = arg("bundle"), SIX = arg("six");
const KIT = process.env.STORM_KIT;
const U = (d, f) => "file:///" + path.join(d, f).replace(/\\/g, "/");
const { CFG, P, sleep, connect, to } = await import(U(KIT, "lib.mjs"));
const { verify, shaOfId } = await import(U(SIX, "sixteen-format.mjs"));
const { familyRate, cohortOfFamily, pathOfFamily, PUBLIC_FAMILIES, COHORTS, FEE_SPLIT_LINE, TIERS } = await import(U(SIX, "family-fees.mjs"));
const HK = COHORTS.map((c) => "h_" + c);
const tierOfC = (c) => TIERS.find((t) => t.cohort === c);
const cohHead = (c) => `${c[0].toUpperCase() + c.slice(1)} hops (${tierOfC(c).rate}${tierOfC(c).path === "public" ? ", public" : ""})`;
const TIER_TXT = TIERS.map((t) => `${t.cohort} (families ${t.from}–${t.to}) ${t.rate} sompi/gram on the ${t.path === "public" ? "kept public kaspads" : "desk's private node"}`).join(", ");
const { keyAddress } = await import(U(KIT, "covenant.mjs"));
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PP = await import(U(HERE, "paypool.mjs"));
const PILE_MIN = Number(process.env.STORM_PILE_MIN || 6000);   // pre-run 7: the pile is sized for HOLD-4 over all senders
const PER = Math.max(1, Number(process.env.STORM_PAY_PER_NODE || 3));   // (iii) payment senders per kept kaspad
const NODE = process.execPath;
const isoZ = (ms = Date.now()) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");
const mkey = (ms) => new Date(ms).toISOString().slice(0, 16);
const clean = (s) => String(s).replace(/wss?:\/\/\S+/g, "<url>").replace(/https?:\/\/\S+/g, "<url>").replace(/\b\d{1,3}(\.\d{1,3}){3}\b/g, "<ip>").replace(/[0-9a-f]{64}/gi, "<h>").replace(/C:\\Users\\[^\\]+/gi, "C:\\Users\\Fermi").slice(0, 400);
const LOG = P("logs", "runner.log");
const sleepA = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (s) => { const l = isoZ() + " " + clean(s); fs.appendFileSync(LOG, l + "\n"); console.log(l); };
const phase = (s) => { fs.appendFileSync(P("logs", "phase.log"), isoZ() + " " + s + "\n"); log("PHASE " + s); };
const HELD = (why, extra = "") => { log("HELD " + why + (extra ? " " + extra : "")); console.log(JSON.stringify({ held: why })); process.exit(3); };
if (!["open", "run"].includes(MODE) || !REPO || !GIT || !BUNDLE || !SIX || !KIT) { console.log("args: --mode open|run --repo --git --bundle --six"); process.exit(2); }

// ---- one runner ------------------------------------------------------------------------------------------------
const LOCK = P("private", "runner.lock");
if (fs.existsSync(LOCK)) {
  const old = Number(fs.readFileSync(LOCK, "utf8").trim()); let alive = false;
  try { process.kill(old, 0); alive = true; } catch (e) { alive = e?.code === "EPERM"; }
  if (alive) HELD("second-runner");
}
fs.writeFileSync(LOCK, String(process.pid));
process.on("exit", () => { try { if (fs.readFileSync(LOCK, "utf8").trim() === String(process.pid)) fs.unlinkSync(LOCK); } catch {} });

function otherRunners() {
  const r = spawnSync("pwsh", ["-NoProfile", "-NonInteractive", "-Command", "Get-CimInstance Win32_Process | Where-Object { $_.Name -in 'node.exe','pwsh.exe','powershell.exe','kcc20.exe' } | ForEach-Object { \"$($_.ProcessId)`t$($_.CommandLine)\" }"], { encoding: "utf8", timeout: 30000 });
  if (r.status !== 0) return ["unread"];
  const bad = [];
  for (const line of (r.stdout || "").split(/\r?\n/)) {
    const [pid, cmd = ""] = line.split("\t");
    if (!pid || Number(pid) === process.pid || Number(pid) === process.ppid) continue;
    if (/serve\.mjs|desk-runner\.mjs|Get-CimInstance/i.test(cmd)) continue;
    if (/prerun-1111|tuesday-1110|tn10-storm-2026-11-1[01](?!-prerun-9)|night\.ps1|sender\.mjs|coordinator\.mjs|builder-broker\.mjs|pay2?\.mjs|counter\.mjs|kcc20|mini-runner|gate\.mjs|arm-run/i.test(cmd)) bad.push(pid);
  }
  return bad;
}

// ---- git (full path, one commit per file, push retried once) --------------------------------------------------
const G = (a) => { const r = spawnSync(GIT, ["-C", REPO, ...a], { encoding: "utf8", timeout: 90000 }); return { code: r.status ?? 1, out: (r.stdout || "") + (r.stderr || "") + (r.error ? " " + r.error.code : "") }; };
const sleepSync = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
function fetchO() { for (let i = 0; i < 3; i++) { if (i) sleepSync(3000); if (G(["fetch", "origin", "main"]).code === 0) return true; } return false; }
const GIT_TRIES = Number(process.env.STORM_GIT_TRIES || 8), GIT_GAP_MS = Number(process.env.STORM_GIT_GAP_MS || 20000);
const has = (rel) => G(["cat-file", "-e", `origin/main:${rel}`]).code === 0;
const show = (rel) => { let r = G(["show", `origin/main:${rel}`]); if (r.code !== 0 || !r.out.trim()) r = G(["show", `origin/main:${rel}`]); return r.code === 0 ? r.out : ""; };
function originMs(rel) { let r = G(["log", "-1", "--format=%cI", "origin/main", "--", rel]); if (!r.out.trim()) r = G(["log", "-1", "--format=%cI", "origin/main", "--", rel]); const ms = Date.parse(r.out.trim().split(/\r?\n/)[0]); return Number.isFinite(ms) ? ms : null; }
function publish(rel, body, msg) {
  if (!fetchO()) return { ok: false, why: "fetch" };
  if (has(rel)) return { ok: true, existed: true, ms: originMs(rel) };
  G(["checkout", "-q", "main"]);
  const ff = G(["merge", "--ff-only", "origin/main"]); if (ff.code !== 0) return { ok: false, why: "ff " + ff.out };
  const abs = path.join(REPO, rel); fs.mkdirSync(path.dirname(abs), { recursive: true }); fs.writeFileSync(abs, body);
  if (G(["add", "--", rel]).code !== 0) return { ok: false, why: "add" };
  const c = G(["commit", "-q", "-m", msg, "--", rel]); if (c.code !== 0) return { ok: false, why: "commit " + c.out };
  let p = G(["push", "origin", "HEAD:main"]);
  if (p.code !== 0) { const rb = G(["pull", "--rebase", "-q", "origin", "main"]); if (rb.code !== 0) { G(["rebase", "--abort"]); return { ok: false, why: "push " + p.out }; } p = G(["push", "origin", "HEAD:main"]); }
  if (p.code !== 0) return { ok: false, why: "push " + p.out };
  fetchO();
  return { ok: true, ms: originMs(rel) };
}
// A HOLD or FAILED push is retried: GIT_TRIES tries, GIT_GAP_MS apart. A fetch error is not the end of the step.
async function publishRetry(rel, body, msg, tries = GIT_TRIES) {
  let r = { ok: false, why: "none" };
  for (let i = 1; i <= tries; i++) {
    r = publish(rel, body, msg);
    if (r.ok) { if (i > 1) log(`GIT_RETRY_OK ${rel} try=${i}`); return r; }
    G(["rebase", "--abort"]);
    log(`GIT_RETRY ${rel} try=${i}/${tries} ${r.why}`);
    if (i < tries) await sleepA(GIT_GAP_MS);
  }
  return r;
}

// ---- shared gates ----------------------------------------------------------------------------------------------
function sixteenGate() {
  if (!fetchO()) HELD("git-fetch");
  if (has("logs/FAILED.md")) HELD("failed-on-origin");
  const text = show("hashes/SIXTEEN.md");
  if (!text) HELD("no-sixteen-hash-path", "absent");
  const v = verify(text, { requireOrigin: true });
  if (!v.ok || v.fixture) HELD("no-sixteen-hash-path", "not-proof");
  const bundle = JSON.parse(fs.readFileSync(BUNDLE, "utf8"));
  if (!Array.isArray(bundle) || bundle.length !== 16) HELD("no-sixteen-hash-path", "bundle");
  const mism = bundle.filter((b) => v.rows.find((r) => r.family === b.family)?.sha !== shaOfId(b.g.covenantId)).length;
  if (mism) HELD("no-sixteen-hash-path", "bundle-not-the-published-one n=" + mism);
  return bundle;
}
function preflight() {
  // (viii) pre-run 8's first open read HELD desk-node-down because this file was missing; name it instead.
  try { const c = JSON.parse(fs.readFileSync(P("private", "candidates.json"), "utf8")); if (!Array.isArray(c) || !c.length) HELD("candidates-missing", "empty"); } catch { HELD("candidates-missing", "private/candidates.json absent or unreadable"); }
  const r = spawnSync(NODE, [path.join(HERE, "preflight.mjs"), "--bundle", BUNDLE, "--nodes", P("private", "candidates.json"), "--out", P("private", "nodes.json")], { encoding: "utf8", env: process.env, timeout: 240000 });
  const line = (r.stdout || "").trim().split(/\r?\n/).filter((l) => l.startsWith("{")).pop();
  let j = null; try { j = JSON.parse(line); } catch {}
  if (!j) HELD("desk-node-down", "preflight-unread");
  fs.writeFileSync(P("private", "preflight-last.json"), JSON.stringify(j));
  if (!(j.desk.testnet10 && j.desk.synced && j.desk.utxoindex && j.desk.daa_moving)) HELD("desk-node-down");
  if (!j.lane.above_abort) HELD("lane-held");
  if (j.bundle_coins.live !== 16) HELD("bundle-coin-gone", "n=" + j.bundle_coins.gone.length);
  log(`PREFLIGHT public checked=${j.public.length} answered_pass=${j.answered_pass} unique_kaspads=${j.unique_kaspads} collapsed=${(j.collapsed || []).join(",") || "-"} fail=${j.public.filter((x) => !x.pass).length} pass_nodes=${j.public.filter((x) => x.pass).map((x) => x.n).join(",")} pay_pile=${j.pay_pile}`);
  for (const x of j.public.filter((y) => !y.pass)) log(`PREFLIGHT node=${x.n} dropped why=${x.why || (x.synced === 0 ? "unsynced" : x.utxoindex === 0 ? "no-utxoindex" : x.daa_gap > 100 ? "daa-gap" : "check")}${x.same_as ? " same_kaspad_as=" + x.same_as : ""}`);
  return j;
}

// =================================================================================================================
if (MODE === "open") {
  log("OPEN start pid=" + process.pid);
  const o = otherRunners(); if (o.length) HELD("other-runner", "n=" + o.length);
  sixteenGate();
  const pf = preflight();
  if (has("logs/PRE-RUN-OPEN.md")) { log("OPEN PRE-RUN-OPEN already on origin"); process.exit(0); }
  const z = isoZ();
  const r = await publishRetry("logs/PRE-RUN-OPEN.md", `PRE_RUN_OPEN ${z}\n`, "Open pre-run 9.", 3);
  if (!r.ok) { log("GIT_FAIL " + r.why); process.exit(4); }
  log(`OPEN PRE-RUN-OPEN on origin at ${isoZ(r.ms)} (desk synced, ${pf.kept} public nodes kept, 16 bundle coins live)`);
  process.exit(0);
}

// =================================================================================================================
// MODE run
log("RUN start pid=" + process.pid);
let PF = {};
const kids = new Map();   // name -> child
const expectExit = new Set();   // pids the runner killed on purpose (repair): their exit is logged, not counted as PROC_EXIT
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e?.code === "EPERM"; } };
let stopping = false;
function startKid(name, args) {
  const q = (x) => `"${x}"`;
  const env = `set "STORM_CONFIG=${process.env.STORM_CONFIG}" && set "STORM_KIT=${KIT}" && set "STORM_BUILDER_DIRECT=" && `;
  const cmd = `cmd.exe /d /s /c "${env}${q(NODE)} ${args.map(q).join(" ")} >> ${q(P("out", name + ".out"))} 2>> ${q(P("out", name + ".err"))}"`;
  const ps = `$si = New-CimInstance -ClassName Win32_ProcessStartup -ClientOnly -Property @{ ShowWindow = [uint16]0 }; $r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $env:KID_CMD; CurrentDirectory = $env:KID_CWD; ProcessStartupInformation = $si }; "$($r.ReturnValue) $($r.ProcessId)"`;
  const r = spawnSync("pwsh", ["-NoProfile", "-NonInteractive", "-Command", ps], { encoding: "utf8", timeout: 60000, env: { ...process.env, KID_CMD: cmd, KID_CWD: KIT } });
  const [rv, pid] = (r.stdout || "").trim().split(/\s+/).map(Number);
  if (rv !== 0 || !pid) throw new Error("detached start failed for " + name + " rv=" + rv);
  kids.set(name, { pid, kill: () => spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { timeout: 20000 }) });
  log(`KID ${name} detached`);
}
setInterval(() => { for (const [name, c] of kids) { if (!alive(c.pid)) { kids.delete(name); if (expectExit.has(c.pid)) { expectExit.delete(c.pid); phase(`REPAIR_EXIT proc=${name.replace(/-[a-z0-9.]+$/i, "")}`); } else if (name === "counter") { if (!fs.existsSync(P("control", "COUNTER-STOP"))) { phase("COUNTER_EXIT"); counterDown(); } } else if (!stopping) phase(`PROC_EXIT proc=${name.replace(/-[a-z0-9.]+$/i, "")} code=gone`); } } }, 5000);
// (iv) a counter that exits mid-run is started once more (a reader, not a sender); its restart minutes are partial.
let counterRestarts = 0;
function counterDown() { if (counterRestarts >= 1 || stopping) { log("COUNTER down; inclusion minutes after this are unread"); return; } counterRestarts++; try { startKid("counter", [path.join(HERE, "counter.mjs"), "--ref", String(kept[0].n)]); phase("COUNTER_RESTART once"); } catch (e) { log("COUNTER restart failed " + clean(e?.message || e)); } }
async function stopAll(why, counterToo = false) {   // (iv) the counter is stopped on its own, after its tail
  if (counterToo) { try { fs.writeFileSync(P("control", "COUNTER-STOP"), why + "\n"); } catch {} }
  stopping = true; phase("RUN_STOP reason=" + why);
  fs.writeFileSync(P("control", "STOP"), why + "\n"); fs.writeFileSync(P("control", "PAY-STOP"), why + "\n");
  const end = Date.now() + 30000; while (Date.now() < end && [...kids.keys()].some((k) => k !== "broker" && k !== "counter")) await sleep(1000);
  for (const [name, c] of kids) { if (name === "counter" && !counterToo) continue; try { c.kill(); } catch {} }
  await sleep(2000);
  spawnSync("pwsh", ["-NoProfile", "-Command", `Get-Process kcc20 -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*prerun-9-sixteen*' -or $_.Path -like '*prerun-2-sixteen\builder*' } | Stop-Process -Force`], { timeout: 20000 });
}
let failing = false;
async function fail(why) {
  if (failing) return; failing = true;
  log("FAILED " + why);
  const body = `FAILED ${isoZ()}\n\nThe pre-run 9 desk run stopped before RETURN: ${clean(why)}. The run is not resumed. A next attempt is a new repo.\n`;
  // Local first: whatever origin does, the run is marked failed on this desk.
  fs.writeFileSync(P("logs", "FAILED.local.md"), body); log("FAILED_LOCAL written logs/FAILED.local.md");
  await stopAll("failed", true);
  const r = await publishRetry("logs/FAILED.md", body, "Pre-run 9 failed before RETURN.", Math.max(GIT_TRIES, 3) * 2);
  if (r.ok) { log("FAILED.md on origin " + isoZ(r.ms)); try { fs.writeFileSync(P("logs", "FAILED.local.md"), body + `\nOn origin ${isoZ(r.ms)}.\n`); } catch {} }
  else { log("GIT_FAIL FAILED.md not on origin after retries: " + r.why); fs.writeFileSync(P("control", "FAILED-UNPUBLISHED"), "publish logs/FAILED.local.md as logs/FAILED.md\n"); log("FAILED_UNPUBLISHED the operator publishes logs/FAILED.local.md"); }
  process.exit(r.ok ? 5 : 7);
}
process.on("uncaughtException", (e) => { fail("runner error " + clean(e?.message || e)).catch(() => process.exit(6)); });
process.on("unhandledRejection", (e) => { fail("runner error " + clean(e?.message || e)).catch(() => process.exit(6)); });

{ const o = otherRunners(); if (o.length) HELD("other-runner", "n=" + o.length); }
const bundle = sixteenGate();
if (!/PRE_RUN_OPEN/.test(show("logs/PRE-RUN-OPEN.md"))) HELD("no-open-file");
if (!/MINI_ARMED/.test(show("logs/MINI-ARMED.md"))) HELD("mini-armed-absent");
{
for (const f of fs.readdirSync(P("state"))) if (/^family-\d+\.json$/.test(f)) HELD("state-present", "a run already started here; not resumed");
for (const f of ["STOP", "PAY-STOP", "PAY-RATE"]) try { fs.unlinkSync(P("control", f)); } catch {}
PF = preflight();
if (!(PF.pay_pile >= PILE_MIN)) HELD("pile-short", `pay_pile=${PF.pay_pile} min=${PILE_MIN}`);
}
const kept = JSON.parse(fs.readFileSync(P("private", "nodes.json"), "utf8"));
if (!kept.length) HELD("no-public-node");
log("NODES frozen kept=" + kept.map((x) => x.n).join(","));
// (i) the family sender gets its own node: the desk's private TN10 node (checked synced with DAA moving at the preflight),
// which no payment sender submits to. STORM_FAMILY_NODE=public puts it back on kept node 1 (pre-run 6's choice).
const famNode = process.env.STORM_FAMILY_NODE === "public" ? (kept.find((x) => x.n === 1) || kept[0]) : { n: 0, url: CFG.main_node_url, desk: true };
log("FAMILY_NODE " + (famNode.desk ? "desk-private" : "local=" + famNode.n));

let liveFams;
// schedule for the family sender: f16, 1.2 hop/s, from now
const cfgPath = process.env.STORM_CONFIG;
const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8").replace(/^\uFEFF/, ""));
cfg.schedule = [{ step: "f16", from: isoZ(Date.now() + 5000), to: cfg.end_utc, families: 16, rate: 1.2 }];
cfg.sec_from_utc = cfg.family_check_utc = isoZ();
// (vi) the public path: public families take the kept kaspads in turn. The urls stay in the private config.
cfg.family_public_urls = Object.fromEntries(PUBLIC_FAMILIES.map((f, i) => { const x = kept[i % kept.length]; return [String(f), { n: x.n, url: x.url }]; }));
const pubMapTxt = PUBLIC_FAMILIES.map((f) => `${f}:public-${cfg.family_public_urls[String(f)].n}`).join(",");
log("FAMILY_PUBLIC_MAP " + pubMapTxt);
fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));

// (iv) the inclusion counter, on the desk's private node, before the first family submit. No counter, no run.
startKid("counter", [path.join(HERE, "counter.mjs"), "--ref", String(kept[0].n)]);
{ const e = Date.now() + 60000; let up = false; while (Date.now() < e) { try { if (/COUNTER_START/.test(fs.readFileSync(P("logs", "counter.log"), "utf8"))) { up = true; break; } } catch {} await sleep(1000); }
  if (!up) { log("HELD counter-down"); await stopAll("counter-down", true); process.exit(3); } phase(`COUNTER_START node=desk-private ref=${kept[0].n}`); }

// broker (one builder: the patched exe in the config)
startKid("broker", [path.join(KIT, "builder-broker.mjs")]);
await sleep(4000);
if (!/builder-broker on/.test(fs.readFileSync(P("out", "broker.out"), "utf8"))) await fail("builder broker did not start");

// genesis from the published bundle
phase("GENESIS_SUBMIT from=published-bundle");
const gs = spawnSync(NODE, [path.join(SIX, "submit-sixteen.mjs"), "--bundle", BUNDLE, "--repo", REPO, "--git", GIT], { cwd: KIT, encoding: "utf8", env: process.env, timeout: 30 * 60000 });
fs.appendFileSync(P("out", "submit-sixteen.out"), clean(gs.stdout || "") + "\n" + clean(gs.stderr || "") + "\n");
const gj = (() => { try { return JSON.parse((gs.stdout || "").trim().split(/\r?\n/).filter((l) => l.startsWith("{")).pop()); } catch { return null; } })();
if (!gj || gj.held) { log("HELD at genesis " + clean(JSON.stringify(gj))); await stopAll("genesis-held", true); process.exit(3); }
liveFams = fs.readdirSync(P("state")).filter((f) => /^family-\d+\.json$/.test(f)).map((f) => Number(f.match(/\d+/)[0])).sort((a, b) => a - b);
log(`GENESIS submitted=${gj.submitted} live=${liveFams.length}`);
if (!liveFams.length) await fail("no genesis landed");

// families: coordinator + one family sender on the family node
startKid("coord", [path.join(KIT, "coordinator.mjs"), "--takeover"]);
await sleep(3000);
startKid("fam", [path.join(KIT, "sender.mjs"), "--label", "fam", "--source", "self", "--node", famNode.url, "--key", "0"]);
phase("FAMILIES_START families=" + liveFams.length + " offer=1.2 node=" + (famNode.desk ? "desk" : famNode.n) + " mempool_skip_line=" + Number(cfg.family_mempool_skip_line ?? 90000));

// submit-row reader
const SUB = P("private", "submit-fam.jsonl");
let subOff = 0; const subRows = [];
function readSub() {
  if (!fs.existsSync(SUB)) return;
  const st = fs.statSync(SUB); if (st.size <= subOff) return;
  const fd = fs.openSync(SUB, "r"); const buf = Buffer.alloc(st.size - subOff); fs.readSync(fd, buf, 0, buf.length, subOff); fs.closeSync(fd);
  const text = buf.toString("utf8"); const cut = text.lastIndexOf("\n"); if (cut < 0) return; subOff += Buffer.byteLength(text.slice(0, cut + 1));
  for (const l of text.slice(0, cut).split("\n")) { try { const r = JSON.parse(l); subRows.push({ ts: Date.parse(r.ts), family: r.family, rate: r.rate, fee: r.fee, txid: r.txid, result: r.result, reason: r.reason, path: r.path || "" }); } catch {} }
}
const HOPS = P("private", "hops.jsonl");
function landed() {   // txid -> accept ms
  const m = new Map(); if (!fs.existsSync(HOPS)) return m;
  for (const l of fs.readFileSync(HOPS, "utf8").split("\n")) { try { const r = JSON.parse(l); if (r.accept_header_utc) m.set(r.txid, { ms: Date.parse(r.accept_header_utc), family: r.family }); } catch {} }
  return m;
}

// fee split as built: every submit row carries its family's rate
{
  const end = Date.now() + 180000; let seen = false;
  while (Date.now() < end) { readSub(); if (COHORTS.every((c) => subRows.some((r) => r.result === "ok" && cohortOfFamily(r.family) === c))) { seen = true; break; } await sleep(3000); }
  const ph = fs.readFileSync(P("logs", "phase.log"), "utf8");
  if (!ph.includes("FEE_SPLIT sender=fam " + FEE_SPLIT_LINE)) await fail("family sender did not log the pre-run 9 fee split");
  const wantPath = (f) => (pathOfFamily(f) === "public" ? "public-" + cfg.family_public_urls[String(f)].n : "desk");
  const fpl = (ph.match(/FAMILY_PATH sender=fam (\S+)/) || [])[1] || "";
  const fpWant = cfg.families.map((f) => f.family + ":" + wantPath(f.family)).join(",");
  if (fpl !== fpWant) await fail("family sender did not log the planned paths");
  const bad = subRows.filter((r) => r.result === "ok" && r.rate !== familyRate(r.family));
  if (bad.length) await fail("a hop went out at a rate other than its family's");
  const badPath = subRows.filter((r) => r.path !== wantPath(r.family));
  if (badPath.length) await fail("a hop went out on a path other than its family's");
  if (!seen) log("FEE_SPLIT not every cohort ok within 3 min; continuing, minutes will show it");
  else log("FEE_SPLIT verified on submit rows: " + TIERS.map((t) => `${t.cohort} ${t.rate}@${t.path}`).join(", ") + "; paths " + pubMapTxt + ", the rest desk");
}
// every family attempting
{
  const end = Date.now() + 180000;
  while (Date.now() < end) { readSub(); const f = new Set(subRows.map((r) => r.family)); if (liveFams.every((n) => f.has(n))) break; await sleep(5000); }
  const f = new Set(subRows.map((r) => r.family)); log("FAMILIES attempting=" + liveFams.filter((n) => f.has(n)).length + "/" + liveFams.length);
}

// node marks, sampled each minute: desk + kept public nodes
const rpcs = new Map();
async function rpcOf(url) { if (!rpcs.has(url)) rpcs.set(url, await connect(url, 3)); return rpcs.get(url); }
const marks = {};   // minute -> { n -> {synced, daa, ms} }
const idShift = new Set();   // a kept node that later answered with another node id is logged once (not dirt; data)
const idHash = (id) => crypto.createHash("sha256").update(String(id || "")).digest("hex").slice(0, 16);
async function sampleNodes() {
  const key = mkey(Date.now()); const row = (marks[key] ||= {});
  const all = [{ n: 0, url: CFG.main_node_url }, ...kept];
  await Promise.all(all.map(async (x) => {
    const t0 = Date.now();
    try {
      const c = await rpcOf(x.url); const si = await to(c.getServerInfo(), 8000); const d = await to(c.getBlockDagInfo(), 8000);
      (row[x.n] ||= []).push({ synced: si.isSynced ? 1 : 0, daa: Number(d.virtualDaaScore), ms: Date.now() - t0 });
      if (x.idh) { try { const inf = await to(c.getInfo(), 8000); const h = idHash(inf?.p2pId); if (h !== x.idh && !idShift.has(x.n)) { idShift.add(x.n); phase(`NODE_ID_SHIFT node=${x.n}`); } } catch {} }
    }
    catch { rpcs.delete(x.url); (row[x.n] ||= []).push({ synced: 0, daa: 0, ms: Date.now() - t0, fail: 1 }); }
  }));
}
setInterval(() => { sampleNodes().catch(() => {}); }, 20000); await sampleNodes();
setInterval(async () => {
  try {
    const c = await rpcOf(CFG.main_node_url);
    const bag = await to(c.getUtxosByAddresses({ addresses: [keyAddress(0)] }), 60000);
    const coins = (bag.entries || []).filter((e) => !e.isCoinbase && BigInt(e.amount) > 300_000_000n);
    const usable = Math.round(coins.reduce((a, e) => a + Number(e.amount) - 3e8, 0) / 1e8);
    if (!stopping && (coins.length < 2500 || usable < 18000)) { phase("LANE_HELD"); await fail("the family lane reached the abort line"); }
  } catch { log("LANE unread"); }
}, 60000);
// FAILED on origin stops the run
setInterval(() => { try { if (fetchO() && has("logs/FAILED.md")) { stopAll("failed-on-origin").then(() => process.exit(0)); } } catch {} }, 60000);

// payments: (iii) PER senders per kept kaspad, ids <node>.<k>
const SENDERS = kept.flatMap((x) => Array.from({ length: PER }, (_, k) => ({ id: `${x.n}.${k + 1}`, n: x.n, url: x.url })));
fs.writeFileSync(P("private", "senders.json"), JSON.stringify(SENDERS));
const N = SENDERS.length;
log(`SENDERS kept_kaspads=${kept.length} per_node=${PER} senders=${N}`);
// A sender counts as running only if its process is alive. A dead one still in the list is dropped and started again.
function startPay() {
  const started = [];
  for (let i = 0; i < N; i++) {
    const name = "pay-" + SENDERS[i].id, k = kids.get(name);
    if (k && alive(k.pid)) continue;
    if (k) kids.delete(name);
    startKid(name, [path.join(HERE, "pay2.mjs"), "--slot", String(i), "--of", String(N)]); started.push(SENDERS[i].id);
  }
  return started;
}
const payStarts = (sinceMs) => fs.readFileSync(P("logs", "phase.log"), "utf8").split(/\r?\n/).filter((l) => Date.parse(l.slice(0, 20)) >= sinceMs - 1000).map((l) => l.match(/PAY_START sender=([\d.]+)/)).filter(Boolean).map((m) => m[1]);
const payPools = (sinceMs) => { const m = new Map(); for (const l of fs.readFileSync(P("logs", "phase.log"), "utf8").split(/\r?\n/)) { if (Date.parse(l.slice(0, 20)) < sinceMs - 1000) continue; const x = l.match(/PAY_POOL sender=([\d.]+) node=\d+ n=(\d+) from=(\S+)/); if (x) m.set(x[1], { n: Number(x[2]), from: x[3] }); } return m; };
// (d) the fair deal. Sources: handed-off pools (exact), then the node's free set; spent coins are dropped; dealt in outpoint order.
const PAY_ADDR = keyAddress(16);
let lastDeal = null;
async function prepareLanes(why) {
  const rs = [await rpcOf(CFG.main_node_url)];
  for (const x of kept) { try { rs.push(await rpcOf(x.url)); } catch { rpcs.delete(x.url); } }
  let v = null; for (let i = 0; i < 3 && !v; i++) { try { v = await PP.nodeView(rs, PAY_ADDR, to, 90000); } catch (e) { log("POOL_VIEW retry " + clean(e?.message || e)); await sleepA(3000); } }
  if (!v) { phase(`POOL_SPLIT why=${why} unread`); return null; }
  const free = PP.freeOf(v); const handed = []; const src = { handoff: 0, snap: 0 };
  for (const x of SENDERS) {
    const h = PP.readCoins(P("private", `pool-${x.id}.handoff.json`), PAY_ADDR); const sn = h ? null : PP.readCoins(P("private", `pool-${x.id}.snap.json`), PAY_ADDR);
    const got = h || sn; if (!got) continue; if (h) src.handoff++; else src.snap++;
    handed.push(...got.coins);
    try { fs.renameSync(P("private", `pool-${x.id}.${h ? "handoff" : "snap"}.json`), P("private", `pool-${x.id}.${h ? "handoff" : "snap"}.${Date.now()}.json`)); } catch {}
  }
  // (ii) every sender handed off: the handoff pools are the truth. The view drops only what it shows as spent; it adds nothing.
  const truth = why !== "start" && src.handoff === N && src.snap === 0;
  const chk = PP.validate(handed, v, Date.now(), { truth });
  const pile = Number(PF.pay_pile) || 0;
  const base = truth ? chk.keep : why === "start" ? [...free.values()] : chk.keep;
  const extra = truth || why === "start" ? [] : [...free.values()];   // a sender that did not hand off: its coins come from the free set, capped
  const capped = PP.capToPile(base, extra, pile > 0 ? pile : base.length + extra.length);
  const all = capped.coins;
  const lanes = PP.deal(all, N);
  SENDERS.forEach((x, i) => PP.writeCoins(P("private", `pool-${x.id}.json`), lanes[i], { slot: i, of: N, node: x.n, sender: x.id, why, truth }));
  const f = PP.fairness(lanes.map((l) => l.length));
  lastDeal = { why, counts: lanes.map((l) => l.length), total: all.length, fair: f.fair, truth, cut: capped.cut, pile };
  phase(`POOL_SPLIT why=${why} total=${all.length} pile=${pile} over_pile=${all.length > pile ? 1 : 0} cut=${capped.cut} truth=${truth ? "handoff" : why === "start" ? "free-set" : "handoff+free"} lanes=${SENDERS.map((x, i) => x.id + ":" + lanes[i].length).join(",")} fair=${f.fair ? 1 : 0} free_seen=${free.size} handed=${handed.length} handed_kept=${chk.keep.length} handed_spent=${chk.why.spent} handed_gone=${chk.why.gone} handed_unlisted_kept=${chk.why.unlisted_kept} from_handoff=${src.handoff} from_snap=${src.snap} mempool_spent_seen=${v.spent.size}`);
  return lastDeal;
}
// After a start: each sender's PAY_POOL is read back against the deal. A lane that loaded under half its deal is logged.
async function checkLoaded(sinceMs, deal) {
  const end = Date.now() + 60000; let m = new Map();
  while (Date.now() < end) { m = payPools(sinceMs); if (SENDERS.every((x) => m.has(x.id))) break; await sleepA(1000); }
  const counts = SENDERS.map((x) => m.get(x.id)?.n ?? 0);
  const f = PP.fairness(counts);
  const low = deal ? SENDERS.filter((x, i) => (m.get(x.id)?.n ?? 0) < deal.counts[i] / 2).map((x) => x.id) : [];
  phase(`POOL_LOADED total=${counts.reduce((a, b) => a + b, 0)} lanes=${SENDERS.map((x, i) => x.id + ":" + counts[i] + "/" + (m.get(x.id)?.from || "-")).join(",")} fair=${f.fair ? 1 : 0}${low.length ? " low=" + low.join(",") : ""}`);
  return { counts, fair: f.fair, low };
}
// The one payment-sender repair: ask each sender to hand off its pool; kill only one that does not; wait until every stopped
// process is gone; deal the pools again; start them and check that each one logged its start and its pool.
async function repairPay() {
  const t = Date.now();
  for (const x of SENDERS) try { fs.unlinkSync(P("control", `PAY-STOP-${x.id}`)); } catch {}
  const victims = [...kids.entries()].filter(([name]) => name.startsWith("pay-"));
  for (const [, c] of victims) expectExit.add(c.pid);
  for (const x of SENDERS) fs.writeFileSync(P("control", `PAY-HANDOFF-${x.id}`), "repair\n");
  let end = Date.now() + 30000;
  while (Date.now() < end && victims.some(([, c]) => alive(c.pid))) await sleepA(250);
  const killed = victims.filter(([, c]) => alive(c.pid));
  for (const [, c] of killed) { try { c.kill(); } catch {} }
  end = Date.now() + 60000;
  while (Date.now() < end && victims.some(([, c]) => alive(c.pid))) await sleepA(500);
  const stuck = victims.filter(([, c]) => alive(c.pid)).length;
  for (const [name, c] of victims) { if (!alive(c.pid)) { kids.delete(name); expectExit.delete(c.pid); phase(`REPAIR_EXIT proc=pay sender=${name.slice(4)}`); } }
  for (const x of SENDERS) try { fs.unlinkSync(P("control", `PAY-HANDOFF-${x.id}`)); } catch {}
  await sleepA(3000);   // let the last submits reach the desk node's mempool before the view is read
  const deal = await prepareLanes("repair");
  const t2 = Date.now();
  const started = startPay();
  const want = SENDERS.map((x) => x.id); let seen = [];
  const end2 = Date.now() + 90000;
  while (Date.now() < end2) { seen = [...new Set(payStarts(t2))]; if (want.every((n) => seen.includes(n))) break; await sleepA(1000); }
  const up = want.filter((n) => seen.includes(n) && kids.get("pay-" + n) && alive(kids.get("pay-" + n).pid));
  const ld = await checkLoaded(t2, deal);
  phase(`REPAIR_RESTART proc=pay started=${started.length} running=${up.length}/${want.length} stuck=${stuck} killed=${killed.length} pool=${ld.counts.join("/")} fair=${ld.fair ? 1 : 0} deal_total=${deal ? deal.total : 0} pile=${deal ? deal.pile : 0} truth=${deal && deal.truth ? "handoff" : "merged"}`);
  return { started: started.length, running: up.length, of: want.length, killed: killed.length, pool: ld.counts, fair: ld.fair, since: t, deal };
}
const setRate = (r) => { fs.writeFileSync(P("control", "PAY-RATE"), String(r) + "\n"); phase("PAY_RATE total=" + r + " senders=" + N); };

function payRows(minute) {
  const out = [];
  for (const x of SENDERS) {
    const f = P("logs", `pay-minute-${x.id}.log`); if (!fs.existsSync(f)) continue;
    for (const l of fs.readFileSync(f, "utf8").split(/\r?\n/)) if (l.startsWith(minute + "Z ")) { const o = {}; for (const kv of l.split(" ").slice(1)) { const [a, b] = kv.split("="); o[a] = Number(b); } o.n = x.n; o.s = x.id; out.push(o); }
  }
  return out;
}
// GO-DESK clean minute: no sender-off, pool-low, node-drop, or proc-exit, every family still attempting. A STALL is logged per minute, not a dirt.
const DIRTY = /SENDER_OFF|POOL_LOW|NODE_DROP|PROC_EXIT|PAY_STOP|PAY_EXIT|FAMILY_DROP/;
// (i) a family-node skip is dirt with its reason for every minute it covers: from NODE_SKIP until NODE_SKIP_CLEAR.
function famSkipIn(minute) {
  const t0 = Date.parse(minute + ":00Z"), t1 = t0 + 60000; let on = null; const hit = new Set();
  for (const l of fs.readFileSync(P("logs", "phase.log"), "utf8").split(/\r?\n/)) {
    const ms = Date.parse(l.slice(0, 20)); if (!Number.isFinite(ms) || ms >= t1) { if (ms >= t1) break; continue; }
    const a = l.match(/NODE_SKIP node=fam reason=(\S+)/); const b = /NODE_SKIP_CLEAR node=fam/.test(l);
    if (a) { on = a[1]; if (ms >= t0) hit.add(on); } else if (b) { if (on && ms >= t0) hit.add(on); on = null; }
  }
  if (on) hit.add(on);
  return [...hit];
}
const mempoolHigh = (minute) => phaseLines(minute).filter((l) => /NODE_MEMPOOL_HIGH node=fam/.test(l)).length;
const phaseLines = (minute) => fs.readFileSync(P("logs", "phase.log"), "utf8").split(/\r?\n/).filter((l) => l.startsWith(minute));
function phaseIn(minute) { return phaseLines(minute).filter((l) => DIRTY.test(l) && !/^\S+ NODE_SKIP/.test(l)).map((l) => l.slice(21).split(" ")[0]).filter(Boolean); }
const results = [];   // per minute evaluated, all steps
function evalMinute(step, target, minute) {
  readSub();
  const t0 = Date.parse(minute + ":00Z"), t1 = t0 + 60000;
  const pr = payRows(minute);
  const ok = pr.reduce((s, r) => s + (r.ok || 0), 0), att = pr.reduce((s, r) => s + (r.attempts || 0), 0);
  const rrate = pr.reduce((s, r) => s + (r.rate || 0), 0), rfull = pr.reduce((s, r) => s + (r.full || 0), 0), roth = pr.reduce((s, r) => s + (r.other || 0), 0);
  const L = landed();
  const coh = {};
  for (const c of COHORTS) {
    const rows = subRows.filter((r) => r.ts >= t0 && r.ts < t1 && cohortOfFamily(r.family) === c);
    const okRows = subRows.filter((r) => r.ts < t1 && r.result === "ok" && cohortOfFamily(r.family) === c);
    coh[c] = { ok: rows.filter((r) => r.result === "ok").length, attempts: rows.length, rej_rate: rows.filter((r) => r.result !== "ok" && (r.reason === "fee" || r.reason === "mass")).length, rej_full: rows.filter((r) => r.result !== "ok" && r.reason === "mempool_full").length, waiting: okRows.filter((r) => !(L.get(r.txid)?.ms < t1)).length, rate: [...new Set(rows.map((r) => r.rate))].join("/") };
  }
  const famAtt = new Set(subRows.filter((r) => r.ts >= t0 && r.ts < t1).map((r) => r.family));
  const why = [];
  if (Math.abs(ok - target * 60) > target * 6) why.push("ok-off");
  if (pr.length < N) why.push("proc-row-missing");
  const m = marks[minute] || {};
  for (const x of kept) { const s = m[x.n] || []; if (!s.length || s.some((q) => q.fail)) why.push("node-" + x.n + "-unread"); else if (s.some((q) => !q.synced)) why.push("node-" + x.n + "-unsynced"); else if (s.length > 1 && s[s.length - 1].daa <= s[0].daa) why.push("node-" + x.n + "-daa-still"); }
  if (famNode.desk) { const s = m[0] || []; if (!s.length || s.some((q) => q.fail)) why.push("fam-node-unread"); else if (s.some((q) => !q.synced)) why.push("fam-node-unsynced"); else if (s.length > 1 && s[s.length - 1].daa <= s[0].daa) why.push("fam-node-daa-still"); }
  for (const p of new Set(phaseIn(minute))) why.push(p.toLowerCase());
  for (const r of famSkipIn(minute)) why.push("node-skip-fam:" + r);
  const missing = liveFams.filter((n) => !famAtt.has(n)); if (missing.length) why.push("families-not-attempting=" + missing.length);
  const stalls = phaseLines(minute).filter((l) => /STALL family/.test(l)).length;
  const r = { step, minute, ok, att, rrate, rfull, roth, coh, stalls, mhigh: mempoolHigh(minute), clean: why.length ? 0 : 1, why: why.join(";") || "-", pr };
  results.push(r); log(`MINUTE ${step} ${minute} ok=${ok} att=${att} clean=${r.clean} ${r.why}`);
  return r;
}
async function waitMinuteClosed(minute) { const t = Date.parse(minute + ":00Z") + 60000 + 12000; while (Date.now() < t) await sleep(1000); }
const fixes = [];
async function scored(step, target) {
  const ts = Date.now(); setRate(target); const st = startPay();
  if (firstStart) {
    firstStart = false;
    if (st.length) {
      // every sender must log its start; one that died before PAY_START is started again once (startPay starts missing senders)
      let seen = []; const e = Date.now() + 60000;
      while (Date.now() < e) { seen = [...new Set(payStarts(ts))]; if (SENDERS.every((x) => seen.includes(x.id))) break; await sleepA(1000); }
      const miss = SENDERS.filter((x) => !seen.includes(x.id)).map((x) => x.id);
      if (miss.length) { await sleepA(6000); const again = startPay(); phase(`PAY_START_MISSING senders=${miss.join(",")} restarted=${again.join(",") || "-"}`); }
      await checkLoaded(ts, lastDeal);
    }
  }
  let first = Math.ceil((Date.now() + 30000) / 60000) * 60000;   // skip the ramp minute
  let cleanN = 0, n = 0, repaired = false;
  const mins = [], all = [];
  for (let t = first; ; t += 60000) {
    const minute = mkey(t); await waitMinuteClosed(minute);
    const r = evalMinute(step, target, minute); mins.push(r); all.push(r); n++; cleanN += r.clean;
    if (cleanN >= 3) return { head: "MET", mins: all, repaired };
    if (n >= 6 && !repaired) {
      repaired = true; const z = isoZ();
      const dirt = [...new Set(mins.flatMap((x) => x.why.split(";")))].filter((w) => w !== "-").join(", ");
      const rp = await repairPay();
      fixes.push({ z, step, what: dirt || "minutes not clean", change: `restarted the payment senders with their pools handed off and dealt again (one try for this reason; ${rp.running} of ${rp.of} running again after the restart, pools ${rp.pool.join(" / ")} coins, ${rp.fair ? "fair" : "not fair"}; deal ${rp.deal ? rp.deal.total : 0} of a ${rp.deal ? rp.deal.pile : 0}-coin pile, ${rp.deal && rp.deal.truth ? "handoff pools as the truth" : "handoff plus free set, capped at the pile"}${rp.killed ? `, ${rp.killed} killed after no handoff` : ""})`, why: "fewer than three clean minutes in six" });
      const fx = "# Fixes\n\n" + fixes.map((f) => `- ${f.z} ${f.step}: failed: ${f.what}. Changed: ${f.change}. Why: ${f.why}.`).join("\n") + "\n";
      let pr = publishOver("logs/FIXES.md", fx, `Log the ${step} repair.`); if (!pr.ok) { await sleepA(GIT_GAP_MS); pr = publishOver("logs/FIXES.md", fx, `Log the ${step} repair.`); } log(pr.ok ? "FIXES on origin" : "GIT_FAIL " + pr.why);
      first = t + 60000; n = 0; cleanN = 0; mins.length = 0; t = Math.ceil((Date.now() + 30000) / 60000) * 60000 - 60000; continue;
    }
    if (n >= 6 && repaired) return { head: "NOT MET", mins: all, repaired };
  }
}
function publishOver(rel, body, msg) {   // FIXES.md grows; one commit per update
  if (!fetchO()) return { ok: false, why: "fetch" };
  G(["checkout", "-q", "main"]); const ff = G(["merge", "--ff-only", "origin/main"]); if (ff.code !== 0) return { ok: false, why: "ff" };
  fs.mkdirSync(path.join(REPO, path.dirname(rel)), { recursive: true }); fs.writeFileSync(path.join(REPO, rel), body);
  G(["add", "--", rel]); const c = G(["commit", "-q", "-m", msg, "--", rel]); if (c.code !== 0) return { ok: false, why: "commit" };
  let p = G(["push", "origin", "HEAD:main"]); if (p.code !== 0) { G(["pull", "--rebase", "-q", "origin", "main"]); p = G(["push", "origin", "HEAD:main"]); }
  return p.code === 0 ? { ok: true } : { ok: false, why: "push " + p.out };
}

// lane coin sizes, read from the node at file time
async function coinSizes() {
  try {
    const c = await rpcOf(CFG.main_node_url);
    const bag = await to(c.getUtxosByAddresses({ addresses: [keyAddress(0)] }), 60000);
    const m = new Map();
    for (const e of bag.entries || []) { if (e.isCoinbase || BigInt(e.amount) <= 300_000_000n) continue; const t = Math.round(Number(e.amount) / 1e8); m.set(t, (m.get(t) || 0) + 1); }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  } catch { return null; }
}
const fmt = (n) => Number(n).toLocaleString("en-US");
const med = (a) => { if (!a.length) return "-"; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const p95 = (a) => { if (!a.length) return "-"; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * 0.95))]; };
// (iv) the counter's minutes: the last line per minute in logs/chain-minute.log (a reorg after final writes it again).
function chainRows() {
  const m = new Map(); const f = P("logs", "chain-minute.log"); if (!fs.existsSync(f)) return m;
  for (const l of fs.readFileSync(f, "utf8").split(/\r?\n/)) { const k = l.slice(0, 16); if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(k)) continue; const o = { line: l }; for (const kv of l.split(" ").slice(1)) { const i = kv.indexOf("="); if (i > 0) o[kv.slice(0, i)] = kv.slice(i + 1); } m.set(k, o); }
  return m;
}
const COUNT_WAIT_MS = Number(process.env.STORM_COUNT_WAIT_MS || 180000);
async function waitChain(minutes) {   // wait for the counter to finalise these minutes; never fill one in
  const end = Date.now() + COUNT_WAIT_MS; let m = chainRows();
  while (Date.now() < end && !minutes.every((k) => m.get(k)?.final === "1")) { await sleepA(3000); m = chainRows(); }
  return m;
}
const incl = (c) => (c ? Number(c.acc) - Number(c.cb) : null);
const chainCell = (c) => (!c ? "not read" : c.final !== "1" ? "not final" : c.partial === "1" ? "partial" : c.lag === "0" ? "kept pace" : c.lag === "1" ? "LAGGING" : c.lag);
function chainTable(keys, cm) {
  const out = [`| Minute (UTC) | Included, all non-coinbase | Our payments included | ${COHORTS.map(cohHead).join(" | ")} | Other traffic | Chain blocks | DAA gap max | Sink age max, ms | Final after, s | Counter |`, `|---|---:|---:|${COHORTS.map(() => "---:").join("|")}|---:|---:|---:|---:|---:|---|`];
  for (const k of keys) { const c = cm.get(k); if (!c) { out.push(`| ${k} | - | - | ${COHORTS.map(() => "-").join(" | ")} | - | - | - | - | - | not read |`); continue; }
    out.push(`| ${k} | ${fmt(incl(c))} | ${fmt(c.pay)} | ${HK.map((h) => c[h] ?? "-").join(" | ")} | ${fmt(c.other)} | ${c.chain_blocks} | ${c.gap_max} | ${c.sink_age_max_ms} | ${c.late_s} | ${chainCell(c)} |`); }
  return out;
}
async function renderDesk(step, target, head, mins, extra = []) {
  const cm = await waitChain(mins.map((r) => r.minute));
  readSub(); const L = landed(); const sizes = await coinSizes();
  const t0 = Math.min(...mins.map((r) => Date.parse(r.minute + ":00Z"))), t1 = Math.max(...mins.map((r) => Date.parse(r.minute + ":00Z"))) + 60000;
  const rates = Object.fromEntries(COHORTS.map((c) => [c, new Set()]));
  for (const r of subRows) if (r.ts >= t0 && r.ts < t1) rates[cohortOfFamily(r.family)].add(r.rate);
  const inclOk = mins.filter((r) => { const c = cm.get(r.minute); return c && c.final === "1" && Math.abs(Number(c.pay) - r.ok) <= r.ok * 0.1; }).length;
  const lines = [head, "", `Scored on submit-OK, not on inclusion. Inclusion, reported and not scored: in ${inclOk} of ${mins.length} minutes our payments included (desk counter) were within 10 percent of submit-OK.`, "", `# ${step}, desk, pre-run 9`, "", "> Counts only. Submit-OK is the desk's sender log. Included is what the desk's private TN10 node accepted on chain, read by the desk counter, by accepting chain block time. Mini's files are a second read.", ""];
  for (const e of extra) lines.push(e);
  if (extra.length) lines.push("");
  lines.push(`Payment offer ${fmt(target)} tx/s at 150 sompi/gram, from ${N} payment senders, ${PER} per kept public node (${kept.length} unique kaspads), each its own process and connection. Families offer 1.2 hop/s, ${liveFams.length} families live, one family-sender process and one builder: ${TIER_TXT} (public map ${pubMapTxt}).`, "");
  lines.push(`Payment pile: ${fmt(PF.pay_pile)} coins on the payment key at the preflight, dealt evenly over the ${N} senders before the first payment${lastDeal ? ` (last deal, ${lastDeal.why}: ${fmt(lastDeal.total)} coins in all, ${lastDeal.counts.map(fmt).join(" / ")}, ${lastDeal.fair ? "even" : "not even"}${lastDeal.truth ? ", from the handoff pools" : ""})` : ""}. A deal never holds more coins than the preflight pile. A coin is re-used about once a second, so one sender's ceiling is about its pool per second.`, "");
  lines.push("## Submit-OK and included, per minute", "", ...(() => { const o = ["| Minute (UTC) | Pay submit-OK | Our payments included | Included, all non-coinbase | Counter |", "|---|---:|---:|---:|---|"]; for (const r of mins) { const c = cm.get(r.minute); o.push(`| ${r.minute} | ${fmt(r.ok)} | ${c ? fmt(c.pay) : "-"} | ${c ? fmt(incl(c)) : "-"} | ${chainCell(c)} |`); } return o; })(), "", "Submit-OK counts in the minute a submit was answered. Included counts in the minute of the chain block that accepted it, so a payment submitted late in one minute can be included in the next. \"Kept pace\" means the desk node's DAA stayed within 100 of the kept public kaspad and its sink was under 30 s old in every sample of that minute; \"LAGGING\" means it did not, and the count is what the node had accepted, not a network figure.", "");
  lines.push("## Chain, desk counter", "", ...chainTable(mins.map((r) => r.minute), cm), "", "Coinbase is taken out as one per merged blue block (on this node a chain block's accepted list carries the coinbase of each blue block it merges). Other traffic is the rest: other users' load, the genesis, and anything not in our logs.", "");
  lines.push("## Hop rate per cohort, as built", "", COHORTS.map((c) => `${c[0].toUpperCase() + c.slice(1)} (families ${tierOfC(c).from}–${tierOfC(c).to}, ${tierOfC(c).path === "public" ? "kept public kaspads" : "desk private node"}): ${[...rates[c]].join("/") || "no rows"} sompi/gram per hop.`).join(" ") + " The rate rides on each hop line to the one builder. Payments pay 150.", "");
  if (COHORTS.every((c) => rates[c].size === 1) && new Set(COHORTS.map((c) => [...rates[c]][0])).size === 1) lines.push("Every cohort went out at one rate in these minutes. The fee is not called the cause.", "");
  lines.push("## Funding coins, as read from the desk node", "");
  if (!sizes) lines.push("The coin sizes were not read. No size is given.", "");
  else if (sizes.length === 1) lines.push(`The funding coins were one size: ${fmt(sizes[0][0])} tKAS (${fmt(sizes[0][1])} coins).`, "");
  else lines.push(`The funding coins were not one size. Sizes seen, whole tKAS (coins): ${sizes.slice(0, 12).map(([t, c]) => `${fmt(t)} (${fmt(c)})`).join(", ")}${sizes.length > 12 ? `, and ${sizes.length - 12} more sizes` : ""}. The fee is not called the whole cause.`, "");
  lines.push("## Minutes", "", `| Minute (UTC) | Pay submit-OK | Attempts | Rejects, rate | Rejects, full | Other | ${COHORTS.map((c) => c[0].toUpperCase() + c.slice(1) + " OK / att / rate rej / full rej / waiting").join(" | ")} | Family stalls logged | Family node mempool-high marks | Clean |`, `|---|---:|---:|---:|---:|---:|${COHORTS.map(() => "---").join("|")}|---:|---:|---|`);
  for (const r of mins) lines.push(`| ${r.minute} | ${fmt(r.ok)} | ${fmt(r.att)} | ${r.rrate} | ${r.rfull} | ${r.roth} | ${COHORTS.map((c) => `${r.coh[c].ok} / ${r.coh[c].attempts} / ${r.coh[c].rej_rate} / ${r.coh[c].rej_full} / ${r.coh[c].waiting}`).join(" | ")} | ${r.stalls ?? 0} | ${r.mhigh ?? 0} | ${r.clean ? "yes" : "no: " + r.why} |`);
  lines.push("", "A family stall is a coordinator mark: no hop of that family landed for a while. The family was still attempting. It is logged, and it does not make the minute dirty.");
  lines.push("", "A mempool-high mark means the family node read a mempool at or over 90,000. In pre-run 9 that does not stop the families: the skip does not apply to them. A skip, if one were set, is dirt with its reason (node-skip-fam) for every minute it covers, and it clears when the mempool falls back under the line.");
  lines.push("", `Within 10 percent means ${fmt(Math.round(target * 60 * 0.9))} to ${fmt(Math.round(target * 60 * 1.1))} submit-OK in the minute.`, "");
  lines.push("## Public nodes (local numbers)", "", `Kept: ${kept.map((x) => x.n).join(", ")}. The family sender reads and submits floor, double, triple and high on the desk's private node, which takes no payment submit and which the desk counter reads; triple-pub (${pubMapTxt}) reads and submits on kept public kaspads, the payments' nodes.`, "", `Kept nodes are unique kaspads: each answered with its own node id at the preflight. ${PF.answered_pass} candidate endpoints passed the check and were ${PF.unique_kaspads} kaspads${(PF.collapsed || []).length ? ` (${PF.collapsed.map((c) => { const [a, b] = c.split("="); return `node ${a} is node ${b}`; }).join(", ")}; the second hostname was not used)` : ""}. ${PER} payment senders per kaspad.${idShift.size ? ` A later sample saw another node id on node ${[...idShift].join(", ")}.` : ""}`, "", "| Node | Synced every sample | Last DAA | Pay submit-OK | Pay rejects | Dropped sockets | Answer ms, median |", "|---:|---|---:|---:|---:|---:|---:|");
  const ph = fs.readFileSync(P("logs", "phase.log"), "utf8").split(/\r?\n/);
  for (const x of kept) {
    const s = mins.flatMap((r) => (marks[r.minute] || {})[x.n] || []);
    const pr = mins.flatMap((r) => r.pr.filter((q) => q.n === x.n));
    const drops = ph.filter((l) => { const ms = Date.parse(l.slice(0, 20)); return ms >= t0 && ms < t1 && new RegExp(`NODE_DROP node=${x.n}\\b`).test(l); }).length;
    lines.push(`| ${x.n} | ${s.length && s.every((q) => q.synced) ? "yes" : "no"} | ${s.length ? s[s.length - 1].daa : "-"} | ${fmt(pr.reduce((a, q) => a + (q.ok || 0), 0))} | ${pr.reduce((a, q) => a + (q.rate || 0) + (q.full || 0) + (q.other || 0), 0)} | ${drops} | ${med(s.map((q) => q.ms))} |`);
  }
  lines.push("", "## Payment senders", "", "| Sender | Node | Pay submit-OK | Rejects | Minutes with a row |", "|---|---:|---:|---:|---:|");
  for (const x of SENDERS) { const pr = mins.flatMap((r) => r.pr.filter((q) => q.s === x.id)); lines.push(`| ${x.id} | ${x.n} | ${fmt(pr.reduce((a, q) => a + (q.ok || 0), 0))} | ${pr.reduce((a, q) => a + (q.rate || 0) + (q.full || 0) + (q.other || 0), 0)} | ${pr.length} of ${mins.length} |`); }
  lines.push("", "## Hop submit to landing, per cohort", "", "| Cohort | Landed of OK | Median ms | Slow tail (p95) ms |", "|---|---:|---:|---:|");
  for (const c of COHORTS) {
    const ok = subRows.filter((r) => r.ts >= t0 && r.ts < t1 && r.result === "ok" && cohortOfFamily(r.family) === c);
    const dd = ok.filter((r) => L.get(r.txid)).map((r) => L.get(r.txid).ms - r.ts);
    lines.push(`| ${c} | ${dd.length} of ${ok.length} | ${med(dd)} | ${p95(dd)} |`);
  }
  lines.push("", "Landing is the accepting block header time the desk's coordinator read. Waiting is submitted-OK not yet landed at the minute's end. Triple and triple-pub pay the same rate; they differ only in the node a hop is read and submitted on.", "");
  return lines.join("\n");
}
const onOrigin = {};
async function closeStep(step, target, head, mins, extra) {
  const body = await renderDesk(step, target, head, mins, extra);
  fs.writeFileSync(P("out", `${step}.md`), body);   // the local copy of the count file, before any push
  const r = await publishRetry(`counts/desk/${step}.md`, body, `Desk ${step}: ${head}.`);
  if (!r.ok) { log("GIT_FAIL " + r.why); await fail(`could not push counts/desk/${step}.md after ${GIT_TRIES} tries (${clean(r.why).slice(0, 80)})`); }
  onOrigin[step] = r.ms; log(`PUBLISHED counts/desk/${step}.md ${head} on origin ${isoZ(r.ms)}`);
  return r.ms;
}

const summary = {};
const FROM = "HOLD-1";
// (vii) pre-run 9 offers. HOLD-4 and RETURN at 1,013: the over-capacity load ends when HOLD-3's minutes are scored.
const STEPS = [["HOLD-1", 1013], ["HOLD-2", 1800], ["HOLD-3", 2500]];
const H4_RATE = 1013, RET_RATE = 1013;
for (const [step] of STEPS.slice(0, Math.max(0, STEPS.findIndex(([x]) => x === FROM)))) {
  fetchO(); const t = show(`counts/desk/${step}.md`); if (!t) HELD("resume-step-missing", step);
  summary[step] = { head: /^NOT MET/.test(t.trim()) ? "NOT MET" : "MET", mins: [] }; onOrigin[step] = originMs(`counts/desk/${step}.md`);
  log(`RESUME ${step} already on origin: ${summary[step].head}`);
}
{
  const d = await prepareLanes("start");
  if (!d || !d.total) await fail("no payment coins to deal");
  log(`PILE pay_pile=${PF.pay_pile} dealt=${d.total} senders=${N} per_node=${PER} per_sender=${d.counts.join("/")} hold2_share=${Math.ceil(1800 / N)} hold3_share=${Math.ceil(2500 / N)}`);
  if (d.total > PF.pay_pile) await fail("deal over the preflight pile");
}
let firstStart = true;
for (const [step, target] of STEPS.filter(([x]) => !summary[x])) {
  phase(`STEP ${step} offer=${target}`);
  const s = await scored(step, target);
  if (step === "HOLD-3") { setRate(H4_RATE); phase(`OVER_CAPACITY_END rate=${H4_RATE} after=HOLD-3`); }   // (vii) keep the over-capacity minutes short
  summary[step] = s; await closeStep(step, target, s.head, s.mins);
}
// HOLD-4: the pinned minute
const h3 = onOrigin["HOLD-3"]; const pin = Math.ceil((h3 + 180000) / 60000) * 60000; const pinKey = mkey(pin);
log("HOLD4 pinned minute " + pinKey + "Z");
while (Date.now() < pin - 45000) await sleep(1000);
setRate(H4_RATE); startPay(); phase(`STEP HOLD-4 offer=${H4_RATE}`);
await waitMinuteClosed(pinKey);
const h4 = evalMinute("HOLD-4", H4_RATE, pinKey);
const synced4 = kept.every((x) => ((marks[pinKey] || {})[x.n] || []).every((q) => q.synced) && ((marks[pinKey] || {})[x.n] || []).length);
await closeStep("HOLD-4", H4_RATE, "OBSERVATION", [h4], [`The pinned minute is the first whole UTC minute whose start is at least 3 minutes after HOLD-3's On origin time. In pre-run 9 the payment offer dropped to ${fmt(H4_RATE)} tx/s as soon as HOLD-3's minutes were scored, so this minute reads the drain after the over-capacity step, not a higher offer.`].concat(synced4 ? [] : ["The path was not synced in this minute."]));
summary["HOLD-4"] = { head: "OBSERVATION", mins: [h4] };
// RETURN
phase(`STEP RETURN offer=${RET_RATE}`);
const ret = await scored("RETURN", RET_RATE); summary.RETURN = ret;
await closeStep("RETURN", RET_RATE, ret.head, ret.mins);
await stopAll("return-closed");

// (iv) the drain tail: payments and families are stopped; the counter reads 5 more minutes, then stops, and the timeline
// of every minute it read goes to counts/chain/TIMELINE.md.
const TAIL_MS = Number(process.env.STORM_COUNT_TAIL_MS || 300000);
phase("COUNT_TAIL start minutes=" + Math.round(TAIL_MS / 60000));
await sleepA(TAIL_MS);
{ const last = mkey(Date.now() - 60000); await waitChain([last]); }
fs.writeFileSync(P("control", "COUNTER-STOP"), "tail-done\n");
{ const e = Date.now() + 60000; while (Date.now() < e && kids.has("counter") && alive(kids.get("counter").pid)) await sleepA(1000); if (kids.has("counter") && alive(kids.get("counter").pid)) { try { kids.get("counter").kill(); } catch {} } }
phase("COUNT_TAIL end");
const stepStarts = fs.readFileSync(P("logs", "phase.log"), "utf8").split(/\r?\n/).map((l) => { const m = l.match(/^(\S+) STEP (\S+) offer=(\d+)/); return m ? { ms: Date.parse(m[1]), step: m[2], offer: Number(m[3]) } : null; }).filter(Boolean);
const tailAt = (() => { const l = fs.readFileSync(P("logs", "phase.log"), "utf8").split(/\r?\n/).find((x) => /RUN_STOP reason=return-closed/.test(x)); return l ? Date.parse(l.slice(0, 20)) : Date.now(); })();
const stepOf = (k) => { const ms = Date.parse(k + ":00Z"); if (ms >= tailAt - 59999) return "tail"; let s = "families"; for (const x of stepStarts) if (ms >= x.ms - 59999) s = x.step; return s; };
const CM = chainRows();
const scoredSet = new Set(Object.values(summary).flatMap((x) => x.mins.map((r) => r.minute)));
const okBy = new Map(results.map((r) => [r.minute, r.ok]));
{
  const keys = [...CM.keys()].sort();
  const t = ["> **Experimental. We are just trying this.** [Disclaimer](../../DISCLAIMER.md) · Kaspa Testnet-10 only; tKAS has no value. Counts only.", "", "# Chain timeline, pre-run 9", "",
    "Every minute the desk counter read, from its start to the end of the 5-minute tail after RETURN. Read on the desk's private TN10 node, by accepting chain block header time. Submit-OK is the desk sender log for scored minutes (a dash where the runner did not score the minute). A minute marked LAGGING, partial, or not final is what the node had accepted at that point, not a network figure. Nothing is filled in.", "",
    `| Minute (UTC) | Step | Scored | Pay submit-OK | Our payments included | ${COHORTS.map(cohHead).join(" | ")} | Other traffic | Included, all non-coinbase | Chain blocks | DAA gap max | Sink age max, ms | Counter |`,
    `|---|---|---|---:|---:|${COHORTS.map(() => "---:").join("|")}|---:|---:|---:|---:|---:|---|`];
  for (const k of keys) { const c = CM.get(k); t.push(`| ${k} | ${stepOf(k)} | ${scoredSet.has(k) ? "yes" : ""} | ${okBy.has(k) ? fmt(okBy.get(k)) : "-"} | ${fmt(c.pay)} | ${HK.map((h) => c[h] ?? "-").join(" | ")} | ${fmt(c.other)} | ${fmt(incl(c))} | ${c.chain_blocks} | ${c.gap_max} | ${c.sink_age_max_ms} | ${chainCell(c)} |`); }
  const tot = { pay: 0, ...Object.fromEntries(HK.map((h) => [h, 0])) }; for (const c of CM.values()) for (const k of Object.keys(tot)) tot[k] += Number(c[k]) || 0;
  let payOk = 0; for (const s0 of fs.readdirSync(P("private"))) if (/^paytx-[\d.]+\.txt$/.test(s0)) payOk += fs.readFileSync(P("private", s0), "utf8").split("\n").filter(Boolean).length;
  t.push("", `Whole run, as read: our payments submit-OK ${fmt(payOk)}, of which included by the end of the tail ${fmt(tot.pay)} (${payOk ? ((100 * tot.pay) / payOk).toFixed(1) : "-"} percent). Family hops included: ${COHORTS.map((c) => `${c} ${fmt(tot["h_" + c])}`).join(", ")}.`, "");
  const body = t.join("\n");
  fs.writeFileSync(P("out", "TIMELINE.md"), body);
  const r = await publishRetry("counts/chain/TIMELINE.md", body, "Desk counter: chain timeline.");
  log(r.ok ? "PUBLISHED counts/chain/TIMELINE.md" : "GIT_FAIL TIMELINE " + r.why);
  if (r.ok) onOrigin["chain/TIMELINE"] = r.ms;
}

// METHOD.md
{
  readSub(); const L = landed();
  const landedBy = Object.fromEntries(COHORTS.map((c) => [c, 0])); for (const [, v] of L) landedBy[cohortOfFamily(v.family)]++;
  const decent = summary["HOLD-1"].head === "MET";
  const sizes = await coinSizes();
  const sumOf = (mins, k) => mins.reduce((a, r) => a + (Number(CM.get(r.minute)?.[k]) || 0), 0);
  const lagN = (mins) => mins.filter((r) => { const c = CM.get(r.minute); return !c || c.final !== "1" || c.partial === "1" || c.lag !== "0"; }).length;
  const m = ["# Method, pre-run 9", "", "> Counts only. Desk side. Submit-OK is the desk sender log; included is the desk counter's read of what the desk's private TN10 node accepted on chain. Mini's files are a second read.", "",
    `Accepted hops per cohort, as the desk's coordinator read them: ${COHORTS.map((c) => `${c} ${fmt(landedBy[c])}`).join(", ")}.`, "",
    "Payment submit-OK and included per scored minute:", "",
    ...["HOLD-1", "HOLD-2", "HOLD-3", "HOLD-4", "RETURN"].map((s0) => `- ${s0}: ${summary[s0].head}${summary[s0].head === "MET" ? " on submit-OK" : ""}, submit-OK ${summary[s0].mins.map((r) => fmt(r.ok)).join(" / ")}; our payments included ${summary[s0].mins.map((r) => (CM.get(r.minute) ? fmt(CM.get(r.minute).pay) : "-")).join(" / ")}; hops included ${COHORTS.join("/")} ${HK.map((h) => sumOf(summary[s0].mins, h)).join("/")}; counter minutes not kept-pace ${lagN(summary[s0].mins)} of ${summary[s0].mins.length}.`), "",
    decent ? "Decent on the desk side: HOLD-1 met." : "Short of decent: HOLD-1 was not met.", "",
    "## Selection rule, read before the run", "",
    "The desk node and the kept public kaspads answered serverVersion 2.1.0 at the preflight. In rusty-kaspa tag v2.1.0 (commit 01b532e8b553523216471682649693af92f0fd16), `mining/src/mempool/model/frontier.rs` `build_selector` takes every ready transaction best-first while the ready set's mass fits one block, and otherwise samples at random with weight (fee/mass)^3 (`ALPHA = 3` in `mining/src/mempool/model/frontier/selectors.rs`, weight in `mining/src/mempool/model/frontier/feerate_key.rs`): `sample_inplace` above four blocks' mass, `MutatingTreeSelector` between one and four. Only a transaction with no parent in the mempool is in the ready set (`mining/src/mempool/model/transactions_pool.rs`), so a chained hop is not a candidate until its parent is out of the mempool. Against payments at 150, the weights are 0.30 (100), 2.4 (200), 8 (300) and 296 (1000). A higher fee raises the odds; it does not buy a place in a queue. This is the source's rule, read from the code; the run does not see a miner's template.", "",
    `Hop rates per hop, one builder: ${TIER_TXT}. Payments 150. ` + (sizes && sizes.length > 1 ? "The funding coins were not one size, so the fee is not called the whole cause." : "") + ` Triple-pub (${pubMapTxt}) was read and submitted on the kept public kaspads; every other cohort on the desk's private TN10 node, which took no payment submit and also ran the counter. Payments: ${N} senders, ${PER} per kept kaspad, ${kept.length} unique kaspads, pile ${fmt(PF.pay_pile)} coins.`, "",
    "## Misses", "", ...Object.entries(summary).filter(([, s0]) => s0.head === "NOT MET").map(([k]) => `- ${k} NOT MET.`), Object.values(summary).some((s0) => s0.head === "NOT MET") ? "" : "- none", "",
    "## Fixes", "", ...(fixes.length ? fixes.map((f) => `- ${f.z} ${f.step}: ${f.change}.`) : ["- none"]), "",
    "## On origin", "", ...Object.entries(onOrigin).map(([k, v]) => `- counts/${k.includes("/") ? k : "desk/" + k}.md: ${isoZ(v)}`), ""];
  const r = await publishRetry("logs/METHOD.md", m.join("\n"), "Pre-run 9 method.");
  log(r.ok ? "PUBLISHED logs/METHOD.md" : "GIT_FAIL " + r.why);
}
log("RUN end");
process.exit(0);
