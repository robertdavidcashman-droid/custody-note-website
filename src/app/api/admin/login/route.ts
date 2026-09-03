import { NextRequest, NextResponse } from "next/server";
import {
  adminConfigured,
  passwordMatches,
  setAdminSessionCookie,
} from "@/lib/admin-auth";
import { rateLimitResponse } from "@/lib/rate-limit";
import { STATS_CORS_HEADERS } from "@/lib/stats/cors";

const RATE_LIMIT = { name: "admin-login", limit: 10, windowMs: 60_000 };

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...STATS_CORS_HEADERS,
      Allow: "OPTIONS, POST",
    },
  });
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(req, RATE_LIMIT);
  if (limited) return limited;

  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "Admin password not configured" },
      { status: 500, headers: STATS_CORS_HEADERS },
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const password =
      typeof body?.password === "string" ? body.password : "";
    if (!password || !passwordMatches(password)) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401, headers: STATS_CORS_HEADERS },
      );
    }

    const res = NextResponse.json(
      { ok: true },
      { headers: STATS_CORS_HEADERS },
    );
    setAdminSessionCookie(res);
    return res;
  } catch {
    return NextResponse.json(
      { error: "Sign in failed" },
      { status: 500, headers: STATS_CORS_HEADERS },
    );
  }
}
