import { getGoogleSheetsConfig } from "@/lib/google-sheets/config";
import type {
  GoogleSheetsCheckinRecordResponse,
  GoogleSheetsCheckinStatusResponse,
  GoogleSheetsEventGetResponse,
  GoogleSheetsEventPostResponse,
  GoogleSheetsGetResponse,
  GoogleSheetsPostResponse,
  GoogleSheetsAuthCodeStoreResponse,
  GoogleSheetsAuthCodeVerifyResponse,
  GoogleSheetsOrganizerApplyResponse,
  GoogleSheetsOrganizerActivateResponse,
  GoogleSheetsOrganizerBySecretResponse,
  GoogleSheetsOrganizerEventCreatedResponse,
  GoogleSheetsOrganizerEventsResponse,
  GoogleSheetsOrganizerGetResponse,
  GoogleSheetsOrganizersListResponse,
  GoogleSheetsMeetupCheckinsResponse,
  GoogleSheetsMeetupRsvpsResponse,
  GoogleSheetsMembersByCityResponse,
  GoogleSheetsMeetupRsvpStoreResponse,
  GoogleSheetsBuilderCirclesGetResponse,
  GoogleSheetsBuilderCirclesStoreResponse,
  GoogleSheetsOrganizerCodeUpdateResponse,
} from "@/lib/google-sheets/types";
function webappUri(extraParams?: Record<string, string>): string {
  const { webappUrl, apiToken } = getGoogleSheetsConfig();
  const url = new URL(webappUrl);
  url.searchParams.set("token", apiToken);
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid response from Google Sheets.");
  }
}

export async function appendMemberToGoogleSheets(body: Record<string, unknown>): Promise<GoogleSheetsPostResponse> {
  const res = await fetch(webappUri(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await parseJsonResponse<GoogleSheetsPostResponse>(res);

  if (!res.ok && !("ok" in data)) {
    return { ok: false, error: "Could not save registration." };
  }

  return data;
}

export async function findMemberByEmailInGoogleSheets(email: string): Promise<GoogleSheetsGetResponse> {
  const res = await fetch(webappUri({ email: email.toLowerCase() }), {
    method: "GET",
    cache: "no-store",
  });

  const data = await parseJsonResponse<GoogleSheetsGetResponse>(res);
  return data;
}

export async function findMemberByCommunityIdInGoogleSheets(
  communityId: string,
): Promise<GoogleSheetsGetResponse> {
  const res = await fetch(
    webappUri({ communityId: communityId.trim().toUpperCase() }),
    { method: "GET", cache: "no-store" },
  );

  return parseJsonResponse(res);
}

export async function getCheckinStatusFromGoogleSheets(
  meetupId: string,
  lookup: { email?: string; communityId?: string },
): Promise<GoogleSheetsCheckinStatusResponse> {
  const params: Record<string, string> = {
    action: "checkinStatus",
    meetupId,
  };
  if (lookup.communityId) {
    params.communityId = lookup.communityId.trim().toUpperCase();
  } else if (lookup.email) {
    params.email = lookup.email.toLowerCase();
  }

  const res = await fetch(webappUri(params), { method: "GET", cache: "no-store" });

  return parseJsonResponse(res);
}

export async function recordCheckinInGoogleSheets(body: {
  meetupId: string;
  communityId: string;
  email?: string;
  wallet?: string;
  attendanceTx: string;
  reputationAwarded: number;
  totalReputation?: number;
}): Promise<GoogleSheetsCheckinRecordResponse> {
  const res = await fetch(webappUri(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "checkin",
      ...body,
      communityId: body.communityId.trim().toUpperCase(),
      email: body.email?.toLowerCase() ?? "",
      wallet: body.wallet ?? "",
      totalReputation: body.totalReputation,
    }),
    cache: "no-store",
  });

  return parseJsonResponse(res);
}

export async function getEventFromGoogleSheets(slug: string): Promise<GoogleSheetsEventGetResponse> {
  const res = await fetch(
    webappUri({
      action: "event",
      slug: slug.trim().toLowerCase(),
    }),
    { method: "GET", cache: "no-store" },
  );

  return parseJsonResponse(res);
}

