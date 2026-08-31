import { NextRequest, NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/config";
import { STATS_CORS_HEADERS } from "@/lib/stats/cors";
import { recordDownload, type DownloadPlatform } from "@/lib/stats/store";

const DROID_RELEASE =
  "https://github.com/robertdavidcashman-droid/custody-note-app/releases/download";

function downloadUrl(
  platform: "windows" | "mac",
  arch?: string | null,
  version?: string | null,
): string | null {
  const v = (version && /^\d+\.\d+\.\d+$/.test(version) ? version : APP_VERSION).replace(
    /^v/,
    "",
  );
  if (platform === "windows") {
    return `${DROID_RELEASE}/v${v}/Custody-Note-Setup-${v}.exe`;
  }
  if (platform === "mac") {
    if (arch === "x64") {
      return `${DROID_RELEASE}/v${v}/Custody-Note-${v}-x64.dmg`;
    }
    // default Apple Silicon
    return `${DROID_RELEASE}/v${v}/Custody-Note-${v}-arm64.dmg`;
  }
  return null;
}

function trackKey(
  platform: "windows" | "mac",
  arch?: string | null,
): DownloadPlatform | null {
  if (platform === "windows") return "windows";
  if (platform === "mac" && arch === "x64") return "macX64";
  if (platform === "mac") return "macArm64";
  return null;
}

/**
 * GET /api/stats/download?platform=windows|mac&arch=arm64|x64&v=1.9.69
 * Increments download counters then redirects to the GitHub release asset.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");
  const arch = searchParams.get("arch");
  const version = searchParams.get("v");

  if (platform !== "windows" && platform !== "mac") {
    return NextResponse.json(
      { error: "Use ?platform=windows or ?platform=mac&arch=arm64|x64" },
      { status: 400, headers: STATS_CORS_HEADERS },
    );
  }
  if (platform === "mac" && arch && arch !== "arm64" && arch !== "x64") {
    return NextResponse.json(
      { error: "Use ?platform=windows or ?platform=mac&arch=arm64|x64" },
      { status: 400, headers: STATS_CORS_HEADERS },
    );
  }

  const url = downloadUrl(platform, arch, version);
  const key = trackKey(platform, arch);
  if (!url || !key) {
    return NextResponse.json(
      { error: "Use ?platform=windows or ?platform=mac&arch=arm64|x64" },
      { status: 400, headers: STATS_CORS_HEADERS },
    );
  }

  try {
    await recordDownload(key);
  } catch (err) {
    console.error("download stats error");
    // Still redirect — downloads must not fail because KV is down.
  }

  return NextResponse.redirect(url, {
    status: 302,
    headers: STATS_CORS_HEADERS,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...STATS_CORS_HEADERS,
      Allow: "OPTIONS, GET",
    },
  });
}
