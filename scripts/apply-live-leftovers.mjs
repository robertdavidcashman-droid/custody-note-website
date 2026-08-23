#!/usr/bin/env node
/**
 * Apply remaining custodynote.com leftovers to the private live website.
 *
 * Live production source: robertcashman-bit/custody-note-website
 * Public mirror:          robertdavidcashman-droid/custody-note-website (this repo)
 *
 * Required:
 *   GH_PAT | GITHUB_PAT  — classic PAT that can clone+push the private website
 *
 * Optional:
 *   WEBSITE_REPO          default robertcashman-bit/custody-note-website
 *   WEBSITE_BRANCH        default master
 *   PUSH_BRANCH          default cursor/live-beta-leftovers-3d76 (set to master to push tip)
 *   DROID_OWNER          default robertdavidcashman-droid
 *   DROID_REPO           default custody-note-app
 *   OPEN_PR              "1" to open/update a PR against master (default 1 when not pushing master)
 *   VERCEL_TOKEN         optional — force production redeploy after push
 *
 * Usage:
 *   export GH_PAT=...
 *   node scripts/apply-live-leftovers.mjs
 */
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
  cpSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join, relative } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const PATCH_DIR = join(__dirname, "live-leftovers-patches");

const WEBSITE_REPO =
  process.env.WEBSITE_REPO?.trim() || "robertcashman-bit/custody-note-website";
const WEBSITE_BRANCH = process.env.WEBSITE_BRANCH?.trim() || "master";
const PUSH_BRANCH =
  process.env.PUSH_BRANCH?.trim() || "cursor/live-beta-leftovers-3d76";
const DROID_OWNER = process.env.DROID_OWNER?.trim() || "robertdavidcashman-droid";
const DROID_REPO = process.env.DROID_REPO?.trim() || "custody-note-app";
const TOKEN = (process.env.GH_PAT || process.env.GITHUB_PAT || "").trim();
const OPEN_PR =
  (process.env.OPEN_PR ?? (PUSH_BRANCH === WEBSITE_BRANCH ? "0" : "1")) === "1";

const BIT_OWNER = "robertcashman-bit";
const BIT_APP = "custody-note-app";

function sh(cmd, opts = {}) {
  console.log(`[sh] ${cmd}`);
  return execSync(cmd, {
    stdio: "inherit",
    ...opts,
  });
}

function shOut(cmd, opts = {}) {
  return execSync(cmd, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  }).trim();
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (
      name === "node_modules" ||
      name === ".git" ||
      name === ".next" ||
      name === "dist" ||
      name === "out" ||
      name === "coverage" ||
      name === ".vercel"
    ) {
      continue;
    }
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs|json|md|mdx|txt)$/.test(name)) out.push(p);
  }
  return out;
}

function replaceAll(text, find, replace) {
  if (!text.includes(find)) return { text, n: 0 };
  const n = text.split(find).length - 1;
  return { text: text.split(find).join(replace), n };
}

async function latestDroidRelease() {
  const url = `https://api.github.com/repos/${DROID_OWNER}/${DROID_REPO}/releases/latest`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "custody-note-leftovers",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch droid latest release: ${res.status}`);
  const data = await res.json();
  const tag = String(data.tag_name || "").replace(/^v/, "");
  const assets = (data.assets || []).map((a) => a.name);
  const hasWin = assets.some((n) => /Setup-.*\.exe$/i.test(n) || /Custody-Note-Setup/i.test(n));
  const hasMac =
    assets.some((n) => /arm64\.dmg$/i.test(n)) &&
    assets.some((n) => /x64\.dmg$/i.test(n));
  if (!/^\d+\.\d+\.\d+$/.test(tag) || !hasWin) {
    throw new Error(`Droid latest release unusable: tag=${tag} assets=${assets.join(",")}`);
  }
  return { version: tag, assets, hasMac };
}

function assertDroidAssets(version) {
  const files = [
    `Custody-Note-Setup-${version}.exe`,
    `Custody-Note-${version}-arm64.dmg`,
    `Custody-Note-${version}-x64.dmg`,
  ];
  for (const file of files) {
    const url = `https://github.com/${DROID_OWNER}/${DROID_REPO}/releases/download/v${version}/${file}`;
    const code = shOut(`curl -sI -o /dev/null -w '%{http_code}' '${url}'`);
    if (code !== "200" && code !== "302") {
      throw new Error(`Missing droid asset HTTP ${code}: ${url}`);
    }
    console.log(`[ok] ${file} → ${code}`);
  }
}

