# Live /download 1.9.69 update

## Blocker

Production **custodynote.com** is **not** built from this public GitHub repo’s current tree.

| What | Where |
|------|--------|
| Live UI (1.9.68 today) | Private `robertcashman-bit/custody-note-website` |
| Vercel project | `custody-note-website` (`prj_zPV1EYswHU0Nih1iASwSOxEY64NN`) |
| This repo (`robertdavidcashman-droid/custody-note-website`) | Older 1.9.52-era site (Windows-only `/download`) |

Live download buttons go through `/api/stats/download`, which currently redirects to **bit** `v1.9.68` assets. New **1.9.69** Win + unsigned Mac builds are on **droid**:

- `Custody-Note-Setup-1.9.69.exe`
- `Custody-Note-1.9.69-arm64.dmg`
- `Custody-Note-1.9.69-x64.dmg`

## Apply (needs secrets)

```bash
export GH_PAT=...          # repo access to robertcashman-bit/custody-note-website
export VERCEL_TOKEN=...    # optional but recommended for immediate prod deploy
node scripts/apply-download-1.9.69.mjs
```

The script:

1. Verifies the three droid release assets exist
2. Clones the private website
3. Syncs `data/releases.json` to **1.9.69**
4. Replaces `/download` + `MacDownloadPicker` with unsigned-Mac Gatekeeper copy (keeps Windows SmartScreen guidance)
5. Retargets api/lib release host from `robertcashman-bit` → `robertdavidcashman-droid`
6. Pushes `master` and optionally `vercel deploy --prod`

Patch sources live in `scripts/download-1.9.69-patches/`.
