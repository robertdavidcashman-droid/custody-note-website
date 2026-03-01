"use client";

import Link from "next/link";
import { CustodyNoteLogo } from "./CustodyNoteLogo";

const nav = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Download", href: "/download" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-custody-slate/20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-custody-light/10 dark:bg-custody-navy/95 dark:supports-[backdrop-filter]:dark:bg-custody-navy/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-custody-navy dark:text-white"
        >
          <CustodyNoteLogo className="h-8 w-8 shrink-0" />
          <span>Custody Note</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-custody-slate hover:text-custody-accent dark:text-custody-light/90 dark:hover:text-custody-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/trial"
            className="rounded-lg px-3 py-2 text-sm font-medium text-custody-slate hover:bg-custody-light hover:text-custody-navy dark:text-custody-light/90 dark:hover:bg-custody-slate dark:hover:text-white"
          >
            Start trial
          </Link>
          <Link
            href="/buy"
            className="rounded-lg bg-custody-blue px-4 py-2 text-sm font-medium text-white hover:bg-custody-accent"
          >
            Buy
          </Link>
        </div>
      </div>
    </header>
  );
}
