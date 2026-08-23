import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { rateLimitResponse } from "@/lib/rate-limit";

const RATE_LIMIT = { name: "trial-validate", limit: 30, windowMs: 60_000 };

const DEPRECATION_HEADERS = {
  Deprecation: "true",
  Sunset: "Sat, 01 Nov 2026 00:00:00 GMT",
  Link: '</api/trial/validate>; rel="successor-version"',
};

type TrialRecord = {
  email: string;
  createdAt: string;
  expiresAt: string;
};

async function validateTrialKey(key: string) {
  const data = await kv.get<TrialRecord>(`trial:key:${key}`);

  if (!data) {
    return NextResponse.json({ valid: false, reason: "unknown_key" });
  }

  const expired = new Date(data.expiresAt) <= new Date();
  if (expired) {
    return NextResponse.json({
      valid: false,
      reason: "expired",
      expiresAt: data.expiresAt,
    });
  }

  return NextResponse.json({
    valid: true,
    expiresAt: data.expiresAt,
  });
}

/**
 * POST /api/trial/validate
 * Preferred: licence key in JSON body (not logged in query strings).
 * Body: { key: string }
 */
export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(req, RATE_LIMIT);
  if (limited) return limited;

  try {
    const body = await req.json();
    const key = typeof body?.key === "string" ? body.key.trim() : "";

    if (!key) {
      return NextResponse.json(
        { valid: false, error: "Missing key in request body." },
        { status: 400 },
      );
    }

    return validateTrialKey(key);
  } catch (err) {
    console.error("Trial validate error");
    return NextResponse.json(
      { valid: false, error: "Validation failed." },
      { status: 500 },
    );
  }
}

/**
 * GET /api/trial/validate?key=...
 * @deprecated Use POST with JSON body. Keys in query strings may appear in access logs.
 */
export async function GET(req: NextRequest) {
  const limited = rateLimitResponse(req, RATE_LIMIT);
  if (limited) return limited;

  const key = req.nextUrl.searchParams.get("key")?.trim();

  if (!key) {
    return NextResponse.json(
      { valid: false, error: "Missing key parameter." },
      { status: 400, headers: DEPRECATION_HEADERS },
    );
  }

  try {
    const response = await validateTrialKey(key);
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(DEPRECATION_HEADERS)) {
      headers.set(name, value);
    }
    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch (err) {
    console.error("Trial validate error");
    return NextResponse.json(
      { valid: false, error: "Validation failed." },
      { status: 500, headers: DEPRECATION_HEADERS },
    );
  }
}
