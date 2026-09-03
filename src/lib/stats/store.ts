import { kv } from "@vercel/kv";
import {
  fillLast30Days,
  countUniqueUsage,
  utcDay,
  type DayCount,
  type HeartbeatRecord,
} from "./usage";
import { normalizeMachineId, optionalString } from "./validate";

const TRIAL_MACHINE_PREFIX = "stats:trial:machine:";
const TRIAL_INDEX = "stats:trial:machines";
const TRIAL_DAY_PREFIX = "stats:trial:day:";

const HEARTBEAT_MACHINE_PREFIX = "stats:heartbeat:machine:";
const HEARTBEAT_INDEX = "stats:heartbeat:machines";

const DOWNLOAD_TOTAL = "stats:downloads:total";
const DOWNLOAD_WINDOWS = "stats:downloads:windows";
const DOWNLOAD_MAC_ARM = "stats:downloads:macArm64";
const DOWNLOAD_MAC_X64 = "stats:downloads:macX64";
const DOWNLOAD_DAY_PREFIX = "stats:downloads:day:";

export type TrialMachineRecord = {
  machineId: string;
  firstSeen: string;
  platform?: string;
  appVersion?: string;
  tier?: string;
};

export type DownloadPlatform = "windows" | "macArm64" | "macX64";

async function smembers(key: string): Promise<string[]> {
  const members = await kv.smembers(key);
  return Array.isArray(members)
    ? members.filter((m): m is string => typeof m === "string")
    : [];
}

/** Record a desktop Free/trial activation. Returns whether this machine is new. */
export async function recordTrialStarted(input: {
  machineId: string;
  platform?: string;
  appVersion?: string;
  tier?: string;
}): Promise<{ unique: boolean }> {
  const machineId = normalizeMachineId(input.machineId);
  const key = `${TRIAL_MACHINE_PREFIX}${machineId}`;
  const existing = await kv.get<TrialMachineRecord>(key);
  if (existing) {
    return { unique: false };
  }

  const now = new Date().toISOString();
  const record: TrialMachineRecord = {
    machineId,
    firstSeen: now,
    platform: optionalString(input.platform, 32),
    appVersion: optionalString(input.appVersion, 32),
    tier: optionalString(input.tier, 32),
  };

  await kv.set(key, record);
  await kv.sadd(TRIAL_INDEX, machineId);
  await kv.sadd(`${TRIAL_DAY_PREFIX}${utcDay(now)}`, machineId);
  return { unique: true };
}

/** Upsert a daily usage heartbeat by machineId. Does not touch trial counters. */
export async function upsertHeartbeat(input: {
  machineId: string;
  platform?: string;
  appVersion?: string;
  tier?: string;
}): Promise<{ created: boolean }> {
  const machineId = normalizeMachineId(input.machineId);
  const key = `${HEARTBEAT_MACHINE_PREFIX}${machineId}`;
  const now = new Date().toISOString();
  const existing = await kv.get<HeartbeatRecord>(key);

  const record: HeartbeatRecord = {
    machineId,
    firstSeen: existing?.firstSeen || now,
    lastSeen: now,
    platform:
      optionalString(input.platform, 32) || existing?.platform || undefined,
    appVersion:
      optionalString(input.appVersion, 32) || existing?.appVersion || undefined,
    tier: optionalString(input.tier, 32) || existing?.tier || undefined,
  };

  await kv.set(key, record);
  await kv.sadd(HEARTBEAT_INDEX, machineId);
  return { created: !existing };
}

export async function recordDownload(
  platform: DownloadPlatform,
): Promise<void> {
  const dayKey = `${DOWNLOAD_DAY_PREFIX}${utcDay()}`;
  const platformKey =
    platform === "windows"
      ? DOWNLOAD_WINDOWS
      : platform === "macArm64"
        ? DOWNLOAD_MAC_ARM
        : DOWNLOAD_MAC_X64;

  await Promise.all([
    kv.incr(DOWNLOAD_TOTAL),
    kv.incr(platformKey),
    kv.incr(dayKey),
  ]);
}

