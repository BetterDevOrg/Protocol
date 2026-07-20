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
