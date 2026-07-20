import { createHmac, timingSafeEqual } from "crypto";
import { expect } from "chai";

const DEFAULT_TTL_MS = 4 * 60 * 60 * 1000;

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function signCheckinToken(meetupId: string, secret: string, expiresAtMs?: number): string {
  const expiresAt = expiresAtMs ?? Date.now() + DEFAULT_TTL_MS;
  const payload = `${meetupId}:${expiresAt}`;
  const signature = signPayload(payload, secret);
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

function verifyCheckinToken(token: string, secret: string, expectedMeetupId?: string): { meetupId: string } {
  const decoded = Buffer.from(token, "base64url").toString("utf8");
  const parts = decoded.split(":");
  if (parts.length !== 3) throw new Error("Invalid check-in token.");
  const [meetupId, expiresAtRaw, signature] = parts;
  const expiresAt = Number(expiresAtRaw);
  const expectedSignature = signPayload(`${meetupId}:${expiresAt}`, secret);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error("Invalid check-in token.");
  }
  if (Date.now() > expiresAt) throw new Error("Check-in link has expired.");
  if (expectedMeetupId && meetupId !== expectedMeetupId) {
    throw new Error("Check-in token does not match this meetup.");
  }
  return { meetupId };
}

function buildCheckinUrl(origin: string, meetupId: string, token: string): string {
  const url = new URL("/checkin", origin);
  url.searchParams.set("meetup", meetupId);
  url.searchParams.set("token", token);
  return url.toString();
}

describe("Checkin token", function () {
  const secret = "test-checkin-secret-for-unit-tests";

  it("signs and verifies a meetup check-in token", function () {
    const meetupId = "betterdev-lagos-001";
    const expiresAt = Date.now() + 60_000;
    const token = signCheckinToken(meetupId, secret, expiresAt);
    const result = verifyCheckinToken(token, secret, meetupId);
    expect(result.meetupId).to.equal(meetupId);
  });

  it("rejects expired tokens", function () {
    const meetupId = "betterdev-lagos-001";
    const token = signCheckinToken(meetupId, secret, Date.now() - 1_000);
    expect(() => verifyCheckinToken(token, secret, meetupId)).to.throw(/expired/i);
  });

  it("builds a check-in URL with meetup and token params", function () {
    const url = buildCheckinUrl("https://example.com", "betterdev-lagos-001", "abc123");
    expect(url).to.include("https://example.com/checkin");
    expect(url).to.include("meetup=betterdev-lagos-001");
    expect(url).to.include("token=abc123");
  });
});
