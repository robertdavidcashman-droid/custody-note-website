"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type DayCount = { day: string; count: number };

type StatsPayload = {
  generatedAt: string;
  downloads: {
    total: number;
    last30Days: number;
    windows: number;
    macArm64: number;
    macX64: number;
    last30DaysByDay: DayCount[];
  };
  trials: {
    uniqueStarts: number;
    last30DaysUnique: number;
    byPlatform: Record<string, number>;
    last30DaysByDay: DayCount[];
  };
  usage: {
    uniqueLast7Days: number;
    uniqueLast30Days: number;
    uniqueAllTime: number;
    byPlatform: Record<string, number>;
    last30DaysByDay: DayCount[];
  };
  subscriptions: {
    active: number;
    trialing: number;
    total: number;
    activeAppUsers30d: number;
    cancelled: number;
    expired: number;
    pastDue: number;
    noSubscription: number;
  };
  notes: string[];
};

type LicenceRow = {
  userId: string;
  email: string;
  name?: string;
  subscriptionStatus?: string;
  plan?: string;
  lastAppUseAt?: string;
  createdAt: string;
  licenceRevokeIdleWarning?: string;
};

const LIVE_STATUSES = new Set(["active", "trialing"]);

function isLive(row: LicenceRow): boolean {
  return LIVE_STATUSES.has(row.subscriptionStatus || "");
}

function formatWhen(value?: string): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function statusLabel(status?: string): string {
  if (!status) return "No subscription";
  if (status === "trialing") return "Trialing";
  if (status === "active") return "Active";
  if (status === "past_due") return "Past due";
  if (status === "cancelled" || status === "canceled") return "Cancelled";
  if (status === "expired") return "Expired";
  return status;
}

function statusClass(status?: string): string {
  const base = "rounded px-2 py-0.5 text-xs ";
  switch (status) {
    case "active":
      return base + "bg-emerald-500/20 text-emerald-200";
    case "trialing":
      return base + "bg-amber-500/20 text-amber-200";
    case "past_due":
      return base + "bg-orange-500/20 text-orange-200";
    case "cancelled":
    case "canceled":
      return base + "bg-red-500/15 text-red-200";
    case "expired":
      return base + "bg-white/10 text-blue-100/50";
    default:
      return base + "bg-white/10 text-blue-100/45";
  }
}

function filterRows(rows: LicenceRow[], query: string): LicenceRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(
    (row) =>
      row.email.toLowerCase().includes(q) ||
      (row.name || "").toLowerCase().includes(q) ||
      (row.plan || "").toLowerCase().includes(q) ||
      statusLabel(row.subscriptionStatus).toLowerCase().includes(q),
  );
}

function sortByEmail(rows: LicenceRow[]): LicenceRow[] {
  return [...rows].sort((a, b) =>
    a.email.localeCompare(b.email, "en", { sensitivity: "base" }),
  );
}

