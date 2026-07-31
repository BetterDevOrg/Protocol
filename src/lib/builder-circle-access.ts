import { getEventFromGoogleSheets } from "@/lib/google-sheets/client";
import type { OrganizerAuthContext } from "@/lib/organizer-auth";

export type MeetupEventRecord = {
  slug: string;
  name: string;
  city: string;
  country: string;
  organizerId: string;
};

export async function verifyOrganizerMeetupAccess(
  context: OrganizerAuthContext,
  meetupId: string,
): Promise<{ event: MeetupEventRecord } | { error: string; status: number }> {
  const slug = meetupId.trim().toLowerCase();
  const eventResult = await getEventFromGoogleSheets(slug);
  if (!eventResult.ok) {
    return { error: "Meetup event not found.", status: 404 };
  }

  const event = eventResult.event;
  if (context.mode === "legacy_secret") {
    return {
      event: {
        slug: event.slug,
        name: event.name,
        city: event.city,
        country: event.country ?? "",
        organizerId: event.organizerId ?? "",
      },
    };
  }

  const eventOrganizerId = (event.organizerId ?? "").trim().toUpperCase();
  const hostOrganizerId = context.organizer.organizerId.trim().toUpperCase();
  if (eventOrganizerId && eventOrganizerId !== hostOrganizerId) {
    return {
      error: "You can only run Builder Circles for events you hosted.",
      status: 403,
    };
  }

  return {
    event: {
      slug: event.slug,
      name: event.name,
      city: event.city,
      country: event.country ?? context.organizer.country,
      organizerId: hostOrganizerId,
    },
  };
}
