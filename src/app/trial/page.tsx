import type { Metadata } from "next";
import Link from "next/link";
import { TrialSignupForm } from "@/components/TrialSignupForm";

export const metadata: Metadata = {
  title: "30-day free trial",
  description:
    "Start a 30-day free trial of Custody Note. No credit card required. Get a licence key to activate in the desktop app.",
  robots: { index: true, follow: true },
};

export default function TrialPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <h1 className="text-3xl font-bold text-custody-navy dark:text-white sm:text-4xl">
        Try Custody Note free for 30 days
      </h1>
      <p className="mt-4 max-w-2xl text-custody-slate dark:text-custody-light/80">
        No credit card required. Enter your email below to get a licence key
        that activates the full app for 30 days.
      </p>

      <div className="mt-8">
        <TrialSignupForm />
      </div>

      <div className="mt-8 space-y-3 text-sm text-custody-slate dark:text-custody-light/70">
        <p>The trial includes all features with no restrictions.</p>
        <p>
          After 30 days,{" "}
          <Link
            href="/pricing"
            className="text-custody-blue hover:text-custody-accent"
          >
            subscribe
          </Link>{" "}
          to keep using Custody Note. Your data is preserved.
        </p>
      </div>

      <p className="mt-8">
        <Link
          href="/pricing"
          className="text-sm text-custody-slate hover:text-custody-accent dark:text-custody-light/80 dark:hover:text-custody-accent"
        >
          See pricing &rarr;
        </Link>
      </p>
    </div>
  );
}
