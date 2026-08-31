import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/admin-auth";
import { STATS_CORS_HEADERS } from "@/lib/stats/cors";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...STATS_CORS_HEADERS,
      Allow: "OPTIONS, POST",
    },
  });
}

export async function POST() {
  const res = NextResponse.json(
    { ok: true },
    { headers: STATS_CORS_HEADERS },
  );
  clearAdminSessionCookie(res);
  return res;
}