export async function recordEventInGoogleSheets(body: {
  slug: string;
  name: string;
  city: string;
  metadataUri: string;
  txHash?: string;
  organizerId?: string;
  country?: string;
}): Promise<GoogleSheetsEventPostResponse> {
  const res = await fetch(webappUri(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "event",
      slug: body.slug.trim().toLowerCase(),
      name: body.name.trim(),
      city: body.city.trim(),
      metadataUri: body.metadataUri,
      txHash: body.txHash ?? "",
      organizerId: body.organizerId?.trim().toUpperCase() ?? "",
      country: body.country?.trim() ?? "",
    }),
    cache: "no-store",
  });

  return parseJsonResponse(res);
}

export async function storeAuthCodeInGoogleSheets(body: {
  email: string;
  code: string;
  expiresAt: string;
}): Promise<GoogleSheetsAuthCodeStoreResponse> {
  const res = await fetch(webappUri(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "authCodeStore",
      email: body.email.toLowerCase(),
      code: body.code,
      expiresAt: body.expiresAt,
    }),
    cache: "no-store",
  });

  return parseJsonResponse(res);
}

export async function verifyAuthCodeInGoogleSheets(body: {
  email: string;
  code: string;
}): Promise<GoogleSheetsAuthCodeVerifyResponse> {
  const res = await fetch(webappUri(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "authCodeVerify",
      email: body.email.toLowerCase(),
      code: body.code.trim(),
    }),
    cache: "no-store",
  });

  return parseJsonResponse(res);
}

export async function listOrganizersInGoogleSheets(
  status = "active",
): Promise<GoogleSheetsOrganizersListResponse> {
  const res = await fetch(
    webappUri({
      action: "organizers",
      status,
    }),
    { method: "GET", cache: "no-store" },
  );

  return parseJsonResponse(res);
}

export async function findOrganizerByEmailInGoogleSheets(
  email: string,
): Promise<GoogleSheetsOrganizerGetResponse> {
  const res = await fetch(
    webappUri({
      action: "organizer",
      email: email.toLowerCase(),
    }),
    { method: "GET", cache: "no-store" },
  );

  return parseJsonResponse(res);
}

export async function findOrganizerByOrganizerIdInGoogleSheets(
  organizerId: string,
): Promise<GoogleSheetsOrganizerGetResponse> {
  const res = await fetch(
    webappUri({
      action: "organizer",
      organizerId: organizerId.trim().toUpperCase(),
    }),
    { method: "GET", cache: "no-store" },
  );

  return parseJsonResponse(res);
}

export async function findOrganizerBySecretInGoogleSheets(
  secret: string,
): Promise<GoogleSheetsOrganizerBySecretResponse> {
  const res = await fetch(
    webappUri({
      action: "organizerBySecret",
      secret: secret.trim(),
    }),
    { method: "GET", cache: "no-store" },
  );

  return parseJsonResponse(res);
}

export async function activateOrganizerInGoogleSheets(
  organizerId: string,
): Promise<GoogleSheetsOrganizerActivateResponse> {
  const res = await fetch(webappUri(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "organizerActivate",
      organizerId: organizerId.trim().toUpperCase(),
    }),
    cache: "no-store",
  });

  return parseJsonResponse(res);
}

export async function listOrganizerEventsInGoogleSheets(
  organizerId: string,
): Promise<GoogleSheetsOrganizerEventsResponse> {
  const res = await fetch(
    webappUri({
      action: "organizerEvents",
      organizerId: organizerId.trim().toUpperCase(),
    }),
    { method: "GET", cache: "no-store" },
  );

  return parseJsonResponse(res);
}

export async function applyOrganizerInGoogleSheets(body: {
  email: string;
  communityId: string;
  fullName: string;
  city: string;
  country: string;
  xUsername?: string;
  bio?: string;
}): Promise<GoogleSheetsOrganizerApplyResponse> {
  const res = await fetch(webappUri(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "organizerApply",
      email: body.email.toLowerCase(),
      communityId: body.communityId.trim().toUpperCase(),
      fullName: body.fullName.trim(),
      city: body.city.trim(),
      country: body.country.trim(),
      xUsername: body.xUsername?.trim() ?? "",
      bio: body.bio?.trim() ?? "",
    }),
    cache: "no-store",
  });

  return parseJsonResponse(res);
}

