export type GoogleSheetsMemberPayload = {
  memberNumber: number;
  communityId: string;
  memberDisplay: string;
  joinDate: string;
  inviteSlug: string;
  referredByInviteSlug?: string;
  fullName: string;
  email: string;
  phoneE164: string;
  country: string;
  city: string;
  xUsername: string;
  reputation?: number;
  xProfileLink?: string;
  followedX: boolean;
  joinedCommunity: boolean;
};

export type GoogleSheetsPostResponse =
  | { ok: true; member: GoogleSheetsMemberPayload }
  | { ok: false; error: string };

export type GoogleSheetsGetResponse =
  | { ok: true; member: GoogleSheetsMemberPayload }
  | { ok: false; error: string };

export type GoogleSheetsCheckinStatusResponse =
  | {
      ok: true;
      checkedIn: false;
    }
  | {
      ok: true;
      checkedIn: true;
      attendanceTx: string;
      communityId: string;
      reputationAwarded: number;
    }
  | { ok: false; error: string };

export type GoogleSheetsCheckinRecordResponse =
  | { ok: true; alreadyRecorded: boolean; attendanceTx?: string }
  | { ok: false; error: string };

export type GoogleSheetsEventRecord = {
  createdAt: string;
  slug: string;
  name: string;
  city: string;
  metadataUri: string;
  txHash: string;
  organizerId?: string;
  country?: string;
  /** Optional ISO date for meetup passport label (falls back to createdAt) */
  eventDate?: string;
};

export type GoogleSheetsEventGetResponse =
  | { ok: true; event: GoogleSheetsEventRecord }
  | { ok: false; error: string };

export type GoogleSheetsEventPostResponse =
  | { ok: true; created: boolean; event: GoogleSheetsEventRecord }
  | { ok: false; error: string };

export type GoogleSheetsAuthCodeStoreResponse =
  | { ok: true; stored: boolean }
  | { ok: false; error: string };

export type GoogleSheetsAuthCodeVerifyResponse =
  | { ok: true; valid: boolean }
  | { ok: false; error: string };

export type GoogleSheetsOrganizerRecord = {
  createdAt: string;
  communityId: string;
  fullName: string;
  organizerId: string;
  organizerCode: string;
  city: string;
  country: string;
  status: string;
  organizerReputation: number;
  eventsHosted: number;
  xUsername: string;
  bio: string;
  approvedAt: string;
  email?: string;
  codeVrfFulfilled?: boolean;
  codeVrfSeed?: string;
};

export type GoogleSheetsOrganizerActivateResponse =
  | { ok: true; organizer: GoogleSheetsOrganizerRecord; organizerSecret: string }
  | { ok: false; error: string };

export type GoogleSheetsOrganizerBySecretResponse =
  | { ok: true; organizer: GoogleSheetsOrganizerRecord }
  | { ok: false; error: string };

export type GoogleSheetsOrganizersListResponse =
  | { ok: true; organizers: GoogleSheetsOrganizerRecord[] }
  | { ok: false; error: string };

export type GoogleSheetsOrganizerGetResponse =
  | { ok: true; organizer: GoogleSheetsOrganizerRecord }
  | { ok: false; error: string };

export type GoogleSheetsOrganizerApplyResponse =
  | { ok: true; created: boolean; organizer: GoogleSheetsOrganizerRecord }
  | { ok: false; error: string };

export type GoogleSheetsOrganizerCodeUpdateResponse =
  | { ok: true; organizer: GoogleSheetsOrganizerRecord }
  | { ok: false; error: string };

export type GoogleSheetsOrganizerEventCreatedResponse =
  | { ok: true; eventsHosted: number; organizerReputation: number }
  | { ok: false; error: string };

export type GoogleSheetsOrganizerEventsResponse =
  | { ok: true; events: GoogleSheetsEventRecord[] }
  | { ok: false; error: string };

export type GoogleSheetsMeetupCheckinRecord = {
  createdAt: string;
  meetupId: string;
  communityId: string;
  email: string;
  fullName: string;
  city: string;
  country: string;
  xUsername: string;
};

export type GoogleSheetsMeetupCheckinsResponse =
  | { ok: true; checkins: GoogleSheetsMeetupCheckinRecord[] }
  | { ok: false; error: string };

export type GoogleSheetsMeetupRsvpRecord = GoogleSheetsMeetupCheckinRecord;

export type GoogleSheetsMeetupRsvpsResponse =
  | { ok: true; rsvps: GoogleSheetsMeetupRsvpRecord[] }
  | { ok: false; error: string };

export type GoogleSheetsMembersByCityResponse =
  | { ok: true; members: GoogleSheetsMeetupCheckinRecord[] }
  | { ok: false; error: string };

export type GoogleSheetsMeetupRsvpStoreResponse =
  | { ok: true; alreadyRecorded: boolean; rsvp: GoogleSheetsMeetupRsvpRecord }
  | { ok: false; error: string };

export type GoogleSheetsBuilderCircleMemberRecord = {
  communityId: string;
  fullName: string;
  city: string;
  role: string;
};

export type GoogleSheetsBuilderCircleRecord = {
  id: string;
  members: GoogleSheetsBuilderCircleMemberRecord[];
};

export type GoogleSheetsBuilderCircleAssignmentRecord = {
  createdAt: string;
  meetupId: string;
  organizerId: string;
  city: string;
  attendeeCount: number;
  groupSize: number;
  vrfSeed: string;
  vrfFulfilled: boolean;
  circles: GoogleSheetsBuilderCircleRecord[];
  status: string;
};

export type GoogleSheetsBuilderCirclesGetResponse =
  | { ok: true; assignment: GoogleSheetsBuilderCircleAssignmentRecord }
  | { ok: false; error: string };

export type GoogleSheetsBuilderCirclesStoreResponse =
  | { ok: true; created: boolean; assignment: GoogleSheetsBuilderCircleAssignmentRecord }
  | { ok: false; error: string };
