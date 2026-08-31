import type { Metadata } from "next";
import AdminStatsClient from "./AdminStatsClient";

export const metadata: Metadata = {
  title: "Admin stats — Custody Note",
  robots: { index: false, follow: false },
};

export default function AdminStatsPage() {
  return (
    <div className="hero-gradient-bg min-h-[calc(100vh-8rem)] text-blue-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AdminStatsClient />
      </div>
    </div>
  );
}
