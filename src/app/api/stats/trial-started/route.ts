import { NextRequest } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import {
  STATS_CORS_HEADERS,
  statsJson,
  statsOptionsResponse,
} from "@/lib/stats/cors";
import { recordTrialStarted } from "@/lib/stats/store";
import {
  isValidTrialMachineId,
  optionalString,
} from "@/lib/stats/validate";

const RATE_LIMIT = { name: "stats-trial-started", limit: 60, windowMs: 60_000 };

export async function OPTIONS() {
  return statsOptionsResponse();
}

/**
 * POST /api/stats/trial-started
 * Packaged Electron Free/trial activation ping (no PII / no case data).
 * Body: { machineId, platform?, appVersion?, tier? }
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
    if (!isValidTrialMachineId(machineId)) {
      return statsJson(
        { ok: false, error: "Invalid machineId" },
        { status: 400 },
      );
    }

    const result = await recordTrialStarted({
      machineId,
      platform: optionalString(body?.platform),
      appVersion: optionalString(body?.appVersion),
      tier: optionalString(body?.tier),
    });

    return statsJson({ ok: true, unique: result.unique });
  } catch (err) {
    console.error("trial-started error");
    return statsJson(
      { ok: false, error: "Failed to record trial start" },
      { status: 500 },
    );
  }
}
