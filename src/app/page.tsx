import type { Metadata } from "next";
import Link from "next/link";
import { CustodyNoteLogo } from "@/components/CustodyNoteLogo";
import { AppScreenshots } from "@/components/AppScreenshots";

export const metadata: Metadata = {
  title:
    "Custody Note – The custody note app for freelance police station reps",
  description:
    "Desktop app for freelance police station representatives and criminal solicitors. LAA-compliant custody notes, time recording, firm billing, and PDF export. 30-day free trial.",
  openGraph: {
    title:
      "Custody Note – The custody note app for freelance police station reps",
    description:
      "Desktop app for freelance police station representatives and criminal solicitors. LAA-compliant custody notes, time recording, firm billing, and PDF export.",
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-custody-slate/10 bg-gradient-to-b from-custody-light/80 to-white dark:from-custody-slate/50 dark:to-custody-navy">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center">
              <CustodyNoteLogo className="h-14 w-14 sm:h-16 sm:w-16" />
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-custody-navy dark:text-white sm:text-5xl lg:text-6xl">
              The custody note app for{" "}
              <span className="text-custody-blue dark:text-custody-accent">
                freelance reps
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-custody-slate dark:text-custody-light/80">
              Built for freelance police station representatives and criminal
              solicitors who attend stations on behalf of defence firms.
              LAA-compliant notes, time recording, firm billing, and PDF
              export—so you can focus on the client, not the admin.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/trial"
                className="rounded-lg bg-custody-blue px-6 py-3 text-base font-medium text-white hover:bg-custody-accent"
              >
                Start 30-day free trial
              </Link>
              <Link
                href="/buy"
                className="rounded-lg border border-custody-slate/30 bg-white px-6 py-3 text-base font-medium text-custody-navy hover:bg-custody-light dark:border-custody-light/20 dark:bg-custody-slate dark:text-white dark:hover:bg-custody-slate/80"
              >
                Subscribe
              </Link>
            </div>
            <p className="mt-4 text-sm text-custody-slate dark:text-custody-light/60">
              No credit card for trial. Subscription only—cancel any time.
            </p>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-b border-custody-slate/10 py-16 dark:border-custody-light/10 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-custody-navy dark:text-white sm:text-3xl">
            Built for freelance reps and solicitors
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-custody-slate dark:text-custody-light/80">
            Whether you cover one firm or twenty, Custody Note tracks every
            attendance, records your time, and keeps your notes LAA-compliant
            and audit-ready—across every firm you work for.
          </p>
          <ul className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
            {[
              "Freelance police station representatives (accredited and probationary)",
              "Freelance criminal solicitors attending police stations",
              "Duty solicitors covering for criminal defence firms",
              "Reps and solicitors billing multiple instructing firms",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border border-custody-slate/15 bg-white p-4 dark:border-custody-light/10 dark:bg-custody-slate/30"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-custody-accent/20 text-custody-blue dark:bg-custody-accent/30 dark:text-custody-accent">
                  ✓
                </span>
                <span className="text-sm text-custody-navy dark:text-custody-light/90">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-b border-custody-slate/10 bg-custody-light/30 py-16 dark:border-custody-light/10 dark:bg-custody-slate/20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-custody-navy dark:text-white sm:text-3xl">
            Everything a freelance rep needs
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-custody-slate dark:text-custody-light/80">
            One desktop app for attendances, telephone advice, billing, and
            compliance.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Attendance, Tel Advice & Quick Capture",
                description:
                  "Record in-person attendances and telephone advice (INVB) from one home screen. Quick Capture lets you grab initial case details the moment you get the call.",
              },
              {
                title: "Firm tracking & billing",
                description:
                  "Log which firm instructed each case. Track disbursements with VAT treatment, time recording, and LAA fee codes so you can bill every firm accurately.",
              },
              {
                title: "LAA compliance",
                description:
                  "LAA outcome codes, stage reached, and fee codes built in. Structured notes and time records that meet Legal Aid Agency and audit requirements.",
              },
              {
                title: "Custody record & PACE",
                description:
                  "1st, 2nd and 3rd PACE review times—due and actual—with notes. Arrest & detention, welfare and vulnerability tracked in one place.",
              },
              {
                title: "Case & disclosure",
                description:
                  "Client details, offence picker with type-ahead search, disclosure and OIC fields. Reasons for advice and sufficient benefit test (LAA) built in.",
              },
              {
                title: "PDF export & offline",
                description:
                  "Export notes to PDF for firms, clients and courts. Runs on your machine—works offline at the station with no internet needed.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-custody-slate/15 bg-white p-6 shadow-sm dark:border-custody-light/10 dark:bg-custody-slate/30"
              >
                <h3 className="text-lg font-semibold text-custody-navy dark:text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-custody-slate dark:text-custody-light/80">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="border-b border-custody-slate/10 py-16 dark:border-custody-light/10 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-custody-navy dark:text-white sm:text-3xl">
            See the app
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-custody-slate dark:text-custody-light/80">
            A desktop app designed around the custody visit workflow.
          </p>
          <div className="mt-12">
            <AppScreenshots />
          </div>
        </div>
      </section>

      {/* How it works summary */}
      <section className="border-b border-custody-slate/10 bg-custody-light/30 py-16 dark:border-custody-light/10 dark:bg-custody-slate/20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-custody-navy dark:text-white sm:text-3xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-custody-slate dark:text-custody-light/80">
            From the first call to billing the firm &mdash; four simple steps.
          </p>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Quick Capture",
                description:
                  "Grab case details the moment you get the call.",
              },
              {
                step: "2",
                title: "Attend & Record",
                description:
                  "Full attendance notes, PACE reviews, and time recording at the station.",
              },
              {
                step: "3",
                title: "Export PDF",
                description:
                  "Generate a professional custody note with one click.",
              },
              {
                step: "4",
                title: "Bill the firm",
                description:
                  "Track each firm separately with accurate time and disbursements.",
              },
            ].map(({ step, title, description }) => (
              <div
                key={step}
                className="flex flex-col items-center rounded-xl border border-custody-slate/15 bg-white p-6 text-center shadow-sm dark:border-custody-light/10 dark:bg-custody-slate/30"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-custody-blue text-lg font-bold text-white dark:bg-custody-accent">
                  {step}
                </span>
                <h3 className="mt-3 font-semibold text-custody-navy dark:text-white">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-custody-slate dark:text-custody-light/80">
                  {description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-custody-blue hover:text-custody-accent dark:text-custody-accent dark:hover:text-custody-light"
            >
              See the full walkthrough &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Cloud Backup highlight */}
      <section className="border-b border-custody-slate/10 py-16 dark:border-custody-light/10 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl border-2 border-custody-accent bg-gradient-to-br from-custody-light/50 to-white p-8 shadow-sm dark:from-custody-slate/40 dark:to-custody-slate/20 sm:p-10">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-custody-accent/10 dark:bg-custody-accent/20">
                <svg
                  className="h-7 w-7 text-custody-blue dark:text-custody-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
                  />
                </svg>
              </div>
              <div className="mt-4 sm:ml-6 sm:mt-0">
                <h3 className="text-xl font-semibold text-custody-navy dark:text-white">
                  Incorruptible Cloud Backup
                </h3>
                <p className="mt-2 text-sm text-custody-slate dark:text-custody-light/80">
                  Your records are too important to risk. Cloud Backup encrypts
                  your database on your machine and uploads it to a secure UK
                  data centre with 90-day tamper protection. Nobody &mdash; not
                  even us &mdash; can alter or delete your backups.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                  <Link
                    href="/cloud-backup"
                    className="rounded-lg bg-custody-blue px-5 py-2.5 text-sm font-medium text-white hover:bg-custody-accent"
                  >
                    Learn more
                  </Link>
                  <Link
                    href="/pricing"
                    className="rounded-lg border border-custody-slate/30 px-5 py-2.5 text-sm font-medium text-custody-navy hover:bg-custody-light dark:border-custody-light/20 dark:text-white dark:hover:bg-custody-slate"
                  >
                    See pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-custody-slate/10 bg-custody-light/20 py-16 dark:border-custody-light/5 dark:bg-custody-navy/30 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-custody-navy dark:text-white sm:text-3xl">
            What reps are saying
          </h2>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote:
                  "Custody Note has completely changed how I manage station visits. I used to spend hours typing up notes after the fact \u2014 now it\u2019s all done at the station.",
                name: "Sarah M.",
                role: "Freelance Police Station Rep, London",
              },
              {
                quote:
                  "Billing multiple firms was a nightmare. Now I just filter by firm and export \u2014 invoicing takes minutes instead of a whole afternoon.",
                name: "James T.",
                role: "Criminal Duty Solicitor, Manchester",
              },
              {
                quote:
                  "The cloud backup gives me total peace of mind. I know my records are safe even if my laptop dies. And the encryption means client confidentiality is never at risk.",
                name: "Angela R.",
                role: "Accredited Rep, Birmingham",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-custody-slate/15 bg-white p-6 shadow-sm dark:border-custody-light/10 dark:bg-custody-slate/30"
              >
                <blockquote className="text-sm italic leading-relaxed text-custody-slate dark:text-custody-light/80">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-4">
                  <p className="font-semibold text-custody-navy dark:text-white">
                    {t.name}
                  </p>
                  <p className="text-xs text-custody-slate dark:text-custody-light/60">
                    {t.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section
        id="benefits"
        className="border-b border-custody-slate/10 bg-custody-light/20 py-16 dark:border-custody-light/5 dark:bg-custody-navy/30 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-custody-navy dark:text-white sm:text-3xl">
            Why freelance reps use Custody Note
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-custody-slate dark:text-custody-light/80">
            Less admin, fewer compliance headaches, more time for clients.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Bill every firm accurately",
                body: "Track which firm instructed each case, record time and disbursements with VAT, and export everything you need to invoice.",
              },
              {
                title: "Your records, your machine",
                body: "Data stays on your device. Export and back up when you choose—no firm or third party controls your files.",
              },
              {
                title: "Works at any station",
                body: "Runs offline with no internet needed. Use it at any police station without relying on Wi-Fi or mobile signal.",
              },
              {
                title: "Stay LAA-compliant",
                body: "Notes and time records that align with LAA outcome codes, stage reached, and audit expectations—ready when you need them.",
              },
              {
                title: "Save hours every week",
                body: "Structured templates, quick capture, and one-click PDF export mean less rework and no duplicate typing.",
              },
              {
                title: "Simple pricing",
                body: "Subscription only—no per-seat charges, no hidden fees, no firm approval needed. Cancel any time.",
              },
            ].map((b) => (
              <div
                key={b.title}
                className="rounded-lg border border-custody-slate/15 bg-white/80 p-5 dark:border-custody-light/10 dark:bg-custody-slate/30"
              >
                <h3 className="font-semibold text-custody-navy dark:text-white">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm text-custody-slate dark:text-custody-light/80">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-custody-blue py-16 dark:bg-custody-slate sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Ready to try Custody Note?
          </h2>
          <p className="mt-4 text-custody-light/90">
            Download the app and start your 30-day free trial. No credit card
            required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/download"
              className="rounded-lg bg-white px-6 py-3 text-base font-medium text-custody-blue hover:bg-custody-light"
            >
              Download now
            </Link>
            <Link
              href="/trial"
              className="rounded-lg border border-white/40 px-6 py-3 text-base font-medium text-white hover:bg-white/10"
            >
              Start free trial
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-white/40 px-6 py-3 text-base font-medium text-white hover:bg-white/10"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
