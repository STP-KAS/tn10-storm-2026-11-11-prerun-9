> **Experimental. We are just trying this.** [Disclaimer](../DISCLAIMER.md) · No covenant id in this folder.
>
> `SIXTEEN.md` is absent until the desk writes it. Hashes first: it is written before the paste and before `PRE-RUN-OPEN`, and always before the first family submit. This is the first target of pre-run 9.

# Hashes

One file, `SIXTEEN.md`. Sixteen rows. Each row is the family label, the cohort, and the sha256 of the lowercase hex covenant id. Floor is families 1–4. Double is 5–7. Triple is 8–10. Triple-pub is 11–13. High is 14–16. The id stays off this repo.

Fixed is the local write. On origin is the commit time read from origin after the push. A file with rows and no On origin line is not proof. No file, no send.

The old desk publisher writes 8 or 32 families. It is not used for this pre-run. A file with 8 or 32 rows is not `SIXTEEN.md`. A hash is never invented. Nothing sends until this file is on origin with sixteen rows and an On origin line.

The sixteen-family path is [tools/sixteen](../tools/sixteen/README.md). It does not wait for `PRE-RUN-OPEN` or `MINI-ARMED`. It stops if `logs/BOT-HALT.md` or `logs/FAILED.md` is on origin, or if this file is already here. It builds from the real funding coins at publish time and keeps those genesis transactions for the family submit. Writing this file is not an arm and not a send. After it lands, nothing rebuilds it.
