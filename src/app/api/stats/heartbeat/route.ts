import { NextRequest } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import {
  STATS_CORS_HEADERS,
  statsJson,
  statsOptionsResponse,
} from "@/lib/stats/cors";
import { upsertHeartbeat } from "@/lib/stats/store";
import {
  isValidHeartbeatMachineId,
  optionalString,
} from "@/lib/stats/validate";

const RATE_LIMIT = { name: "stats-heartbeat", limit: 60, windowMs: 60_000 };

export async function OPTIONS() {
  return statsOptionsResponse();
}

/**
 * POST /api/stats/heartbeat
 * Daily (at most) desktop usage ping. Upserts by machineId.
 * Body: { machineId, platform?, appVersion?, tier? }
 * machineId must be 32 hex chars. Does not increment trial uniqueStarts.
 */
export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(req, RATE_LIMIT);
  if (limited) {
    Object.entries(STATS_CORS_HEADERS).forEach(([k, v]) =>
      limited.headers.set(k, v),
    );
    return limited;
  }

  try {
    const body = await req.json().catch(() => null);
    const machineId = body?.machineId;
    if (!isValidHeartbeatMachineId(machineId)) {
      return statsJson(
        { ok: false, error: "Invalid machineId" },
        { status: 400 },
      );
    }

    const result = await upsertHeartbeat({
      machineId,
      platform: optionalString(body?.platform),
      appVersion: optionalString(body?.appVersion),
      tier: optionalString(body?.tier),
    });

    return statsJson({ ok: true, created: result.created });
  } catch (err) {
    console.error("heartbeat error");
    return statsJson(
      { ok: false, error: "Failed to record heartbeat" },
      { status: 500 },
    );
  }
}
