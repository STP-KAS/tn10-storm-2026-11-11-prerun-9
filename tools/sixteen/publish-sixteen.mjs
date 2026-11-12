// publish-sixteen.mjs: push a built hashes/SIXTEEN.md to pre-run 9 origin, then read the commit time back from origin
// and push the On origin line. Two commits, one file. Does not build, does not submit. TESTNET-10 run repo only.
//
//   node publish-sixteen.mjs --repo <local clone> --git <full path to git> --gates-only
//   node publish-sixteen.mjs --repo <local clone> --git <full path to git> --file <built SIXTEEN.md> --bundle <private bundle.json> [--check-only]
//
// Hashes first: this file lands before the arm. PRE-RUN-OPEN and MINI-ARMED are not gates for it (they are read and
// reported only). Gates read from origin/main before any write: logs/BOT-HALT.md and logs/FAILED.md are absent, and
// hashes/SIXTEEN.md is absent (no republish). The file must verify, match the bundle row for row, and must not be a
// fixture. A fixture is refused unless origin is a local test path (never GitHub). Writing it is not an arm and not a send.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { verify, withOrigin, shaOfId, FAMILIES } from "./sixteen-format.mjs";

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf("--" + n); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const has = (n) => argv.includes("--" + n);
const say = (o) => console.log(JSON.stringify(o));
const stop = (reason, extra = {}, code = 5) => { say({ ok: 0, reason, ...extra }); process.exit(code); };
const clean = (s) => String(s ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean)[0]?.replace(/[A-Z]:\\\S+/g, "<path>").replace(/https?:\/\/\S+/g, "<url>").slice(0, 160) || "empty";

const repo = arg("repo"), git = arg("git"), file = arg("file"), bundlePath = arg("bundle");
const gatesOnly = has("gates-only");
if (!repo || !git || (!gatesOnly && (!file || !bundlePath))) stop("args", { need: "--repo --git, and --file --bundle unless --gates-only" }, 2);
if (!path.isAbsolute(git) || !fs.existsSync(git)) stop("git_full_path", {}, 2);
const REL = "hashes/SIXTEEN.md";

const G = (args) => { const r = spawnSync(git, ["-C", repo, ...args], { encoding: "utf8" }); return { code: r.status, out: (r.stdout || "") + (r.stderr || ""), stdout: r.stdout || "" }; };
// Empty output is a failed read. Read once more, then stop.
const read = (args, what) => {
  let r = G(args);
  if (r.code !== 0 || !r.stdout.trim()) r = G(args);
  if (r.code !== 0 || !r.stdout.trim()) stop("git_read", { what, git: clean(r.out) });
  return r.stdout;
};
const fetch = () => { let r = G(["fetch", "origin", "main"]); if (r.code !== 0) r = G(["fetch", "origin", "main"]); if (r.code !== 0) stop("git_fetch", { git: clean(r.out) }); };
const onOrigin = (rel) => G(["cat-file", "-e", `origin/main:${rel}`]).code === 0;
const showOrigin = (rel) => read(["show", `origin/main:${rel}`], rel);

// ---- origin and gates --------------------------------------------------------------------------------------------
const url = read(["remote", "get-url", "origin"], "remote").trim();
const remoteIsLocal = !/^(https?:|git@|ssh:)/i.test(url);
if (!remoteIsLocal && !/STP-KAS\/tn10-storm-2026-11-11-prerun-9(\.git)?$/i.test(url)) stop("wrong_repo");
fetch();
const gates = {
  pre_run_open: onOrigin("logs/PRE-RUN-OPEN.md") && /PRE_RUN_OPEN/.test(showOrigin("logs/PRE-RUN-OPEN.md")),
  mini_armed: onOrigin("logs/MINI-ARMED.md") && /MINI_ARMED/.test(showOrigin("logs/MINI-ARMED.md")),
  bot_halt: onOrigin("logs/BOT-HALT.md"),
  failed: onOrigin("logs/FAILED.md"),
  sixteen_on_origin: onOrigin(REL),
};
const bits = Object.fromEntries(Object.entries(gates).map(([k, x]) => [k, x ? 1 : 0]));
const held = gates.bot_halt ? "bot-halt" : gates.failed ? "failed" : gates.sixteen_on_origin ? "sixteen-already-on-origin" : null;
if (held) stop("held", { held, gates: bits }, 6);
if (gatesOnly) { say({ ok: 1, mode: "gates-only", gates: "open", seen: bits, pushed: 0 }); process.exit(0); }

