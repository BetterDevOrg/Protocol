import { formatJoinMonthYear } from "@/lib/format-date";
import { formatMeetupRole, resolveEventDate } from "@/lib/format-meetup-label";
import { isGoogleSheetsConfigured } from "@/lib/google-sheets/config";
import { getEventFromGoogleSheets } from "@/lib/google-sheets/client";
import { encodeCommunityIdForMetadata } from "@/lib/relayer";

export type MeetupPassportContext = {
  meetupId: string;
  meetupName: string;
  meetupCity?: string;
  eventDateIso: string;
  eventLabel: string;
};

export async function resolveMeetupPassportContext(meetupId: string): Promise<MeetupPassportContext> {
  const slug = meetupId.trim().toLowerCase();
  if (isGoogleSheetsConfigured()) {
    const eventResult = await getEventFromGoogleSheets(slug);
    if (eventResult.ok) {
      const eventDateIso = resolveEventDate(eventResult.event);
      return {
        meetupId: slug,
        meetupName: eventResult.event.name,
        meetupCity: eventResult.event.city,
        eventDateIso,
        eventLabel: formatMeetupRole(eventResult.event.name, eventDateIso),
      };
    }
  }

  const fallbackName = slug.replace(/-/g, " ");
  const eventDateIso = new Date().toISOString();
  return {
    meetupId: slug,
    meetupName: fallbackName,
    eventDateIso,
    eventLabel: formatMeetupRole(fallbackName, eventDateIso),
  };
}

export function buildMeetupPassportMetadataUri(
  origin: string,
  meetupId: string,
  communityId: string,
): string {
  const encodedMember = encodeCommunityIdForMetadata(communityId);
  return `${origin}/api/meetups/${encodeURIComponent(meetupId)}/passport-metadata/${encodedMember}`;
}

export function formatMemberJoinedLabel(joinDate?: string): string {
  if (!joinDate?.trim()) return "—";
  return formatJoinMonthYear(joinDate);
}
