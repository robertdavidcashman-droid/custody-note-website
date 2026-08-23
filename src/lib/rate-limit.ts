import { NextRequest, NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Best-effort client IP for Vercel / reverse-proxy deployments. */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export type RateLimitOptions = {
  /** Unique scope, e.g. "licence-validate". */
  name: string;
  /** Max requests per window per IP. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export type RateLimitResult =
  | { allowed: true; remaining: number; resetAt: number }
  | { allowed: false; remaining: 0; resetAt: number };

/**
 * In-memory fixed-window rate limiter. Resets on cold starts; suitable as a
 * first-line defence against brute-force and abuse on serverless instances.
 */
export function checkRateLimit(
  ip: string,
  { name, limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const key = `${name}:${ip}`;
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/** Returns a 429 response when the client is over the limit. */
export function rateLimitResponse(
  req: NextRequest,
  options: RateLimitOptions,
): NextResponse | null {
  const ip = getClientIp(req);
  const result = checkRateLimit(ip, options);

  if (result.allowed) return null;

  const retryAfter = Math.max(
    1,
    Math.ceil((result.resetAt - Date.now()) / 1000),
  );

  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(options.limit),
        "X-RateLimit-Remaining": "0",
      },
    },
  );
}