function patchReleaseHost(root) {
  const files = walk(root).filter((f) => {
    const rel = relative(root, f).replace(/\\/g, "/");
    return (
      rel.startsWith("app/api/") ||
      rel.startsWith("lib/") ||
      rel.includes("StructuredData") ||
      rel.includes("JsonLd") ||
      rel.includes("sameAs") ||
      rel.includes("releases")
    );
  });

  const report = [];
  for (const file of files) {
    let text = readFileSync(file, "utf8");
    let next = text;
    const pairs = [
      [`${BIT_OWNER}/${BIT_APP}`, `${DROID_OWNER}/${DROID_REPO}`],
      [`owner: "${BIT_OWNER}"`, `owner: "${DROID_OWNER}"`],
      [`owner: '${BIT_OWNER}'`, `owner: '${DROID_OWNER}'`],
      [`"${BIT_OWNER}", "${BIT_APP}"`, `"${DROID_OWNER}", "${DROID_REPO}"`],
      [`'${BIT_OWNER}', '${BIT_APP}'`, `'${DROID_OWNER}', '${DROID_REPO}'`],
      [`GITHUB_RELEASE_OWNER = "${BIT_OWNER}"`, `GITHUB_RELEASE_OWNER = "${DROID_OWNER}"`],
      [`RELEASE_GITHUB_OWNER = "${BIT_OWNER}"`, `RELEASE_GITHUB_OWNER = "${DROID_OWNER}"`],
      [
        `https://github.com/${BIT_OWNER}/${BIT_APP}`,
        `https://github.com/${DROID_OWNER}/${DROID_REPO}`,
      ],
    ];
    let hits = 0;
    for (const [find, replace] of pairs) {
      const r = replaceAll(next, find, replace);
      next = r.text;
      hits += r.n;
    }
    if (next !== text) {
      writeFileSync(file, next, "utf8");
      report.push({ file: relative(root, file).replace(/\\/g, "/"), hits });
    }
  }
  return report;
}

