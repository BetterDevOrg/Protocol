import { getGoogleSheetsConfig } from "@/lib/google-sheets/config";
import type { GoogleSheetsGetResponse, GoogleSheetsPostResponse } from "@/lib/google-sheets/types";

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
