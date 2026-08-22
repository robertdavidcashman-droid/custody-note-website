"use client";

import { useEffect, useState } from "react";
import { DOWNLOAD_FREE_TAGLINE } from "@/lib/product-copy";

export type MacArch = "arm64" | "x64";

type Props = {
  version: string;
  arm64Url: string;
  x64Url: string;
  /** When false, Mac DMGs are not yet published for this release */
  macAvailable?: boolean;
  /** Compact layout for homepage CTA row */
  compact?: boolean;
};

type DetectedMac = MacArch | "unknown" | "non-mac";

function detectMacArch(): DetectedMac {
  if (typeof navigator === "undefined") return "unknown";

  const ua = navigator.userAgent || "";
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ||
    navigator.platform ||
    "";

  const isMac =
    /Mac/i.test(platform) || /Macintosh|Mac OS X/i.test(ua);

  if (!isMac) return "non-mac";

  if (/arm64|aarch64/i.test(ua) || /arm64/i.test(platform)) {
    return "arm64";
  }

  if (/MacIntel/i.test(platform) && !/Intel Mac OS X/i.test(ua)) {
    const osMatch = ua.match(/Mac OS X (\d+)[_.](\d+)/);
    if (osMatch) {
      const major = parseInt(osMatch[1], 10);
      if (major >= 11) return "arm64";
    }
  }

  if (/Intel Mac OS X/i.test(ua) || /MacIntel/i.test(platform)) {
    return "x64";
  }

  return "unknown";
}

function archLabel(arch: MacArch): string {
  return arch === "arm64"
    ? "Apple Silicon (M1/M2/M3/M4)"
    : "Intel Mac";
}

export default function MacDownloadPicker({
  version,
  arm64Url,
  x64Url,
  macAvailable = true,
  compact = false,
}: Props) {

  if (!macAvailable) {
    return (
      <div className="text-center">
        <p className="text-amber-200/90 text-sm mb-4">
          The Mac build for v{version} is still being published. Windows is available now — check back shortly or email support if you need Mac access.
        </p>
        <p className="text-blue-100/50 text-sm">
          macOS 11 or later &middot; Apple Silicon &amp; Intel &middot; unsigned build
        </p>
      </div>
    );
  }

  const [detected, setDetected] = useState<DetectedMac>("unknown");
  /** Avoid static HTML with two extra tracked Mac arch URLs for crawlers. */
  const [showManualArchLinks, setShowManualArchLinks] = useState(false);

  useEffect(() => {
    setDetected(detectMacArch());
    setShowManualArchLinks(true);
  }, []);

  const primaryArch: MacArch =
    detected === "x64" ? "x64" : "arm64";
  const primaryUrl = primaryArch === "arm64" ? arm64Url : x64Url;
  const primaryLabel = archLabel(primaryArch);

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2">
        <a
          href={primaryUrl}
          className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-lg font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5"
        >
          Download for Mac
        </a>
        <p className="text-xs text-blue-200/50">
          {detected === "non-mac" || detected === "unknown"
            ? "Apple Silicon or Intel — choose on the download page"
            : `Suggested: ${primaryLabel}`}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-blue-100/50 text-sm mb-6">
        macOS 11 or later &middot; Apple Silicon &amp; Intel &middot; unsigned build &middot; ~130 MB
      </p>

      {detected !== "non-mac" && detected !== "unknown" && (
        <p className="text-sm text-green-300/90 mb-4">
          Detected {primaryLabel} — recommended download highlighted below.
        </p>
      )}

      <a
        href={primaryUrl}
        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors mb-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Download for Mac ({primaryLabel})
      </a>

      <p className="text-xs text-blue-200/40 mb-6">
        {DOWNLOAD_FREE_TAGLINE}
      </p>

      {showManualArchLinks ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left text-sm">
          <p className="text-blue-100/70 font-medium mb-2">
            Not sure which Mac you have? Download manually:
          </p>
          <ul className="space-y-2 text-blue-100/60">
            <li>
              <a
                href={arm64Url}
                className={`hover:text-white underline underline-offset-2 ${
                  primaryArch === "arm64" ? "text-blue-300 font-medium" : ""
                }`}
              >
                Apple Silicon (M1/M2/M3/M4)
              </a>
              <span className="text-blue-200/40 text-xs ml-1">
                — Custody-Note-{version}-arm64.dmg
              </span>
            </li>
            <li>
              <a
                href={x64Url}
                className={`hover:text-white underline underline-offset-2 ${
                  primaryArch === "x64" ? "text-blue-300 font-medium" : ""
                }`}
              >
                Intel Mac
              </a>
              <span className="text-blue-200/40 text-xs ml-1">
                — Custody-Note-{version}-x64.dmg
              </span>
            </li>
          </ul>
        </div>
      ) : (
        <p className="text-xs text-blue-200/40">
          Other Mac builds (Apple Silicon / Intel) appear here after the page loads.
        </p>
      )}
    </div>
  );
}
