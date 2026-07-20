import { clearMemberSessionCookie } from "@/lib/member-session";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearMemberSessionCookie(response);
  return response;
}
