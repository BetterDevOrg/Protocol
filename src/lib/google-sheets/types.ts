export type GoogleSheetsMemberPayload = {
  memberNumber: number;
  communityId: string;
  memberDisplay: string;
  joinDate: string;
  inviteSlug: string;
  fullName: string;
  email: string;
  phoneE164: string;
  country: string;
  city: string;
  xUsername: string;
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
