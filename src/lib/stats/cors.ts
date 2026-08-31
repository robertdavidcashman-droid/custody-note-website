import { NextResponse } from "next/server";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://custodynote.com";

/** CORS headers matching live /api/stats/* (packaged Electron posts; browser Origin fixed). */
export const STATS_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": SITE,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Accept, User-Agent",
};

export function statsOptionsResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...STATS_CORS_HEADERS,
      Allow: "OPTIONS, POST",
    },
  });
}

export function statsJson(
  body: unknown,
  init: { status?: number } = {},
): NextResponse {
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: STATS_CORS_HEADERS,
  });
}
