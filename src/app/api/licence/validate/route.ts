import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { rateLimitResponse } from "@/lib/rate-limit";

const RATE_LIMIT = { name: "licence-validate", limit: 30, windowMs: 60_000 };

/**
 * POST /api/licence/validate
 * Called by the Electron app to validate a licence key and check entitlements.
 * Body: { key: string, machineId: string, appVersion?: string }
 */
export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(req, RATE_LIMIT);
  if (limited) return limited;

  try {
    const body = await req.json();
    const key = typeof body?.key === "string" ? body.key.trim() : "";
    if (!key) {
      return NextResponse.json(
        { valid: false, message: "Missing licence key." },
        { status: 400 },
      );
    }

    // Check trial keys
    const trialData = await kv.get<{
      email: string;
      createdAt: string;
      expiresAt: string;
    }>(`trial:key:${key}`);

    if (trialData) {
      const expired = new Date(trialData.expiresAt) <= new Date();
      return NextResponse.json({
        valid: !expired,
        expiresAt: trialData.expiresAt,
        cloudBackup: false,
        message: expired ? "Trial has expired." : undefined,
      });
    }

    // Check paid subscription keys
    const subData = await kv.get<{
      email: string;
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      plan?: string;
      cloudBackup?: boolean;
      expiresAt?: string;
      status?: string;
      createdAt: string;
    }>(`licence:key:${key.toUpperCase()}`);

    if (!subData) {
      return NextResponse.json({
        valid: false,
        message: "Unknown licence key.",
      });
    }

    const now = new Date();
    const expired = subData.expiresAt
      ? new Date(subData.expiresAt) <= now
      : false;
    const revoked = subData.status === "revoked";

    return NextResponse.json({
      valid: !expired && !revoked,
      expiresAt: subData.expiresAt || null,
      cloudBackup: !!subData.cloudBackup && !expired && !revoked,
      message: revoked
        ? "Licence has been revoked."
        : expired
          ? "Subscription has expired."
          : undefined,
    });
  } catch (err) {
    console.error("Licence validate error");
    return NextResponse.json(
      { valid: false, error: "Validation failed." },
      { status: 500 },
    );
  }
}
