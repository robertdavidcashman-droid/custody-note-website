"use client";

import { useState } from "react";
import Image from "next/image";

const screenshots = [
  {
    id: "home",
    label: "Home",
    src: "/screenshots/home.png",
    caption: "Command centre — New Tel Advice, Quick Capture, and New Attendance in one place.",
  },
  {
    id: "form",
    label: "Attendance Form",
    src: "/screenshots/form.png",
    caption: "Multi-section attendance form with PACE reviews, disclosure, and LAA billing.",
  },
  {
    id: "quickcapture",
    label: "Quick Capture",
    src: "/screenshots/quickcapture.png",
    caption: "Grab initial case details the moment you get the call.",
  },
  {
    id: "records",
    label: "Records",
    src: "/screenshots/records.png",
    caption: "Search, filter, and manage all your attendance records.",
  },
  {
    id: "reports",
    label: "Reports",
    src: "/screenshots/reports.png",
    caption: "Monthly stats, breakdowns by firm and station.",
  },
];

export function AppScreenshots() {
  const [active, setActive] = useState(0);
  const [hasError, setHasError] = useState<Record<string, boolean>>({});

  const current = screenshots[active];
  const imageAvailable = !hasError[current.id];

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {screenshots.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              i === active
                ? "bg-custody-blue text-white"
                : "bg-custody-light text-custody-slate hover:bg-custody-accent/10 dark:bg-custody-slate/40 dark:text-custody-light/80 dark:hover:bg-custody-slate/60"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-custody-slate/15 bg-white shadow-lg dark:border-custody-light/10 dark:bg-custody-slate/30">
          {/* Window title bar */}
          <div className="flex items-center gap-2 border-b border-custody-slate/10 bg-custody-light/60 px-4 py-2.5 dark:border-custody-light/5 dark:bg-custody-slate/50">
            <span className="h-3 w-3 rounded-full bg-red-400/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <span className="h-3 w-3 rounded-full bg-green-400/70" />
            <span className="ml-2 text-xs text-custody-slate/60 dark:text-custody-light/40">
              Custody Note
            </span>
          </div>

          {/* Screenshot or placeholder */}
          <div className="relative aspect-[16/10] w-full bg-custody-light/30 dark:bg-custody-navy/50">
            {imageAvailable ? (
              <Image
                src={current.src}
                alt={current.caption}
                fill
                className="object-contain"
                onError={() =>
                  setHasError((prev) => ({ ...prev, [current.id]: true }))
                }
                sizes="(max-width: 768px) 100vw, 896px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-sm text-custody-slate/50 dark:text-custody-light/30">
                  Screenshot placeholder — save your screenshot as{" "}
                  <code className="rounded bg-custody-light px-1.5 py-0.5 text-xs dark:bg-custody-slate/50">
                    public/screenshots/{current.id}.png
                  </code>
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-custody-slate dark:text-custody-light/70">
          {current.caption}
        </p>
      </div>
    </div>
  );
}