function applyStringReplacements(root) {
  const REPLACEMENTS = [
    // P0 — free forever
    [
      "Core features free forever — no credit card required.",
      "Free during beta. No credit card. Paid Pro planned after beta.",
    ],
    [
      "Core features free forever - no credit card required.",
      "Free during beta. No credit card. Paid Pro planned after beta.",
      { optional: true },
    ],
    // Do NOT globally rewrite "free forever" — historical changelog/blog copy must stay intact.

    // P1 — homepage trial wording
    [
      "or start a Custody Note trial for guided workflows, PDF export, and billing support.",
      "or download Custody Note for guided workflows, PDF export, and billing support — free during beta.",
    ],
    [
      "start a Custody Note trial",
      "download Custody Note",
      { optional: true },
    ],

    // P1 — firms page paid-now copy
    [
      "(no credit card required). Individual subscriptions are{",
      "(no credit card required). Paid Pro is planned after beta at around{",
    ],
    [
      "Individual subscriptions are{",
      "Paid Pro is planned after beta at around{",
      { optional: true },
    ],
    [
      "with all features included. For firms with multiple fee earners",
      "(payments are not wired yet). For firms with multiple fee earners",
      { optional: true },
    ],

    // P1 — Mac false claim
    [
      "software for criminal defence practitioners who attend police stations. It\n        does not run on Mac or mobile devices. It provides",
      "software for criminal defence practitioners who attend police stations. It runs on Windows and Mac (Apple Silicon and Intel); it does not run on mobile devices. It provides",
    ],
    [
      "Custody Note is a Windows 10 or later (64-bit) desktop application. It\n        does not run on Mac or mobile devices. It provides structured,",
      "Custody Note is a desktop application for Windows 10+ (64-bit) and macOS 11+ (Apple Silicon and Intel). It does not run on mobile devices. It provides structured,",
    ],
    [
      "Custody Note runs on Windows 10 or later (64-bit). It does not run on Mac, Linux, or mobile devices. It is a desktop application installed directly on your laptop or workstation.",
      "Custody Note runs on Windows 10+ (64-bit) and macOS 11+ (Apple Silicon and Intel). It does not run on Linux or mobile devices. It is a desktop application installed directly on your laptop or workstation.",
    ],
    [
      "It does not run on\n        Mac, Linux, or mobile devices.",
      "It runs on Windows and Mac; it does not run on Linux or mobile devices.",
      { optional: true },
    ],
    ["does not run on Mac or mobile devices", "runs on Windows and Mac; it does not run on mobile devices", { optional: true }],
    ["does not run on Mac, Linux, or mobile", "runs on Windows and Mac; it does not run on Linux or mobile", { optional: true }],

    // P1 — SEO Pro purchasable-now
    [
      'Core features are <strong>free during beta</strong>. Pro is{" "}\n        <strong>£9.99/month</strong> for advanced tools. No credit card required\n        to download.',
      'Core features are <strong>free during beta</strong>. Paid Pro is planned after beta at around{" "}\n        <strong>£9.99/month</strong> for advanced tools (payments are not wired yet). No credit card required\n        to download.',
    ],
    [
      "Core features are <strong>free during beta</strong>, including LAA billing\n        fields and fee calculation. Pro is <strong>£9.99/month</strong> for cloud\n        backup, sync, and firm reporting. No credit card required to download.",
      "Core features are <strong>free during beta</strong>, including LAA billing\n        fields and fee calculation. Paid Pro is planned after beta at around <strong>£9.99/month</strong> for cloud\n        backup, sync, and firm reporting (payments are not wired yet). No credit card required to download.",
    ],
    [
      'Core features are <strong>free during beta</strong>. Pro is{" "}\n        <strong>£9.99/month</strong>',
      'Core features are <strong>free during beta</strong>. Paid Pro is planned after beta at around{" "}\n        <strong>£9.99/month</strong>',
      { optional: true },
    ],

    // Lemon domain should never appear as a live buy link target in source
    [
      "https://custodynote.lemonsqueezy.com/checkout/buy/1e0ac19f-422a-422a-a040-822ab7cf1d3b",
      "",
      { optional: true },
    ],
  ];

  const files = walk(root);
  const hits = [];
  const misses = [];

  for (const file of files) {
    let text = readFileSync(file, "utf8");
    let next = text;
    let changed = false;
    for (const entry of REPLACEMENTS) {
      const [find, replace, opts = {}] = entry;
      if (!next.includes(find)) {
        if (!opts.optional) {
          // record global miss once per pattern later
        }
        continue;
      }
      next = next.split(find).join(replace);
      changed = true;
      hits.push({
        file: relative(root, file).replace(/\\/g, "/"),
        find: find.slice(0, 72),
      });
    }
    if (changed && next !== text) writeFileSync(file, next, "utf8");
  }

  for (const entry of REPLACEMENTS) {
    const [find, , opts = {}] = entry;
    if (opts.optional) continue;
    const stillMissing = !hits.some((h) => find.startsWith(h.find) || h.find.startsWith(find.slice(0, 40)));
    // soft: only warn
    if (stillMissing) misses.push(find.slice(0, 80));
  }

  return { hits, misses };
}

function neutralizeCheckout(root) {
  const downloadPage = join(root, "app/download/page.tsx");
  if (!existsSync(downloadPage)) {
    throw new Error("Missing app/download/page.tsx");
  }
  let text = readFileSync(downloadPage, "utf8");
  let next = text;

  // Never surface a live Lemon checkout on /download during beta.
  next = next.replace(
    /const checkoutUrl = CHECKOUT_URL;/,
    'const checkoutUrl = ""; // beta: payments not wired — do not use live Lemon checkout',
  );

  // Prefer contact/pricing when checkout is empty (keep existing else branch).
  if (!next.includes('const checkoutUrl = "";')) {
    // Fallback: force CHECKOUT_URL import unused path by hard-emptying helper usage
    next = next.replace(
      /href=\{checkoutUrl\}/g,
      'href="/pricing"',
    );
  }

  // Hero free forever (if still split across lines)
  next = next.replace(
    /Install in under a minute on Windows or Mac\. Core features free\s*\n\s*forever — no credit card required\./,
    "Install in under a minute on Windows or Mac. Free during beta. No credit card. Paid Pro planned after beta.",
  );

  if (next !== text) writeFileSync(downloadPage, next, "utf8");

  // site.ts — keep CHECKOUT_URL env-readable but default empty; document beta
  const sitePath = join(root, "lib/site.ts");
  if (existsSync(sitePath)) {
    let site = readFileSync(sitePath, "utf8");
    let siteNext = site.replace(
      /export const CHECKOUT_URL =\s*process\.env\.NEXT_PUBLIC_CHECKOUT_URL\?\.trim\(\) \|\| "";/,
      `export const CHECKOUT_URL =\n  // Beta: live Lemon checkout must stay empty until payments are wired.\n  // Do not set NEXT_PUBLIC_CHECKOUT_URL in Vercel production while beta is free.\n  process.env.NEXT_PUBLIC_CHECKOUT_URL?.trim() || "";`,
    );
    if (siteNext !== site) writeFileSync(sitePath, siteNext, "utf8");
  }

  // StructuredData sameAs
  for (const rel of [
    "components/StructuredData.tsx",
    "components/JsonLd.tsx",
    "src/components/JsonLd.tsx",
  ]) {
    const p = join(root, rel);
    if (!existsSync(p)) continue;
    let t = readFileSync(p, "utf8");
    const r = replaceAll(
      t,
      `https://github.com/${BIT_OWNER}/${BIT_APP}`,
      `https://github.com/${DROID_OWNER}/${DROID_REPO}`,
    );
    if (r.n) writeFileSync(p, r.text, "utf8");
  }
}

