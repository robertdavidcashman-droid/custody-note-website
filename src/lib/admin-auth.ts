import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "cn_admin_session";
const MAX_AGE_SEC = 60 * 60 * 12; // 12 hours

function adminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value ? value : null;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function buildToken(secret: string, now = Date.now()): string {
  const exp = String(now + MAX_AGE_SEC * 1000);
  const body = `v1.${exp}`;
  return `${body}.${sign(body, secret)}`;
}

function verifyToken(token: string, secret: string, now = Date.now()): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [ver, exp, sig] = parts;
  if (ver !== "v1" || !exp || !sig) return false;
  const expMs = Number(exp);
  if (!Number.isFinite(expMs) || expMs < now) return false;
  const body = `${ver}.${exp}`;
  const expected = sign(body, secret);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function passwordMatches(candidate: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function adminConfigured(): boolean {
  return !!adminPassword();
}

export function setAdminSessionCookie(res: NextResponse): void {
  const secret = adminPassword();
  if (!secret) return;
  res.cookies.set(ADMIN_COOKIE, buildToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export function clearAdminSessionCookie(res: NextResponse): void {
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function isAdminAuthenticated(req?: NextRequest): boolean {
  const secret = adminPassword();
  if (!secret) return false;

  let token: string | undefined;
  if (req) {
    token = req.cookies.get(ADMIN_COOKIE)?.value;
  } else {
    token = cookies().get(ADMIN_COOKIE)?.value;
  }
  if (!token) return false;
  return verifyToken(token, secret);
}

export function unauthorizedJson(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