export async function recordOrganizerEventCreatedInGoogleSheets(body: {
  organizerId: string;
  reputationDelta?: number;
  incrementEventsHosted?: boolean;
}): Promise<GoogleSheetsOrganizerEventCreatedResponse> {
  const res = await fetch(webappUri(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "organizerEventCreated",
      organizerId: body.organizerId.trim().toUpperCase(),
      reputationDelta: body.reputationDelta ?? 10,
      incrementEventsHosted: body.incrementEventsHosted !== false,
    }),
    cache: "no-store",
  });

  return parseJsonResponse(res);
}

export async function getMeetupCheckinsFromGoogleSheets(
  meetupId: string,
): Promise<GoogleSheetsMeetupCheckinsResponse> {
  const res = await fetch(
    webappUri({
      action: "meetupCheckins",
      meetupId: meetupId.trim(),
    }),
    { method: "GET", cache: "no-store" },
  );

  return parseJsonResponse(res);
}

export async function getMeetupRsvpsFromGoogleSheets(
  meetupId: string,
): Promise<GoogleSheetsMeetupRsvpsResponse> {
  const res = await fetch(
    webappUri({
      action: "meetupRsvps",
      meetupId: meetupId.trim(),
    }),
    { method: "GET", cache: "no-store" },
  );

  return parseJsonResponse(res);
}

export async function getMembersByCityFromGoogleSheets(
  city: string,
): Promise<GoogleSheetsMembersByCityResponse> {
  const res = await fetch(
    webappUri({
      action: "membersByCity",
      city: city.trim(),
    }),
    { method: "GET", cache: "no-store" },
  );

  return parseJsonResponse(res);
}

export async function storeMeetupRsvpInGoogleSheets(body: {
  meetupId: string;
  communityId: string;
  email: string;
  fullName: string;
  city: string;
  country: string;
  xUsername?: string;
}): Promise<GoogleSheetsMeetupRsvpStoreResponse> {
  const res = await fetch(webappUri(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "meetupRsvp",
      meetupId: body.meetupId.trim().toLowerCase(),
      communityId: body.communityId.trim().toUpperCase(),
      email: body.email.trim().toLowerCase(),
      fullName: body.fullName.trim(),
      city: body.city.trim(),
      country: body.country.trim(),
      xUsername: body.xUsername?.trim() ?? "",
    }),
    cache: "no-store",
  });

  return parseJsonResponse(res);
}

export async function getBuilderCirclesFromGoogleSheets(
  meetupId: string,
): Promise<GoogleSheetsBuilderCirclesGetResponse> {
  const res = await fetch(
    webappUri({
      action: "builderCircles",
      meetupId: meetupId.trim().toLowerCase(),
    }),
    { method: "GET", cache: "no-store" },
  );

  return parseJsonResponse(res);
}

export async function storeBuilderCirclesInGoogleSheets(body: {
  meetupId: string;
  organizerId: string;
  city: string;
  attendeeCount: number;
  groupSize: number;
  vrfSeed: string;
  vrfFulfilled: boolean;
  circles: Array<{ id: string; members: Array<{ communityId: string; fullName: string; city: string; role: string }> }>;
  status?: string;
}): Promise<GoogleSheetsBuilderCirclesStoreResponse> {
  const res = await fetch(webappUri(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "builderCirclesStore",
      meetupId: body.meetupId.trim().toLowerCase(),
      organizerId: body.organizerId.trim().toUpperCase(),
      city: body.city.trim(),
      attendeeCount: body.attendeeCount,
      groupSize: body.groupSize,
      vrfSeed: body.vrfSeed,
      vrfFulfilled: body.vrfFulfilled,
      circles: body.circles,
      status: body.status ?? "assigned",
    }),
    cache: "no-store",
  });

  return parseJsonResponse(res);
}

export async function updateOrganizerCodeInGoogleSheets(body: {
  organizerId: string;
  organizerCode: string;
  vrfSeed: string;
  vrfFulfilled: boolean;
}): Promise<GoogleSheetsOrganizerCodeUpdateResponse> {
  const res = await fetch(webappUri(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "organizerCodeUpdate",
      organizerId: body.organizerId.trim().toUpperCase(),
      organizerCode: body.organizerCode.trim().toUpperCase(),
      vrfSeed: body.vrfSeed,
      vrfFulfilled: body.vrfFulfilled,
    }),
    cache: "no-store",
  });

  return parseJsonResponse(res);
}
