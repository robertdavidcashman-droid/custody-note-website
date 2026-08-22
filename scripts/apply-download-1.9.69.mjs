#!/usr/bin/env node
/**
 * Apply live /download bump: v1.9.68 → v1.9.69
 *
 * Live production source is the private repo robertcashman-bit/custody-note-website
 * (Vercel project custody-note-website / prj_zPV1EYswHU0Nih1iASwSOxEY64NN).
 * This public droid mirror is still an older tree — do not deploy it to production.
 *
 * Env:
 *   GH_PAT | GITHUB_PAT  required — clone/push private website
 *   VERCEL_TOKEN         optional — force `vercel deploy --prod` after push
 *   WEBSITE_REPO         default robertcashman-bit/custody-note-website
 *   WEBSITE_BRANCH       default master
 *   SKIP_PUSH=1          write only
 *   SKIP_DEPLOY=1        push but skip vercel CLI deploy
 */
import { execSync } from "child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATCH_DIR = join(__dirname, "download-1.9.69-patches");

const VERSION = "1.9.69";
const PREV = "1.9.68";
const DROID_OWNER = "robertdavidcashman-droid";
const DROID_REPO = "custody-note-app";
const WEBSITE_REPO =
  process.env.WEBSITE_REPO?.trim() || "robertcashman-bit/custody-note-website";
const WEBSITE_BRANCH = process.env.WEBSITE_BRANCH?.trim() || "master";
const TOKEN = (process.env.GH_PAT || process.env.GITHUB_PAT || "").trim();
const VERCEL_TOKEN = (process.env.VERCEL_TOKEN || "").trim();
const VERCEL_ORG_ID =
  process.env.VERCEL_ORG_ID?.trim() || "team_wbvkpoLfvbg9qFwg5LqJLAjN";
const VERCEL_PROJECT_ID =
  process.env.VERCEL_PROJECT_ID?.trim() || "prj_zPV1EYswHU0Nih1iASwSOxEY64NN";
const SKIP_PUSH = process.env.SKIP_PUSH === "1";
const SKIP_DEPLOY = process.env.SKIP_DEPLOY === "1" || !VERCEL_TOKEN;

const ASSETS = [
  `Custody-Note-Setup-${VERSION}.exe`,
  `Custody-Note-${VERSION}-arm64.dmg`,
  `Custody-Note-${VERSION}-x64.dmg`,
];

function sh(cmd, opts = {}) {
  console.log(`+ ${cmd.replace(TOKEN, "***").replace(VERCEL_TOKEN, "***")}`);
  return execSync(cmd, { stdio: "inherit", ...opts });
}

function read(path) {
  return readFileSync(path, "utf8");
}

function write(path, content) {
  writeFileSync(path, content, "utf8");
  console.log(`[write] ${path}`);
}

function assertAssets() {
  for (const file of ASSETS) {
    const url = `https://github.com/${DROID_OWNER}/${DROID_REPO}/releases/download/v${VERSION}/${file}`;
    const code = execSync(
      `curl -sI -o /dev/null -w '%{http_code}' --max-time 20 '${url}'`,
      { encoding: "utf8" }
    ).trim();
    if (code !== "302" && code !== "200") {
      throw new Error(`Asset missing (${code}): ${url}`);
    }
    console.log(`[ok] ${code} ${file}`);
  }
}

function syncReleasesJson(root) {
  const path = join(root, "data", "releases.json");
  if (!existsSync(path)) throw new Error(`Missing ${path}`);
  const changelog = JSON.parse(read(join(PATCH_DIR, "changelog.json")));
  const out = {
    version: VERSION,
    releases: changelog.releases,
  };
  if (!out.releases?.[0] || out.releases[0].version !== VERSION) {
    throw new Error("Patch changelog.json does not lead with 1.9.69");
  }
  write(path, JSON.stringify(out, null, 2) + "\n");
}

function copyPatchedUi(root) {
  const downloadSrc = join(PATCH_DIR, "download-page.tsx");
  const macSrc = join(PATCH_DIR, "MacDownloadPicker.tsx");
  const downloadDest = join(root, "app", "download", "page.tsx");
  const macDest = join(root, "components", "MacDownloadPicker.tsx");
  if (!existsSync(downloadDest)) throw new Error(`Missing ${downloadDest}`);
  if (!existsSync(macDest)) throw new Error(`Missing ${macDest}`);
  copyFileSync(downloadSrc, downloadDest);
  copyFileSync(macSrc, macDest);
  console.log("[ok] copied patched download page + MacDownloadPicker");

  const dl = read(downloadDest);
  if (!dl.includes("not yet Apple-signed")) {
    throw new Error("Download page missing unsigned Gatekeeper copy");
  }
  if (!dl.includes("SmartScreen")) {
    throw new Error("Download page lost Windows SmartScreen guidance");
  }
  const mac = read(macDest);
  if (!mac.includes("unsigned build")) {
    throw new Error("MacDownloadPicker still claims signed/notarised");
  }
}

