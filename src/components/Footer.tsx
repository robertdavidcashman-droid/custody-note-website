import Link from "next/link";
import { CustodyNoteLogo } from "./CustodyNoteLogo";

const footerLinks = {
  product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Free trial", href: "/trial" },
    { label: "Download", href: "/download" },
  ],
  support: [
    { label: "How it works", href: "/how-it-works" },
    { label: "Cloud Backup", href: "/cloud-backup" },
    { label: "Support", href: "/support" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Changelog", href: "/changelog" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-custody-slate/20 bg-custody-light/50 dark:border-custody-light/10 dark:bg-custody-slate/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <CustodyNoteLogo className="h-6 w-6 shrink-0" />
              <p className="text-sm font-semibold text-custody-navy dark:text-white">
                Custody Note
              </p>
            </div>
            <p className="mt-2 text-sm text-custody-slate dark:text-custody-light/70">
              The custody note app for freelance police station reps and
              criminal solicitors.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-custody-navy dark:text-white">
              Product
            </p>
            <ul className="mt-2 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-custody-slate hover:text-custody-accent dark:text-custody-light/70 dark:hover:text-custody-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-custody-navy dark:text-white">
              Support
            </p>
            <ul className="mt-2 space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-custody-slate hover:text-custody-accent dark:text-custody-light/70 dark:hover:text-custody-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-custody-navy dark:text-white">
              Legal
            </p>
            <ul className="mt-2 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-custody-slate hover:text-custody-accent dark:text-custody-light/70 dark:hover:text-custody-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-custody-slate/20 pt-8 text-center text-sm text-custody-slate dark:border-custody-light/10 dark:text-custody-light/60">
          &copy; {new Date().getFullYear()} Custody Note. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
