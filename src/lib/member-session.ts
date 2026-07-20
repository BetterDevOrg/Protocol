import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const MEMBER_SESSION_COOKIE = "betterdev_member_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type MemberSession = {
  email: string;
  communityId: string;
  expiresAt: number;
};

function getSessionSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("Missing AUTH_SESSION_SECRET.");
  }
  return secret;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function signMemberSession(email: string, communityId: string, expiresAtMs?: number): string {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCommunityId = communityId.trim().toUpperCase();
  const expiresAt = expiresAtMs ?? Date.now() + SESSION_TTL_MS;
  const payload = `${normalizedEmail}:${normalizedCommunityId}:${expiresAt}`;
  const signature = signPayload(payload);
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function verifyMemberSessionToken(token: string): MemberSession {
  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    throw new Error("Invalid session.");
  }

  const parts = decoded.split(":");
  if (parts.length !== 4) {
    throw new Error("Invalid session.");
  }

  const [email, communityId, expiresAtRaw, signature] = parts;
  const expiresAt = Number(expiresAtRaw);
  if (!email || !communityId || !Number.isFinite(expiresAt)) {
    throw new Error("Invalid session.");
  }

  const expectedSignature = signPayload(`${email}:${communityId}:${expiresAt}`);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error("Invalid session.");
  }

  if (Date.now() > expiresAt) {
    throw new Error("Session expired.");
  }

  return { email, communityId, expiresAt };
}

export function sessionCookieOptions(expiresAtMs: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(expiresAtMs),
  };
}

export function attachMemberSessionCookie(response: NextResponse, email: string, communityId: string): void {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const token = signMemberSession(email, communityId, expiresAt);
  response.cookies.set(MEMBER_SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
}

export function clearMemberSessionCookie(response: NextResponse): void {
  response.cookies.set(MEMBER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function readMemberSessionFromCookies(): Promise<MemberSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    return verifyMemberSessionToken(token);
  } catch {
    return null;
  }
}
