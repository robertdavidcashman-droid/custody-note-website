import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cloud Backup",
  description:
    "Incorruptible, encrypted cloud backup for Custody Note. AWS Object Lock, SRA-compliant data isolation, UK data centre. Never lose your records.",
  robots: { index: true, follow: true },
};

export default function CloudBackupPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-custody-slate/10 bg-gradient-to-b from-custody-light/80 to-white py-16 dark:from-custody-slate/50 dark:to-custody-navy sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-block rounded-full bg-custody-accent/10 px-4 py-1.5 text-sm font-semibold text-custody-blue dark:bg-custody-accent/20 dark:text-custody-accent">
            Add-on for subscribers
          </span>
          <h1 className="mt-4 text-3xl font-bold text-custody-navy dark:text-white sm:text-4xl lg:text-5xl">
            Incorruptible cloud backup
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-custody-slate dark:text-custody-light/80">
            Your attendance records are critical. Cloud Backup keeps an
            encrypted, tamper-proof copy in a UK data centre so you can recover
            everything &mdash; even if your computer is lost, stolen, or
            destroyed.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/buy?plan=cloud"
              className="rounded-lg bg-custody-blue px-6 py-3 text-base font-medium text-white hover:bg-custody-accent"
            >
              Subscribe with Cloud Backup
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-custody-slate/30 px-6 py-3 text-base font-medium text-custody-navy hover:bg-custody-light dark:border-custody-light/20 dark:text-white dark:hover:bg-custody-slate"
            >
              Compare plans
            </Link>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="border-b border-custody-slate/10 py-16 dark:border-custody-light/10 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-custody-navy dark:text-white">
            Why cloud backup matters
          </h2>
          <div className="mx-auto mt-8 grid max-w-3xl gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800/30 dark:bg-red-950/20">
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                Without cloud backup
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-red-700 dark:text-red-300/80">
                <li>&bull; Records exist only on your computer</li>
                <li>&bull; Hard drive failure = permanent data loss</li>
                <li>&bull; Theft or damage = no recovery</li>
                <li>&bull; No off-site protection</li>
                <li>&bull; Manual exports are easy to forget</li>
              </ul>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800/30 dark:bg-green-950/20">
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                With cloud backup
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-green-700 dark:text-green-300/80">
                <li>&bull; Automatic encrypted uploads every 2 minutes</li>
                <li>&bull; Tamper-proof for 90 days (Object Lock)</li>
                <li>&bull; Restore on any machine, any time</li>
                <li>&bull; UK data centre (London)</li>
                <li>&bull; Zero effort after setup</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-custody-slate/10 bg-custody-light/30 py-16 dark:border-custody-light/10 dark:bg-custody-slate/20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-custody-navy dark:text-white">
            How it works
          </h2>
          <div className="mx-auto mt-10 max-w-2xl space-y-8">
            {[
              {
                step: 1,
                title: "Subscribe to Cloud Backup",
                description:
                  "Choose the Standard + Cloud Backup plan. Your licence key activates cloud backup automatically in the app.",
              },
              {
                step: 2,
                title: "Your data is encrypted on your machine",
                description:
                  "Before any data leaves your computer, Custody Note encrypts it with AES-256-GCM using a key derived from your licence. Nobody \u2014 not even us \u2014 can read your data.",
              },
              {
                step: 3,
                title: "Encrypted backup uploaded to AWS",
                description:
                  "The encrypted file is uploaded to Amazon Web Services S3 in the London (eu-west-2) region using temporary, scoped credentials unique to your account.",
              },
              {
                step: 4,
                title: "Locked and tamper-proof for 90 days",
                description:
                  "AWS S3 Object Lock in Compliance mode prevents anyone \u2014 including AWS administrators \u2014 from deleting or modifying the backup for 90 days.",
              },
              {
                step: 5,
                title: "Restore any time",
                description:
                  "If you need to recover, open Settings in the app, click Restore from Cloud, and pick the backup you want. Your data is decrypted locally and restored.",
              },
            ].map(({ step, title, description }) => (
              <div key={step} className="flex gap-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-custody-blue text-lg font-bold text-white dark:bg-custody-accent">
                  {step}
                </span>
                <div>
                  <h3 className="font-semibold text-custody-navy dark:text-white">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-custody-slate dark:text-custody-light/80">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SRA compliance */}
      <section className="border-b border-custody-slate/10 py-16 dark:border-custody-light/10 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-custody-navy dark:text-white">
            SRA compliance and data isolation
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-custody-slate dark:text-custody-light/80">
            Designed to meet the Solicitors Regulation Authority requirements
            for confidentiality and data protection.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Per-subscriber isolation",
                description:
                  "Each subscriber\u2019s backups are stored under a unique, hashed prefix in S3. No subscriber can see or access another\u2019s data.",
              },
              {
                title: "Client-side encryption",
                description:
                  "Data is encrypted on your machine before upload. The server only ever sees ciphertext. Your encryption key never leaves your device.",
              },
              {
                title: "Temporary, scoped credentials",
                description:
                  "AWS credentials are issued for just 15 minutes and only grant access to your own prefix. They cannot access any other subscriber\u2019s data.",
              },
              {
                title: "UK data residency",
                description:
                  "All backups are stored in the AWS London (eu-west-2) region. Data never leaves the United Kingdom.",
              },
              {
                title: "Immutable storage",
                description:
                  "S3 Object Lock Compliance mode guarantees that backups cannot be altered or deleted for 90 days, even by AWS staff.",
              },
              {
                title: "TLS in transit",
                description:
                  "All connections to AWS use TLS 1.2+. Unencrypted connections are explicitly denied by bucket policy.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-custody-slate/15 bg-white p-6 shadow-sm dark:border-custody-light/10 dark:bg-custody-slate/30"
              >
                <h3 className="font-semibold text-custody-navy dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-custody-slate dark:text-custody-light/80">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-custody-slate/10 bg-custody-light/30 py-16 dark:border-custody-light/10 dark:bg-custody-slate/20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-custody-navy dark:text-white">
            Cloud Backup FAQ
          </h2>
          <dl className="mt-8 space-y-4">
            {[
              {
                q: "Can you read my backed-up data?",
                a: "No. Your data is encrypted on your machine with a key derived from your licence before it ever leaves your computer. We only store ciphertext.",
              },
              {
                q: "What happens if I cancel my subscription?",
                a: "Your existing backups remain in storage and are protected by Object Lock for 90 days. You can resubscribe and access them again. After 90 days without an active subscription, backups may be deleted.",
              },
              {
                q: "Can another subscriber see my data?",
                a: "No. Each subscriber has a unique, hashed storage prefix. AWS credentials are scoped to only allow access to your own prefix. There is no shared access.",
              },
              {
                q: "How do I restore from cloud backup?",
                a: "Open Custody Note, go to Settings, and click \u201cRestore from Cloud\u201d. You\u2019ll see a list of your recent backups \u2014 pick one to restore. The app downloads and decrypts it locally.",
              },
              {
                q: "Does cloud backup work offline?",
                a: "Cloud backup uploads require an internet connection. The app will queue uploads when you\u2019re offline and send them when you reconnect. Local encrypted backups continue every 2 minutes regardless.",
              },
              {
                q: "Where is my data stored?",
                a: "Amazon Web Services S3, London region (eu-west-2). Data never leaves the United Kingdom.",
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                className="rounded-lg border border-custody-slate/15 bg-white p-5 dark:border-custody-light/10 dark:bg-custody-slate/30"
              >
                <dt className="font-medium text-custody-navy dark:text-white">
                  {q}
                </dt>
                <dd className="mt-2 text-sm text-custody-slate dark:text-custody-light/80">
                  {a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-custody-blue py-16 dark:bg-custody-slate sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Protect your records today
          </h2>
          <p className="mt-4 text-custody-light/90">
            Add cloud backup to your subscription for total peace of mind.
            Automatic, encrypted, incorruptible.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/buy?plan=cloud"
              className="rounded-lg bg-white px-6 py-3 text-base font-medium text-custody-blue hover:bg-custody-light"
            >
              Subscribe with Cloud Backup
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-white/40 px-6 py-3 text-base font-medium text-white hover:bg-white/10"
            >
              Compare plans
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
