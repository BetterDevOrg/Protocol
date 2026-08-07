import { getEventFromGoogleSheets } from "@/lib/google-sheets/client";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";

/** Resolve meetup display name for browser tab titles when Sheets is available. */
export async function resolveMeetupEventName(meetupId: string): Promise<string | null> {
  if (!isGoogleSheetsConfigured()) return null;

  try {
    const result = await getEventFromGoogleSheets(meetupId.trim().toLowerCase());
    if (!result.ok) return null;
    const name = result.event.name?.trim();
    return name || null;
  } catch {
    return null;
  }
}
