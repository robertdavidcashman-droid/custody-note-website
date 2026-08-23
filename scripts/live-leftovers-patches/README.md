# Live leftovers (23 Aug 2026)

Production source is **private** `robertcashman-bit/custody-note-website`.
This public repo cannot deploy custodynote.com by itself.

## Apply to live

```bash
export GH_PAT=...   # repo scope on robertcashman-bit/custody-note-website
node scripts/apply-live-leftovers.mjs
```

The script:

1. Removes `/download` “free forever” + live LemonSqueezy checkout CTA
2. Retargets release/sameAs/stats downloads to `robertdavidcashman-droid/custody-note-app`
3. Pins the **downloadable** version to the latest droid release that has Win+Mac assets (currently **1.9.69** — does not invent a 1.9.70 tag)
4. Fixes Mac false claims + paid-now SEO/homepage copy
5. Adds redirects for `/subscribe` and broken police-station-reps paths
6. Pushes `cursor/live-beta-leftovers-3d76` on the private website and opens a PR

## Also clear Vercel env

Unset production `NEXT_PUBLIC_CHECKOUT_URL` (Lemon buy URL) on the Vercel project so any remaining `CHECKOUT_URL` reads stay empty during beta.