async function loadTrialRecords(): Promise<TrialMachineRecord[]> {
  const ids = await smembers(TRIAL_INDEX);
  if (ids.length === 0) return [];
  const keys = ids.map((id) => `${TRIAL_MACHINE_PREFIX}${id}`);
  const rows = await kv.mget<(TrialMachineRecord | null)[]>(...keys);
  const list = Array.isArray(rows) ? rows : [];
  return list.filter((r): r is TrialMachineRecord => !!r && !!r.machineId);
}

async function loadHeartbeatRecords(): Promise<HeartbeatRecord[]> {
  const ids = await smembers(HEARTBEAT_INDEX);
  if (ids.length === 0) return [];
  const keys = ids.map((id) => `${HEARTBEAT_MACHINE_PREFIX}${id}`);
  const rows = await kv.mget<(HeartbeatRecord | null)[]>(...keys);
  const list = Array.isArray(rows) ? rows : [];
  return list.filter((r): r is HeartbeatRecord => !!r && !!r.machineId);
}

async function downloadDayMap(now = new Date()): Promise<Record<string, number>> {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    days.push(utcDay(d));
  }
  const keys = days.map((d) => `${DOWNLOAD_DAY_PREFIX}${d}`);
  const values = keys.length
    ? await kv.mget<(number | null)[]>(...keys)
    : [];
  const list = Array.isArray(values) ? values : [];
  const out: Record<string, number> = {};
  days.forEach((day, i) => {
    const n = list[i];
    out[day] = typeof n === "number" ? n : Number(n) || 0;
  });
  return out;
}