// ---- the file itself ---------------------------------------------------------------------------------------------
const text = fs.readFileSync(file, "utf8");
const v = verify(text);
if (!v.ok) stop("format", { errors: v.errors });
if (v.originZ) stop("file_already_has_origin_line");
const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
if (!Array.isArray(bundle) || bundle.length !== FAMILIES) stop("bundle");
const mism = bundle.filter((b) => v.rows.find((r) => r.family === b.family)?.sha !== shaOfId(b.g.covenantId)).map((b) => b.family);
if (mism.length) stop("bundle_mismatch", { families: mism });

if (v.fixture && !remoteIsLocal) stop("fixture_refused_for_remote_origin");
if (has("check-only")) { say({ ok: 1, mode: "check-only", rows: v.rows.length, gates: "open", pushed: 0 }); process.exit(0); }

// ---- local clone must be clean and at origin/main ----------------------------------------------------------------
if (G(["status", "--porcelain"]).stdout.trim()) stop("repo_dirty");
const ff = G(["merge", "--ff-only", "origin/main"]);
if (ff.code !== 0) stop("git_ff", { git: clean(ff.out) });

const abs = path.join(repo, ...REL.split("/"));
const msgFile = path.resolve(path.dirname(bundlePath), "sixteen-commit-msg.txt");
// If the rows commit fails before it is pushed, take the local write back out so a rerun starts clean.
const undoRows = () => { G(["reset", "-q", "--", REL]); if (!onOrigin(REL)) fs.rmSync(abs, { force: true }); };
const commitPush = (message) => {
  fs.writeFileSync(msgFile, message + "\n", "utf8");
  const first = message.startsWith("Publish");
  let r = G(["add", "--", REL]); if (r.code !== 0) { if (first) undoRows(); stop("git_add", { git: clean(r.out) }); }
  r = G(["commit", "-F", msgFile]); fs.rmSync(msgFile, { force: true });
  if (r.code !== 0) { if (first) undoRows(); stop("git_commit", { git: clean(r.out) }); }
  r = G(["push", "origin", "HEAD:main"]);
  if (r.code !== 0) {
    // Try once more: someone else may have pushed another file. Rebase onto origin, push again, then stop.
    fetch();
    if (first && onOrigin(REL)) stop("sixteen-appeared-on-origin");
    const rb = G(["rebase", "origin/main"]);
    if (rb.code !== 0) { G(["rebase", "--abort"]); stop("git_rebase", { git: clean(rb.out) }); }
    r = G(["push", "origin", "HEAD:main"]);
    if (r.code !== 0) stop("git_push", { git: clean(r.out) });
  }
};

// Commit 1: the rows.
fs.mkdirSync(path.dirname(abs), { recursive: true });
fs.writeFileSync(abs, text.replace(/\r\n/g, "\n"), "utf8");
commitPush("Publish the sixteen family-id hashes.");
fetch();
const remote1 = verify(showOrigin(REL));
if (!remote1.ok || remote1.rows.length !== FAMILIES) stop("origin_rows", { errors: remote1.errors });
const meta = read(["log", "-1", "--format=%cI%n%h", "origin/main", "--", REL], "origin commit").trim().split(/\r?\n/);
if (meta.length < 2) stop("origin_meta");
const z = new Date(meta[0]).toISOString().replace(/\.\d+Z$/, "Z");
const short = meta[1].trim();

// Commit 2: the On origin line, read from origin, not invented.
fs.writeFileSync(abs, withOrigin(fs.readFileSync(abs, "utf8"), z, short), "utf8");
commitPush("Record the origin time of the sixteen family-id hashes.");
fetch();
const remote2 = verify(showOrigin(REL), { requireOrigin: true });
if (!remote2.ok || remote2.originZ !== z || remote2.originCommit !== short) stop("origin_line", { errors: remote2.errors });
const tip = read(["rev-parse", "--short", "origin/main"], "tip").trim();
say({ ok: 1, rows: remote2.rows.length, fixed: remote2.fixedZ, on_origin: z, rows_commit: short, tip, pushed: 1 });
