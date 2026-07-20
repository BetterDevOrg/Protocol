import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_TTL_MS = 4 * 60 * 60 * 1000;

function getSigningSecret(): string {
  const secret = process.env.CHECKIN_SIGNING_SECRET?.trim();
  if (!secret) {
    throw new Error("Missing CHECKIN_SIGNING_SECRET.");
  }
  return secret;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSigningSecret()).update(payload).digest("base64url");
}

export function signCheckinToken(meetupId: string, expiresAtMs?: number): string {
  const expiresAt = expiresAtMs ?? Date.now() + DEFAULT_TTL_MS;
  const payload = `${meetupId}:${expiresAt}`;
  const signature = signPayload(payload);
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function verifyCheckinToken(token: string, expectedMeetupId?: string): { meetupId: string } {
  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    throw new Error("Invalid check-in token.");
  }

  const parts = decoded.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid check-in token.");
  }

  const [meetupId, expiresAtRaw, signature] = parts;
  const expiresAt = Number(expiresAtRaw);
  if (!meetupId || !Number.isFinite(expiresAt)) {
    throw new Error("Invalid check-in token.");
  }

  const expectedSignature = signPayload(`${meetupId}:${expiresAt}`);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error("Invalid check-in token.");
  }

  if (Date.now() > expiresAt) {
    throw new Error("Check-in link has expired. Ask the organizer for a new QR code.");
  }

  if (expectedMeetupId && meetupId !== expectedMeetupId) {
    throw new Error("Check-in token does not match this meetup.");
  }

  return { meetupId };
}

export function buildCheckinUrl(origin: string, meetupId: string, token: string): string {
  const url = new URL("/checkin", origin);
  url.searchParams.set("meetup", meetupId);
  url.searchParams.set("token", token);
  return url.toString();
}
