import { NextResponse } from "next/server";

export function getOrganizerSessionSecret(): string | null {
  return process.env.ORGANIZER_SESSION_SECRET?.trim() || null;
}

export function verifyOrganizerSecret(providedSecret: string | undefined): NextResponse | null {
  const organizerSecret = getOrganizerSessionSecret();
  if (!organizerSecret) {
    return NextResponse.json({ error: "Organizer session is not configured." }, { status: 503 });
  }
  if (providedSecret !== organizerSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}
