import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  countUniqueUsage,
  fillLast30Days,
  isSeenWithinDays,
  type HeartbeatRecord,
} from "../src/lib/stats/usage";
import {
  isValidHeartbeatMachineId,
  isValidTrialMachineId,
  normalizeMachineId,
} from "../src/lib/stats/validate";

describe("heartbeat machineId validation", () => {
  it("accepts 32 hex chars", () => {
    assert.equal(
      isValidHeartbeatMachineId("0123456789abcdef0123456789abcdef"),
      true,
    );
    assert.equal(
      isValidHeartbeatMachineId("ABCDEF0123456789ABCDEF0123456789"),
      true,
    );
  });

  it("rejects non-hex, wrong length, and non-strings", () => {
    assert.equal(isValidHeartbeatMachineId("abc"), false);
    assert.equal(isValidHeartbeatMachineId("z".repeat(32)), false);
    assert.equal(isValidHeartbeatMachineId("a".repeat(31)), false);
    assert.equal(isValidHeartbeatMachineId("a".repeat(33)), false);
    assert.equal(isValidHeartbeatMachineId(null), false);
    assert.equal(isValidHeartbeatMachineId(32), false);
    assert.equal(isValidHeartbeatMachineId(""), false);
  });
});

describe("trial machineId validation (live-compatible)", () => {
  it("requires trimmed length >= 8", () => {
    assert.equal(isValidTrialMachineId("abcdefgh"), true);
    assert.equal(isValidTrialMachineId("abc"), false);
    assert.equal(isValidTrialMachineId("   "), false);
    assert.equal(isValidTrialMachineId(null), false);
  });
});

describe("normalizeMachineId", () => {
  it("trims and lowercases", () => {
    assert.equal(
      normalizeMachineId("  ABCDEF0123456789ABCDEF0123456789  "),
      "abcdef0123456789abcdef0123456789",
    );
  });
});

describe("unique 7/30-day usage counting", () => {
  const now = new Date("2026-08-31T12:00:00.000Z");

  function hb(
    id: string,
    lastSeen: string,
    platform = "win32",
  ): HeartbeatRecord {
    return {
      machineId: id,
      firstSeen: "2026-01-01T00:00:00.000Z",
      lastSeen,
      platform,
    };
  }

  it("isSeenWithinDays respects window", () => {
    assert.equal(isSeenWithinDays("2026-08-30T00:00:00.000Z", 7, now), true);
    assert.equal(isSeenWithinDays("2026-08-20T00:00:00.000Z", 7, now), false);
    assert.equal(isSeenWithinDays("2026-08-02T00:00:00.000Z", 30, now), true);
    assert.equal(isSeenWithinDays("2026-07-01T00:00:00.000Z", 30, now), false);
  });

  it("counts unique machines in 7d / 30d / all-time without conflating trials", () => {
    const records = [
      hb("a", "2026-08-30T10:00:00.000Z", "win32"), // 7d + 30d
      hb("b", "2026-08-10T10:00:00.000Z", "darwin"), // 30d only
      hb("c", "2026-07-01T10:00:00.000Z", "win32"), // all-time only
      hb("d", "2026-08-28T10:00:00.000Z", "darwin"), // 7d + 30d
    ];

    const usage = countUniqueUsage(records, now);
    assert.equal(usage.uniqueLast7Days, 2);
    assert.equal(usage.uniqueLast30Days, 3);
    assert.equal(usage.uniqueAllTime, 4);
    assert.equal(usage.byPlatform.win32, 1);
    assert.equal(usage.byPlatform.darwin, 2);
    assert.equal(usage.last30DaysByDay.length, 30);
    assert.equal(
      usage.last30DaysByDay.reduce((s, d) => s + d.count, 0),
      3,
    );
  });

  it("fillLast30Days pads missing days with zero", () => {
    const series = fillLast30Days({ "2026-08-31": 5 }, now);
    assert.equal(series.length, 30);
    assert.equal(series[series.length - 1].day, "2026-08-31");
    assert.equal(series[series.length - 1].count, 5);
    assert.equal(series[0].count, 0);
  });
});
