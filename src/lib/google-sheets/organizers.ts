import type { GoogleSheetsOrganizerRecord } from "@/lib/google-sheets/types";
import type { Organizer } from "@/types/organizer";

export function googleSheetsOrganizerToOrganizer(record: GoogleSheetsOrganizerRecord): Organizer {
  return {
    createdAt: record.createdAt,
    communityId: record.communityId,
    fullName: record.fullName,
    organizerId: record.organizerId,
    organizerCode: record.organizerCode,
    city: record.city,
    country: record.country,
    status: (record.status as Organizer["status"]) || "pending",
    organizerReputation: record.organizerReputation ?? 0,
    eventsHosted: record.eventsHosted ?? 0,
    xUsername: record.xUsername,
    bio: record.bio,
    approvedAt: record.approvedAt,
    email: record.email,
    codeVrfFulfilled: record.codeVrfFulfilled ?? false,
    codeVrfSeed: record.codeVrfSeed ?? "",
  };
}