function exportCsv(rows: LicenceRow[], filename: string) {
  const escape = (value: string) =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  const blob = new Blob(
    [
      [
        "email,name,status,plan,last_app_use,account_created",
        ...rows.map((row) =>
          [
            row.email,
            row.name || "",
            row.subscriptionStatus || "none",
            row.plan || "",
            row.lastAppUseAt || "",
            row.createdAt,
          ]
            .map((v) => escape(String(v)))
            .join(","),
        ),
      ].join("\n"),
    ],
    { type: "text/csv;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-medium text-blue-100/80">{label}</p>
      {hint ? (
        <p className="mt-1 text-xs text-blue-100/45">{hint}</p>
      ) : null}
    </div>
  );
}

function DayChart({ title, data }: { title: string; data: DayCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h3 className="text-sm font-semibold text-blue-100/80">{title}</h3>
      <div className="mt-4 flex h-24 items-end gap-0.5">
        {data.slice(-30).map((d) => (
          <div
            key={d.day}
            title={`${d.day}: ${d.count}`}
            className="min-w-0 flex-1 rounded-t bg-blue-500/70 transition-colors hover:bg-blue-400/90"
            style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-blue-100/40">Last 30 days (UTC)</p>
    </div>
  );
}

function LicenceTable({
  rows,
  loading,
  emptyMessage,
  showCreated = false,
}: {
  rows: LicenceRow[];
  loading: boolean;
  emptyMessage: string;
  showCreated?: boolean;
}) {
  const cols = showCreated ? 6 : 5;
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-blue-100/50">
            <th className="px-3 py-2.5 font-semibold">Email</th>
            <th className="px-3 py-2.5 font-semibold">Name</th>
            <th className="px-3 py-2.5 font-semibold">Status</th>
            <th className="px-3 py-2.5 font-semibold">Plan</th>
            <th className="px-3 py-2.5 font-semibold">Last app use</th>
            {showCreated ? (
              <th className="px-3 py-2.5 font-semibold">Account created</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {loading && rows.length === 0 ? (
            <tr>
              <td
                colSpan={cols}
                className="px-3 py-6 text-center text-blue-100/45"
              >
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={cols}
                className="px-3 py-6 text-center text-blue-100/45"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.userId}
                className="border-b border-white/5 hover:bg-white/[0.03]"
              >
                <td className="px-3 py-2.5 font-mono text-xs text-blue-50">
                  {row.email}
                </td>
                <td className="px-3 py-2.5 text-blue-100/80">
                  {row.name || "—"}
                </td>
                <td className="px-3 py-2.5">
                  <span className={statusClass(row.subscriptionStatus)}>
                    {statusLabel(row.subscriptionStatus)}
                  </span>
                  {row.licenceRevokeIdleWarning ? (
                    <p
                      className="mt-1 max-w-xs text-xs text-amber-200/70"
                      title={row.licenceRevokeIdleWarning}
                    >
                      Grace period
                    </p>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-blue-100/70">
                  {row.plan || "—"}
                </td>
                <td className="px-3 py-2.5 text-xs tabular-nums text-blue-100/55">
                  {formatWhen(row.lastAppUseAt)}
                </td>
                {showCreated ? (
                  <td className="px-3 py-2.5 text-xs tabular-nums text-blue-100/55">
                    {formatWhen(row.createdAt)}
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function AccountsPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const [rows, setRows] = useState<LicenceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [liveQuery, setLiveQuery] = useState("");
  const [allQuery, setAllQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/licences", { credentials: "include" });
      if (res.status === 401) {
        throw new Error("Session expired — sign in again");
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setRows(Array.isArray(data.licences) ? data.licences : []);
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const live = useMemo(() => rows.filter(isLive), [rows]);
  const liveFiltered = useMemo(
    () => sortByEmail(filterRows(live, liveQuery)),
    [live, liveQuery],
  );
  const allFiltered = useMemo(
    () => sortByEmail(filterRows(rows, allQuery)),
    [rows, allQuery],
  );

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Live subscribers</h2>
            <p className="mt-1 text-sm text-blue-100/55">
              Active paid and Lemon Squeezy trials only.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => load()}
              disabled={loading}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/5 disabled:opacity-50"
            >
              {loading ? "Loading…" : "Reload lists"}
            </button>
            <button
              type="button"
              onClick={() =>
                exportCsv(liveFiltered, "custody-note-live-subscribers")
              }
              disabled={liveFiltered.length === 0}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/5 disabled:opacity-50"
            >
              Export live CSV
            </button>
          </div>
        </div>
        <p className="mt-4 text-2xl font-bold tabular-nums">
          {loading && live.length === 0 ? "…" : live.length}
          <span className="ml-2 text-sm font-medium text-blue-100/60">
            live {live.length === 1 ? "subscriber" : "subscribers"}
          </span>
        </p>
        <label className="mt-4 block text-sm font-medium text-blue-100/70">
          Search live
          <input
            type="search"
            value={liveQuery}
            onChange={(e) => setLiveQuery(e.target.value)}
            placeholder="Email, name, plan, or status…"
            className="mt-1.5 w-full max-w-md rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
          />
        </label>
        <div className="mt-4">
          <LicenceTable
            rows={liveFiltered}
            loading={loading}
            emptyMessage={
              liveQuery.trim()
                ? "No live subscribers match your search."
                : "No live subscribers (active or trialing)."
            }
          />
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">All accounts</h2>
            <p className="mt-1 text-sm text-blue-100/55">
              Every email stored in your subscriber database — matches “Accounts
              total” above. Includes cancelled, expired, and accounts with no
              subscription.
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportCsv(allFiltered, "custody-note-all-accounts")}
            disabled={allFiltered.length === 0}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/5 disabled:opacity-50"
          >
            Export all CSV
          </button>
        </div>
        <p className="mt-4 text-2xl font-bold tabular-nums">
          {loading && rows.length === 0 ? "…" : rows.length}
          <span className="ml-2 text-sm font-medium text-blue-100/60">
            {rows.length === 1 ? "account" : "accounts"} total
          </span>
        </p>
        <label className="mt-4 block text-sm font-medium text-blue-100/70">
          Search all
          <input
            type="search"
            value={allQuery}
            onChange={(e) => setAllQuery(e.target.value)}
            placeholder="Email, name, plan, or status…"
            className="mt-1.5 w-full max-w-md rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
          />
        </label>
        <div className="mt-4">
          <LicenceTable
            rows={allFiltered}
            loading={loading}
            showCreated
            emptyMessage={
              allQuery.trim()
                ? "No accounts match your search."
                : "No accounts in KV."
            }
          />
        </div>
      </section>
    </div>
  );
}

export default function AdminStatsPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadStats = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (res.status === 401) {
        setAuthed(false);
        setStats(null);
        throw new Error("Session expired — sign in again");
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setStats(await res.json());
      setAuthed(true);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setStats(null);
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    loadStats().catch(() => {});
  }, [loadStats]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    const value = password.trim();
    if (!value) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: value }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Invalid password");
      }
      setPassword("");
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
    setAuthed(false);
    setPassword("");
    setStats(null);
    setError("");
  }

  if (!authed) {
    return (
      <form
        onSubmit={onLogin}
        className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8"
      >
        <h1 className="text-xl font-bold">Custody Note stats</h1>
        <p className="mt-2 text-sm text-blue-100/60">
          Sign in with your admin password to view download, trial, and
          subscription statistics, including live subscriber emails.
        </p>
        <label
          className="mt-6 block text-sm font-medium"
          htmlFor="admin-password"
        >
          Admin password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
        />
        {error ? (
          <p className="mt-3 text-sm text-red-300">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
        >
          {busy ? "Signing in…" : "View stats"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Custody Note stats</h1>
          {stats?.generatedAt ? (
            <p className="mt-1 text-xs text-blue-100/45">
              Updated {new Date(stats.generatedAt).toLocaleString("en-GB")}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => loadStats()}
            disabled={busy}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
          >
            {busy ? "Loading…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {stats ? (
        <>
          <section>
            <h2 className="mb-3 text-lg font-semibold">Subscribers</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Active paid"
                value={stats.subscriptions.active}
                hint="Lemon Squeezy status: active"
              />
              <StatCard
                label="Trialing (paid LS)"
                value={stats.subscriptions.trialing}
                hint="Lemon Squeezy on_trial"
              />
              <StatCard
                label="Accounts total"
                value={stats.subscriptions.total}
              />
              <StatCard
                label="Used app (30d)"
                value={stats.subscriptions.activeAppUsers30d}
                hint="Validated licence in last 30 days"
              />
              <StatCard
                label="Cancelled"
                value={stats.subscriptions.cancelled}
              />
              <StatCard label="Expired" value={stats.subscriptions.expired} />
              <StatCard label="Past due" value={stats.subscriptions.pastDue} />
              <StatCard
                label="No subscription"
                value={stats.subscriptions.noSubscription}
              />
            </div>
          </section>

          <AccountsPanel refreshKey={refreshKey} />

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              App usage (unique machines)
            </h2>
            <p className="mb-3 text-sm text-blue-100/55">
              Machines that opened the desktop app and sent a heartbeat — not
              installer downloads.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Unique last 7 days"
                value={stats.usage.uniqueLast7Days}
                hint="Distinct machineIds with lastSeen in 7d"
              />
              <StatCard
                label="Unique last 30 days"
                value={stats.usage.uniqueLast30Days}
                hint="Distinct machineIds with lastSeen in 30d"
              />
              <StatCard
                label="Unique all time"
                value={stats.usage.uniqueAllTime}
                hint="Heartbeat machines (not trial uniqueStarts)"
              />
            </div>
            {Object.keys(stats.usage.byPlatform).length > 0 ? (
              <ul className="mt-4 grid gap-2 text-sm text-blue-100/70 sm:grid-cols-3">
                {Object.entries(stats.usage.byPlatform).map(([platform, n]) => (
                  <li
                    key={platform}
                    className="rounded-lg bg-white/[0.03] px-3 py-2"
                  >
                    <span className="font-mono text-blue-200">{platform}</span>
                    : {n}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-4">
              <DayChart
                title="Active machines per day (by lastSeen)"
                data={stats.usage.last30DaysByDay}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Downloads (website)
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total tracked" value={stats.downloads.total} />
              <StatCard
                label="Last 30 days"
                value={stats.downloads.last30Days}
              />
              <StatCard label="Windows" value={stats.downloads.windows} />
              <StatCard
                label="Mac (Apple Silicon)"
                value={stats.downloads.macArm64}
              />
              <StatCard label="Mac (Intel)" value={stats.downloads.macX64} />
            </div>
            <div className="mt-4">
              <DayChart
                title="Downloads per day"
                data={stats.downloads.last30DaysByDay}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Local app trials (desktop)
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Unique trial machines"
                value={stats.trials.uniqueStarts}
                hint="First local 30-day trial per device"
              />
              <StatCard
                label="New trials (30d)"
                value={stats.trials.last30DaysUnique}
              />
            </div>
            {Object.keys(stats.trials.byPlatform).length > 0 ? (
              <ul className="mt-4 grid gap-2 text-sm text-blue-100/70 sm:grid-cols-3">
                {Object.entries(stats.trials.byPlatform).map(
                  ([platform, n]) => (
                    <li
                      key={platform}
                      className="rounded-lg bg-white/[0.03] px-3 py-2"
                    >
                      <span className="font-mono text-blue-200">
                        {platform}
                      </span>
                      : {n}
                    </li>
                  ),
                )}
              </ul>
            ) : null}
            <div className="mt-4">
              <DayChart
                title="New trial machines per day"
                data={stats.trials.last30DaysByDay}
              />
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm font-semibold text-blue-100/70">Notes</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-blue-100/50">
              {stats.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        </>
      ) : busy ? (
        <p className="text-sm text-blue-100/50">Loading…</p>
      ) : null}
    </div>
  );
}
