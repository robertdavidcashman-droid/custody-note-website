export type HeartbeatRecord = {
  machineId: string;
  firstSeen: string;
  lastSeen: string;
  platform?: string;
  appVersion?: string;
  tier?: string;
};

export type DayCount = { day: string; count: number };

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** UTC calendar day YYYY-MM-DD. */
export function utcDay(isoOrDate: string | Date = new Date()): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return utcDay(new Date());
  return d.toISOString().slice(0, 10);
}

export function daysAgoUtc(days: number, from: Date = new Date()): Date {
  return new Date(from.getTime() - days * MS_PER_DAY);
}

/** Inclusive window: lastSeen >= (now - days). */
export function isSeenWithinDays(
  lastSeen: string,
  days: number,
  now: Date = new Date(),
): boolean {
  const t = new Date(lastSeen).getTime();
  if (Number.isNaN(t)) return false;
  return t >= now.getTime() - days * MS_PER_DAY;
}

export function countUniqueUsage(
  records: HeartbeatRecord[],
  now: Date = new Date(),
): {
  uniqueLast7Days: number;
  uniqueLast30Days: number;
  uniqueAllTime: number;
  byPlatform: Record<string, number>;
  last30DaysByDay: DayCount[];
} {
  const uniqueLast7Days = records.filter((r) =>
    isSeenWithinDays(r.lastSeen, 7, now),
  ).length;
  const uniqueLast30Days = records.filter((r) =>
    isSeenWithinDays(r.lastSeen, 30, now),
  ).length;

  const byPlatform: Record<string, number> = {};
  for (const r of records) {
    if (!isSeenWithinDays(r.lastSeen, 30, now)) continue;
    const key = r.platform || "unknown";
    byPlatform[key] = (byPlatform[key] || 0) + 1;
  }

  const dayCounts = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    dayCounts.set(utcDay(daysAgoUtc(i, now)), 0);
  }
  for (const r of records) {
    if (!isSeenWithinDays(r.lastSeen, 30, now)) continue;
    const day = utcDay(r.lastSeen);
    if (dayCounts.has(day)) {
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    }
  }

  return {
    uniqueLast7Days,
    uniqueLast30Days,
    uniqueAllTime: records.length,
    byPlatform,
    last30DaysByDay: Array.from(dayCounts.entries()).map(([day, count]) => ({
      day,
      count,
    })),
  };
}

/** Build last-30-days series from a map of day -> count (missing days = 0). */
export function fillLast30Days(
  byDay: Record<string, number>,
  now: Date = new Date(),
): DayCount[] {
  const out: DayCount[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = utcDay(daysAgoUtc(i, now));
    out.push({ day, count: byDay[day] || 0 });
  }
  return out;
}
