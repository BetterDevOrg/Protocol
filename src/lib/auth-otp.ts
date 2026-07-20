import { randomInt } from "crypto";

export const OTP_TTL_MS = 10 * 60 * 1000;

export function generateLoginCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function normalizeLoginEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidLoginEmail(email: string): boolean {
  const normalized = normalizeLoginEmail(email);
  return normalized.includes("@") && normalized.length >= 5;
}

export function otpExpiresAtIso(): string {
  return new Date(Date.now() + OTP_TTL_MS).toISOString();
}