export type AdminStatsPayload = {
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

export type AdminLicenceRow = {
  userId: string;
  email: string;
  name?: string;
  subscriptionStatus?: string;
  plan?: string;
  lastAppUseAt?: string;
  createdAt: string;
  licenceRevokeIdleWarning?: string;
};

type LicenceRecord = {
  email?: string;
  name?: string;
  status?: string;
  subscriptionStatus?: string;
  plan?: string;
  createdAt?: string;
  lastValidated?: string;
  lastAppUseAt?: string;
  licenceRevokeIdleWarning?: string;
};

async function loadLicences(): Promise<AdminLicenceRow[]> {
  // Prefer an explicit index if present (live Lemon store); else scan Stripe keys.
  const indexed = await smembers("licence:index");
  let keys: string[] = [];
  if (indexed.length > 0) {
    keys = indexed.map((id) =>
      id.startsWith("licence:key:") ? id : `licence:key:${id}`,
    );
  } else {
    try {
      keys = (await kv.keys("licence:key:*")) as string[];
    } catch {
      keys = [];
    }
  }
  if (keys.length === 0) return [];

  const rows = await kv.mget<(LicenceRecord | null)[]>(...keys);
  const list = Array.isArray(rows) ? rows : [];
  const out: AdminLicenceRow[] = [];
  for (let i = 0; i < keys.length; i++) {
    const rec = list[i];
    if (!rec || typeof rec !== "object") continue;
    const email =
      typeof rec.email === "string" ? rec.email : keys[i].replace(/^licence:key:/, "");
    const status =
      (typeof rec.subscriptionStatus === "string" && rec.subscriptionStatus) ||
      (typeof rec.status === "string" && rec.status) ||
      undefined;
    out.push({
      userId: keys[i],
      email,
      name: typeof rec.name === "string" ? rec.name : undefined,
      subscriptionStatus: status,
      plan: typeof rec.plan === "string" ? rec.plan : undefined,
      lastAppUseAt:
        (typeof rec.lastAppUseAt === "string" && rec.lastAppUseAt) ||
        (typeof rec.lastValidated === "string" && rec.lastValidated) ||
        undefined,
      createdAt:
        typeof rec.createdAt === "string"
          ? rec.createdAt
          : new Date(0).toISOString(),
      licenceRevokeIdleWarning:
        typeof rec.licenceRevokeIdleWarning === "string"
          ? rec.licenceRevokeIdleWarning
          : undefined,
    });
  }
  return out;
}

function summarizeSubscriptions(licences: AdminLicenceRow[], now = new Date()) {
  const cutoff = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  let active = 0;
  let trialing = 0;
  let cancelled = 0;
  let expired = 0;
  let pastDue = 0;
  let noSubscription = 0;
  let activeAppUsers30d = 0;

  for (const row of licences) {
    const status = (row.subscriptionStatus || "").toLowerCase();
    if (status === "active") active += 1;
    else if (status === "trialing" || status === "on_trial") trialing += 1;
    else if (status === "cancelled" || status === "canceled") cancelled += 1;
    else if (status === "expired") expired += 1;
    else if (status === "past_due") pastDue += 1;
    else noSubscription += 1;

    if (row.lastAppUseAt) {
      const t = new Date(row.lastAppUseAt).getTime();
      if (!Number.isNaN(t) && t >= cutoff) activeAppUsers30d += 1;
    }
  }

  return {
    active,
    trialing,
    total: licences.length,
    activeAppUsers30d,
    cancelled,
    expired,
    pastDue,
    noSubscription,
  };
}

export async function getAdminStats(): Promise<AdminStatsPayload> {
  const now = new Date();
  const [trials, heartbeats, downloadsByDay, licences, total, windows, macArm64, macX64] =
    await Promise.all([
      loadTrialRecords(),
      loadHeartbeatRecords(),
      downloadDayMap(now),
      loadLicences(),
      kv.get<number>(DOWNLOAD_TOTAL),
      kv.get<number>(DOWNLOAD_WINDOWS),
      kv.get<number>(DOWNLOAD_MAC_ARM),
      kv.get<number>(DOWNLOAD_MAC_X64),
    ]);

  const trialDayCounts: Record<string, number> = {};
  const trialByPlatform: Record<string, number> = {};
  const cutoff30 = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  let last30DaysUnique = 0;
  for (const t of trials) {
    const platform = t.platform || "unknown";
    trialByPlatform[platform] = (trialByPlatform[platform] || 0) + 1;
    const first = new Date(t.firstSeen).getTime();
    if (!Number.isNaN(first) && first >= cutoff30) {
      last30DaysUnique += 1;
      const day = utcDay(t.firstSeen);
      trialDayCounts[day] = (trialDayCounts[day] || 0) + 1;
    }
  }

  const downloadSeries = fillLast30Days(downloadsByDay, now);
  const usage = countUniqueUsage(heartbeats, now);

  return {
    generatedAt: now.toISOString(),
    downloads: {
      total: Number(total) || 0,
      last30Days: downloadSeries.reduce((sum, d) => sum + d.count, 0),
      windows: Number(windows) || 0,
      macArm64: Number(macArm64) || 0,
      macX64: Number(macX64) || 0,
      last30DaysByDay: downloadSeries,
    },
    trials: {
      uniqueStarts: trials.length,
      last30DaysUnique,
      byPlatform: trialByPlatform,
      last30DaysByDay: fillLast30Days(trialDayCounts, now),
    },
    usage,
    subscriptions: summarizeSubscriptions(licences, now),
    notes: [
      "Downloads count tracked website installer clicks (not unique machines).",
      "Local app trials / Free activations are unique machines that POSTed /api/stats/trial-started.",
      "Usage unique machines come from desktop heartbeats (opened the app), not installer downloads.",
      "Subscription rows are loaded from Vercel KV licence records (Stripe and/or Lemon indexes).",
    ],
  };
}

export async function getAdminLicences(): Promise<AdminLicenceRow[]> {
  return loadLicences();
}
