import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LazyLoomEmbed from "@/components/LazyLoomEmbed";
import MacDownloadPicker from "@/components/MacDownloadPicker";
import ProductScreenshot from "@/components/ProductScreenshot";
import {
  getReleasesData,
  getReleasePlatforms,
  getTrackedMacDownloadUrls,
  getTrackedWindowsDownloadUrl,
} from "@/lib/releases";
import { CHECKOUT_URL, CONTACT_EMAIL, PRICE_MONTHLY } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Download Custody Note for Windows and Mac — Free during beta",
  description:
    "Download Custody Note for Windows 10+ and macOS (Apple Silicon and Intel). Structured attendance notes for solicitors and reps. Free during beta, works offline.",
  alternates: { canonical: "https://custodynote.com/download" },
};

export default function DownloadPage() {
  const { version, releases } = getReleasesData();
  const platforms = getReleasePlatforms();
  const windowsUrl = getTrackedWindowsDownloadUrl(version);
  const macUrls = getTrackedMacDownloadUrls(version);
  const checkoutUrl = CHECKOUT_URL;
  const latest = releases[0];

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-4xl px-4 sm:px-6 py-16 pb-24 lg:pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Download Custody Note
          </h1>
          <p className="text-blue-100/60 text-lg max-w-xl mx-auto">
            Install in under a minute on Windows or Mac. Core features free
            forever — no credit card required.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <ProductScreenshot
            src="/screenshots/hero-main-ui.webp"
            alt="Custody Note dashboard with Custody Attendance, Voluntary Attendance, Telephone Advice, and Quick Capture options"
            width={1600}
            height={950}
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>

        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-8 mx-auto w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          <span className="text-sm text-green-300">Latest — v{version}</span>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-10">
          {/* Windows */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 sm:p-10 text-center">
            <h2 className="text-2xl font-bold mb-2">Custody Note for Windows</h2>
            <p className="text-blue-100/50 text-sm mb-6">
              Windows 10 or later &middot; 64-bit &middot; ~90 MB
            </p>

            <a
              href={windowsUrl}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors mb-4"
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
              Download for Windows
            </a>

            <p className="text-xs text-blue-200/40">
              Free during beta &middot; No credit card required &middot; Core
              features included
            </p>
          </div>

          {/* Mac */}
          <div
            id="mac"
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 sm:p-10 scroll-mt-24"
          >
            <h2 className="text-2xl font-bold mb-2 text-center">
              Custody Note for Mac
            </h2>
            <MacDownloadPicker
              version={version}
              arm64Url={macUrls.arm64}
              x64Url={macUrls.x64}
              macAvailable={platforms.mac}
            />
          </div>
        </div>

        {checkoutUrl ? (
          <p className="text-sm text-blue-100/50 text-center mb-10">
            Firm or team interest?{" "}
            <a
              href={checkoutUrl}
              className="text-blue-400 hover:underline font-medium"
            >
              Contact us about firm interest — planned Pro ~£{PRICE_MONTHLY}/month &rarr;
            </a>
          </p>
        ) : (
          <p className="text-sm text-blue-100/50 text-center mb-10">
            Firm or team interest?{" "}
            <Link
              href="/pricing"
              className="text-blue-400 hover:underline font-medium"
            >
              See pricing &rarr;
            </Link>
          </p>
        )}

        {/* Windows installation */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 mb-8">
          <h3 className="font-semibold text-lg mb-3">
            Windows installation
          </h3>
          <p className="text-sm text-blue-100/60 mb-4">
            Prefer a walkthrough? Watch the short video, or follow the steps
            below.
          </p>
          <LazyLoomEmbed
            contained={false}
            embedId="266b9c9a3f204269982b494c7cbaf3c7"
            iframeTitle="How to install Custody Note (Loom video)"
            playLabel="Watch installation guide"
            playButtonAriaLabel="Play Custody Note installation guide video"
            helperText="Video loads only when you play — faster page, less data."
          />
          <ol className="space-y-5 text-blue-100/70 text-sm mt-8">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </span>
              <span>
                Click <strong className="text-white">Download for Windows</strong>{" "}
                above. Your browser may show a warning — click{" "}
                <strong className="text-white">Keep</strong> (Chrome) or{" "}
                <strong className="text-white">Keep anyway</strong> (Edge) to
                save the file.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </span>
              <span>
                Run{" "}
                <code className="text-blue-300 bg-white/5 px-1.5 py-0.5 rounded text-xs">
                  Custody-Note-Setup-{version}.exe
                </code>
                . If Windows SmartScreen shows{" "}
                <em>&ldquo;Windows protected your PC&rdquo;</em>, click{" "}
                <strong className="text-white">More info</strong>,  then{" "}
                <strong className="text-white">Run anyway</strong>. This is
                standard for newer software and does not indicate a problem.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </span>
              <span>
                If your antivirus quarantines the file, add an exception for the
                installer or the installation folder. The warning is triggered
                because the software is new to your antivirus provider.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                4
              </span>
              <span>
                Follow the setup wizard — it creates a Start Menu shortcut and
                installs in under a minute.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                5
              </span>
              <span>
                Set your recovery password, configure your firm details, and
                you&apos;re ready. The app works fully offline from day one.
              </span>
            </li>
          </ol>
        </div>

        {/* Mac installation */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 mb-8">
          <h3 className="font-semibold text-lg mb-3">Mac installation</h3>
          <ol className="space-y-5 text-blue-100/70 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </span>
              <span>
                Download the correct <strong className="text-white">.dmg</strong>{" "}
                for your Mac (Apple Silicon or Intel) and open it. Drag{" "}
                <strong className="text-white">Custody Note</strong> to{" "}
                <strong className="text-white">Applications</strong>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </span>
              <span>
                This Mac build is not yet Apple-signed or notarised. If macOS
                Gatekeeper blocks the app, right-click Custody Note in
                Applications and choose{" "}
                <strong className="text-white">Open</strong> once. A signed
                build is coming.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </span>
              <span>
                If macOS asks for access to{" "}
                <strong className="text-white">
                  Custody Note safe storage
                </strong>
                , enter your macOS login password and click{" "}
                <strong className="text-white">Always Allow</strong>. This lets
                the app store encryption keys securely in Keychain.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                4
              </span>
              <span>
                Set your recovery password, configure your firm details, and
                paste your licence key in Settings if you have one — the same
                key works on Windows and Mac.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                5
              </span>
              <span>
                The Mac app checks GitHub for updates on launch — same licence,
                same account, same offline-first workflow as Windows.
              </span>
            </li>
          </ol>
        </div>

        {/* SmartScreen note */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-sm mb-2 text-amber-200">
            About Windows SmartScreen warnings
          </h3>
          <p className="text-xs text-blue-100/60 mb-4">
            Custody Note is a recently released application. Windows and some
            antivirus software use reputation-based systems that flag new
            software until enough users have installed it. This is normal, does
            not mean the app is unsafe, and resolves as the app builds
            reputation. If you have any concerns, please{" "}
            <Link href="/contact" className="text-blue-400 hover:underline">
              contact us
            </Link>
            .
          </p>
          <h3 className="font-semibold text-sm mb-2 text-amber-200">
            About Mac Gatekeeper
          </h3>
          <p className="text-xs text-blue-100/60">
            This Mac build is not yet Apple-signed or notarised. If Gatekeeper
            blocks launch, use right-click &rarr;{" "}
            Open once, or check you downloaded the correct architecture (Apple
            Silicon vs Intel). A signed build is coming.
          </p>
        </div>

        {latest && (
          <div className="mb-10">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <h3 className="font-semibold text-lg">
                What&apos;s New in v{latest.version}
              </h3>
              <Link
                href="/changelog"
                className="text-sm text-blue-400 hover:underline font-medium"
              >
                View full changelog &rarr;
              </Link>
            </div>
            <ul className="space-y-2">
              {latest.changes.map((c, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-blue-100/60"
                >
                  <span className="text-blue-400 mt-0.5 flex-shrink-0">
                    &bull;
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        <section className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              Need help?
            </h2>
            <ul className="space-y-2 text-sm text-blue-100/75">
              <li>
                <Link href="/faq" className="text-blue-400 hover:underline">
                  Frequently asked questions
                </Link>
              </li>
              <li>
                <Link
                  href="/how-to-write-attendance-notes"
                  className="text-blue-400 hover:underline"
                >
                  How to write attendance notes
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-blue-400 hover:underline">
                  Contact support
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-blue-400 hover:underline">
                  Pricing &amp; subscription
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-blue-400 hover:underline">
                  About the publisher
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-blue-400 hover:underline">
                  Changelog &amp; release notes
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
