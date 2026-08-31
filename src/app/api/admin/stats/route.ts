import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedJson } from "@/lib/admin-auth";
import { STATS_CORS_HEADERS } from "@/lib/stats/cors";
import { getAdminStats } from "@/lib/stats/store";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...STATS_CORS_HEADERS,
      Allow: "OPTIONS, GET",
    },
  });
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return unauthorizedJson();
  }

  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats, { headers: STATS_CORS_HEADERS });
  } catch (err) {
    console.error("admin stats error");
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500, headers: STATS_CORS_HEADERS },
    );
  }
}