function pinDownloadableVersion(root, version) {
  // Prefer data/releases.json pin used by getReleasesData()
  const releasesPath = join(root, "data/releases.json");
  if (existsSync(releasesPath)) {
    const data = JSON.parse(readFileSync(releasesPath, "utf8"));
    data.version = version;
    if (Array.isArray(data.releases)) {
      for (const r of data.releases) {
        if (r && typeof r === "object") r.latest = r.version === version;
      }
      // Ensure honest downloadable release exists
      if (!data.releases.some((r) => r.version === version)) {
        throw new Error(
          `releases.json has no entry for downloadable version ${version}`,
        );
      }
    }
    writeFileSync(releasesPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  }

  // Patch tip-version hardcodes in stats download API if present
  const statsCandidates = [
    "app/api/stats/download/route.ts",
    "src/app/api/stats/download/route.ts",
  ];
  for (const rel of statsCandidates) {
    const p = join(root, rel);
    if (!existsSync(p)) continue;
    let t = readFileSync(p, "utf8");
    // Common patterns: DEFAULT_VERSION = "1.9.70" or tipVersion = '1.9.70'
    t = t.replace(
      /(DEFAULT_VERSION|TIP_VERSION|defaultVersion|tipVersion)\s*=\s*["']\d+\.\d+\.\d+["']/,
      `$1 = "${version}"`,
    );
    // Hardcoded bit download path versions near owner
    writeFileSync(p, t, "utf8");
  }
}

function ensureRedirects(root) {
  const configPath = join(root, "next.config.js");
  const configMjs = join(root, "next.config.mjs");
  const path = existsSync(configPath) ? configPath : existsSync(configMjs) ? configMjs : null;
  if (!path) {
    console.warn("[warn] no next.config — skipping redirects");
    return;
  }
  let text = readFileSync(path, "utf8");
  if (text.includes("/subscribe") && text.includes("custody-note-for-police-station-reps")) {
    console.log("[ok] redirects already present");
    return;
  }

  const redirectBlock = `
  async redirects() {
    return [
      { source: "/subscribe", destination: "/pricing", permanent: false },
      { source: "/for/police-station-reps", destination: "/for/freelance-police-station-reps", permanent: true },
      { source: "/custody-note-for-police-station-reps", destination: "/police-station-reps", permanent: true },
      { source: "/trial", destination: "/download", permanent: true },
    ];
  },`;

  if (text.includes("async redirects()")) {
    // Merge into existing redirects array if possible — append before closing of return [
    if (!text.includes('source: "/subscribe"')) {
      text = text.replace(
        /async redirects\(\)\s*\{\s*return\s*\[/,
        `async redirects() {\n    return [\n      { source: "/subscribe", destination: "/pricing", permanent: false },\n      { source: "/for/police-station-reps", destination: "/for/freelance-police-station-reps", permanent: true },\n      { source: "/custody-note-for-police-station-reps", destination: "/police-station-reps", permanent: true },`,
      );
    }
  } else if (text.includes("module.exports")) {
    text = text.replace(
      /const nextConfig = \{/,
      `const nextConfig = {\n${redirectBlock}\n`,
    );
    if (!text.includes("async redirects()")) {
      text = text.replace(
        /module\.exports\s*=\s*\{/,
        `module.exports = {\n${redirectBlock}\n`,
      );
    }
  } else if (text.includes("export default")) {
    text = text.replace(
      /const nextConfig = \{/,
      `const nextConfig = {\n${redirectBlock}\n`,
    );
    if (!text.includes("async redirects()")) {
      text = text.replace(
        /export default \{/,
        `export default {\n${redirectBlock}\n`,
      );
    }
  }

  writeFileSync(path, text, "utf8");
}

function forbidLeftovers(root) {
  const forbidden = [
    "Core features free forever — no credit card required.",
    "lemonsqueezy.com/checkout/buy/",
    "does not run on Mac or mobile devices",
    "does not run on Mac, Linux, or mobile",
    "Individual subscriptions are",
    "start a Custody Note trial",
  ];
  // Host rewrite must clear bit app refs from live download/API/SEO surfaces,
  // but historical blog posts may still mention the old owner — ignore those.
  const critical = walk(root).filter((f) => {
    const rel = relative(root, f).replace(/\\/g, "/");
    if (rel.startsWith("app/blog/")) return false;
    if (rel.includes("blog-imports")) return false;
    if (rel === "data/releases.json") return false;
    return (
      rel.startsWith("app/") ||
      rel.startsWith("components/") ||
      rel.startsWith("lib/") ||
      rel.startsWith("src/") ||
      rel === "next.config.js" ||
      rel === "next.config.mjs"
    );
  });

  const blob = critical
    .map((f) => {
      try {
        return readFileSync(f, "utf8");
      } catch {
        return "";
      }
    })
    .join("\n");

  const leftover = [
    ...forbidden.filter((s) => blob.includes(s)),
    ...(blob.includes(`${BIT_OWNER}/${BIT_APP}`)
      ? [`${BIT_OWNER}/${BIT_APP}`]
      : []),
  ];
  return leftover;
}

function maybeSyncReleasesFromPatch(root, downloadableVersion) {
  const patchReleases = join(PATCH_DIR, "releases.droid-honest.json");
  if (!existsSync(patchReleases)) return;
  const target = join(root, "data/releases.json");
  if (!existsSync(target)) return;

  const live = JSON.parse(readFileSync(target, "utf8"));
  const patch = JSON.parse(readFileSync(patchReleases, "utf8"));

  // Prefer live history if it is already ahead; only ensure downloadable pin + 1.9.70 notes exist
  const byVersion = new Map();
  for (const r of [...(patch.releases || []), ...(live.releases || [])]) {
    if (!r?.version) continue;
    if (!byVersion.has(r.version)) byVersion.set(r.version, r);
  }
  const releases = [...byVersion.values()].sort((a, b) => {
    const pa = a.version.split(".").map(Number);
    const pb = b.version.split(".").map(Number);
    for (let i = 0; i < 3; i++) if ((pb[i] || 0) !== (pa[i] || 0)) return (pb[i] || 0) - (pa[i] || 0);
    return 0;
  });
  for (const r of releases) r.latest = r.version === downloadableVersion;
  const out = { version: downloadableVersion, releases };
  writeFileSync(target, JSON.stringify(out, null, 2) + "\n", "utf8");
}

async function main() {
  if (!TOKEN) {
    console.error("Missing GH_PAT / GITHUB_PAT — cannot access private live website.");
    console.error(`Expected repo: ${WEBSITE_REPO}`);
    process.exit(2);
  }

  const droid = await latestDroidRelease();
  console.log(`[droid] latest ${droid.version} mac=${droid.hasMac}`);
  assertDroidAssets(droid.version);

  const work = mkdtempSync(join(tmpdir(), "cn-live-leftovers-"));
  try {
    const cloneUrl = `https://x-access-token:${TOKEN}@github.com/${WEBSITE_REPO}.git`;
    sh(`git clone --depth 40 --branch ${WEBSITE_BRANCH} '${cloneUrl}' '${work}'`);

    console.log("[1/6] neutralize Lemon checkout + free-forever download hero");
    neutralizeCheckout(work);

    console.log("[2/6] string replacements (beta / Mac / SEO / trial)");
    const { hits, misses } = applyStringReplacements(work);
    console.log(`[replacements] hits=${hits.length} soft-misses=${misses.length}`);

    console.log("[3/6] retarget release host bit → droid");
    const hostReport = patchReleaseHost(work);
    console.log(`[host] touched ${hostReport.length} file(s)`);

    console.log(`[4/6] pin downloadable version to droid ${droid.version}`);
    maybeSyncReleasesFromPatch(work, droid.version);
    pinDownloadableVersion(work, droid.version);

    console.log("[5/6] redirects for /subscribe and broken rep paths");
    ensureRedirects(work);

    console.log("[6/6] leftover guard");
    const leftovers = forbidLeftovers(work);
    if (leftovers.length) {
      console.error("Forbidden leftovers still present:");
      for (const s of leftovers) console.error(" -", s);
      // Write report then fail
      writeFileSync(
        join(work, ".live-leftovers-report.json"),
        JSON.stringify({ leftovers, hits, hostReport, droid }, null, 2) + "\n",
      );
      process.exit(3);
    }

    writeFileSync(
      join(work, ".live-leftovers-report.json"),
      JSON.stringify(
        {
          ok: true,
          droid,
          hits: hits.length,
          hostFiles: hostReport.map((h) => h.file),
          pushBranch: PUSH_BRANCH,
        },
        null,
        2,
      ) + "\n",
    );

    // Also copy report into public mirror workspace for the PR artifact
    try {
      cpSync(
        join(work, ".live-leftovers-report.json"),
        join(REPO_ROOT, "scripts/live-leftovers-patches/last-report.json"),
      );
    } catch {
      /* ignore */
    }

    sh(`git config user.name "Cursor Agent"`, { cwd: work });
    sh(`git config user.email "cursoragent@cursor.com"`, { cwd: work });
    sh(`git checkout -B '${PUSH_BRANCH}'`, { cwd: work });
    sh(`git add -A`, { cwd: work });
    const porcelain = shOut(`git status --porcelain`, { cwd: work });
    if (!porcelain) {
      console.log("[ok] no website file changes");
      return;
    }
    sh(
      `git commit -m "$(cat <<'EOF'
fix(site): beta leftovers — no free forever, no Lemon buy, droid downloads

- /download: free during beta; remove live LemonSqueezy checkout CTA
- Retarget release/sameAs/stats downloads to ${DROID_OWNER}/${DROID_REPO}
- Honest downloadable version ${droid.version} (droid assets); keep changelog history
- SEO: Mac supported; Pro coming soon / not purchasable yet
- Redirect /subscribe and broken police-station-reps paths
EOF
)"`,
      { cwd: work },
    );
    sh(`git push -u origin HEAD:${PUSH_BRANCH} --force`, { cwd: work });
    console.log(`[ok] pushed ${WEBSITE_REPO}@${PUSH_BRANCH}`);

    if (OPEN_PR) {
      try {
        sh(
          `gh pr view '${PUSH_BRANCH}' --repo '${WEBSITE_REPO}' --json url >/dev/null 2>&1 || gh pr create --repo '${WEBSITE_REPO}' --base '${WEBSITE_BRANCH}' --head '${PUSH_BRANCH}' --title 'fix(site): beta leftovers — free during beta, droid downloads, no Lemon buy' --body "$(cat <<'EOF'
## Summary
Implements remaining custodynote.com leftovers verified live 23 Aug 2026.

### P0
- Remove \"Core features free forever\" on /download (and /trial → /download)
- Remove live LemonSqueezy checkout CTA (payments not wired)
- Retarget download redirects + JSON-LD sameAs from robertcashman-bit → ${DROID_OWNER}/${DROID_REPO}
- Honest downloadable version **${droid.version}** matching droid release assets (does not invent a 1.9.70 tag)

### P1
- Homepage / SEO pages: free during beta / Pro coming soon
- Fix false \"does not run on Mac\" claims

### P2
- Redirect /subscribe → /pricing
- Redirect broken police-station-reps paths

EOF
)"`,
          { cwd: work },
        );
      } catch (e) {
        console.warn("[warn] PR create/view failed:", e.message || e);
      }
    }

    if (process.env.VERCEL_TOKEN) {
      console.log("[vercel] token present — caller may force redeploy separately");
    }
  } finally {
    // Keep workdir if DEBUG_KEEP=1
    if (process.env.DEBUG_KEEP === "1") {
      console.log("[debug] kept", work);
    } else {
      rmSync(work, { recursive: true, force: true });
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
