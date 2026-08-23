import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Pricing — Free during beta | Custody Note",
  description:
    "Custody Note is free during beta. Paid Pro (~£9.99/month) is planned after beta — payments are not wired yet.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://custodynote.com"}/pricing` },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://custodynote.com";

const pricingFaqs = [
  {
    q: "Is Custody Note free?",
    a: "Yes during beta. Download and use core features with no credit card. Paid Pro is planned after beta.",
  },
  {
    q: "Can I buy Pro now?",
    a: "Not yet. Payments are not wired. Pro (~£9.99/month) is planned after beta for advanced tools such as managed cloud backup and sync.",
  },
  {
    q: "Do I need internet to use the app?",
    a: "No. Custody Note works fully offline. Internet is only needed for optional cloud features and updates.",
  },
  {
    q: "Windows and Mac?",
    a: "Yes. Windows 10+ and macOS 11+ (Apple Silicon and Intel). Mobile is not supported.",
  },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd data={buildFaqJsonLd(pricingFaqs)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", url: siteUrl },
          { name: "Pricing", url: `${siteUrl}/pricing` },
        ])}
      />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-custody-accent">
            Public beta
          </p>
          <h1 className="mt-2 text-3xl font-bold text-custody-navy dark:text-white sm:text-4xl">
            Free during beta
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-custody-slate dark:text-custody-light/80">
            Custody Note is in beta — that&apos;s why it&apos;s free while we
            test with real police station work. No credit card. Paid Pro is
            planned after beta (around £9.99/month). Payments are not wired yet.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
          <div className="rounded-xl border-2 border-custody-accent bg-white p-8 dark:bg-custody-slate/30">
            <h2 className="text-xl font-semibold text-custody-navy dark:text-white">
              Free during beta
            </h2>
            <p className="mt-2 text-3xl font-bold text-custody-navy dark:text-white">
              £0
            </p>
            <ul className="mt-4 space-y-2 text-sm text-custody-slate dark:text-custody-light/80">
              <li>Structured PACE attendance notes</li>
              <li>PDF export and time recording</li>
              <li>Offline-first encrypted local storage</li>
              <li>Windows and Mac</li>
            </ul>
            <Link
              href="/download"
              className="mt-6 block rounded-lg bg-custody-blue px-5 py-3 text-center text-sm font-medium text-white hover:bg-custody-accent"
            >
              Download free
            </Link>
          </div>
          <div className="rounded-xl border border-custody-slate/20 bg-white p-8 dark:bg-custody-slate/30">
            <h2 className="text-xl font-semibold text-custody-navy dark:text-white">
              Pro (planned)
            </h2>
            <p className="mt-2 text-3xl font-bold text-custody-navy dark:text-white">
              ~£9.99
              <span className="text-base font-normal text-custody-slate">/month</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-custody-slate dark:text-custody-light/80">
              <li>Everything in beta</li>
              <li>Managed cloud backup (planned)</li>
              <li>Cross-device sync (planned)</li>
              <li>Not purchasable yet — payments not wired</li>
            </ul>
            <Link
              href="/contact"
              className="mt-6 block rounded-lg border border-custody-blue px-5 py-3 text-center text-sm font-medium text-custody-blue hover:bg-custody-light dark:text-custody-accent dark:hover:bg-custody-slate"
            >
              Register firm interest
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <h3 className="text-center text-xl font-semibold text-custody-navy dark:text-white">
            Frequently asked questions
          </h3>
          <dl className="mt-8 space-y-6">
            {pricingFaqs.map((faq) => (
              <div key={faq.q}>
                <dt className="font-medium text-custody-navy dark:text-white">
                  {faq.q}
                </dt>
                <dd className="mt-2 text-sm text-custody-slate dark:text-custody-light/80">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </>
  );
}
