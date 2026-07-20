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
