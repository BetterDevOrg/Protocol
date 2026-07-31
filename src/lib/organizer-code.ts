import { id } from "ethers";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function organizerIdToBytes32(organizerId: string): string {
  return id(organizerId.trim().toUpperCase());
}

export function deriveOrganizerCodeFromSeed(seed: bigint): string {
  let value = seed;
  let out = "ORG-";
  const base = BigInt(CODE_CHARS.length);

  for (let i = 0; i < 6; i += 1) {
    out += CODE_CHARS[Number(value % base)];
    value /= base;
  }

  return out;
}

export function isPendingOrganizerCode(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  return !normalized || normalized === "PENDING-VRF";
}

export function buildOrganizerCodeProofUri(origin: string, organizerId: string): string {
  return `${origin.replace(/\/$/, "")}/organizers/${encodeURIComponent(organizerId.trim().toUpperCase())}`;
}
