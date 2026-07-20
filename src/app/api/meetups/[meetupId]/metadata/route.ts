import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { getEventFromGoogleSheets } from "@/lib/google-sheets/client";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ meetupId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { meetupId } = await context.params;
  const slug = meetupId.trim().toLowerCase();

  if (isGoogleSheetsConfigured()) {
    const sheetResult = await getEventFromGoogleSheets(slug);
    if (sheetResult.ok) {
      const { name, city } = sheetResult.event;
      return NextResponse.json({
        name: city ? `${name} — ${city}` : name,
        description: "BetterDev community meetup for verified engineering participation.",
        meetupId: slug,
        city,
        protocol: "BetterDev",
        network: "Arbitrum Sepolia",
      });
    }
  }

  return NextResponse.json({
    name: `BetterDev Meetup — ${slug}`,
    description: "BetterDev community meetup for verified engineering participation.",
    meetupId: slug,
    protocol: "BetterDev",
    network: "Arbitrum Sepolia",
  });
}