function patchReleaseHost(root) {
  const files = execSync(
    `find "${root}/app/api" "${root}/lib" -type f \\( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.mjs' -o -name '*.json' \\) 2>/dev/null || true`,
    { encoding: "utf8" }
  )
    .split("\n")
    .filter(Boolean);

  let hits = 0;
  for (const file of files) {
    let text = read(file);
    const orig = text;
    text = text.split("robertcashman-bit/custody-note-app").join(
      `${DROID_OWNER}/${DROID_REPO}`
    );
    text = text.replace(
      /owner:\s*["']robertcashman-bit["']/g,
      `owner: "${DROID_OWNER}"`
    );
    text = text.replace(
      /["']robertcashman-bit["']\s*,\s*["']custody-note-app["']/g,
      `"${DROID_OWNER}", "${DROID_REPO}"`
    );
    text = text.replace(
      /GITHUB_RELEASE_OWNER\s*=\s*["']robertcashman-bit["']/g,
      `GITHUB_RELEASE_OWNER = "${DROID_OWNER}"`
    );
    text = text.replace(
      /RELEASE_GITHUB_OWNER\s*=\s*["']robertcashman-bit["']/g,
      `RELEASE_GITHUB_OWNER = "${DROID_OWNER}"`
    );
    // Hardcoded tip version in redirect helpers (keep changelog history intact —
    // those live under data/, not api/lib).
    text = text.replaceAll(`"v${PREV}"`, `"v${VERSION}"`);
    text = text.replaceAll(`'v${PREV}'`, `'v${VERSION}'`);
    text = text.replaceAll(`Custody-Note-Setup-${PREV}`, `Custody-Note-Setup-${VERSION}`);
    text = text.replaceAll(
      `Custody-Note-${PREV}-arm64.dmg`,
      `Custody-Note-${VERSION}-arm64.dmg`
    );
    text = text.replaceAll(
      `Custody-Note-${PREV}-x64.dmg`,
      `Custody-Note-${VERSION}-x64.dmg`
    );
    text = text.replaceAll(`/download/v${PREV}/`, `/download/v${VERSION}/`);
    if (text !== orig) {
      write(file, text);
      hits++;
    }
  }
  console.log(`[ok] patched ${hits} api/lib files toward droid v${VERSION}`);
}

function main() {
  if (!TOKEN) {
    console.error("Missing GH_PAT / GITHUB_PAT — cannot access private live website.");
    console.error(`Expected repo: ${WEBSITE_REPO}`);
    process.exit(2);
  }

  assertAssets();

  const work =
    process.env.WORK_DIR?.trim() ||
    join(tmpdir(), `custody-note-website-${VERSION}`);
  if (existsSync(work)) rmSync(work, { recursive: true, force: true });
  mkdirSync(work, { recursive: true });

  const cloneUrl = `https://x-access-token:${TOKEN}@github.com/${WEBSITE_REPO}.git`;
  sh(`git clone --depth 30 --branch ${WEBSITE_BRANCH} '${cloneUrl}' '${work}'`);

  syncReleasesJson(work);
  copyPatchedUi(work);
  patchReleaseHost(work);

  const releases = JSON.parse(read(join(work, "data", "releases.json")));
  if (releases.version !== VERSION) {
    throw new Error(`releases.json version ${releases.version} != ${VERSION}`);
  }

  if (SKIP_PUSH) {
    console.log(`[done] SKIP_PUSH=1 — working tree at ${work}`);
    return;
  }

  sh("git add -A", { cwd: work });
  try {
    sh(
      `git -c user.name='Cursor Agent' -c user.email='cursoragent@cursor.com' commit -m "Download: v${VERSION} on droid assets; unsigned Mac Gatekeeper copy"`,
      { cwd: work }
    );
  } catch {
    console.log("[info] nothing to commit");
  }
  sh(`git push origin HEAD:${WEBSITE_BRANCH}`, { cwd: work });
  console.log(`[ok] pushed ${WEBSITE_REPO}@${WEBSITE_BRANCH}`);

  if (SKIP_DEPLOY) {
    console.log(
      "[info] No VERCEL_TOKEN / SKIP_DEPLOY — relying on website Deploy and IndexNow workflow if configured."
    );
    return;
  }

  mkdirSync(join(work, ".vercel"), { recursive: true });
  write(
    join(work, ".vercel", "project.json"),
    JSON.stringify({ orgId: VERCEL_ORG_ID, projectId: VERCEL_PROJECT_ID }) + "\n"
  );
  sh("npm install -g vercel@latest");
  sh(`vercel pull --yes --environment=production --token='${VERCEL_TOKEN}'`, {
    cwd: work,
    env: { ...process.env, VERCEL_ORG_ID, VERCEL_PROJECT_ID, VERCEL_TOKEN },
  });
  sh(`vercel deploy --prod --yes --token='${VERCEL_TOKEN}'`, {
    cwd: work,
    env: { ...process.env, VERCEL_ORG_ID, VERCEL_PROJECT_ID, VERCEL_TOKEN },
  });
}

main();
