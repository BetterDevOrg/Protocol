import { BETTERDEV_COUNTRY_META, type BetterDevCountryKey } from "@/lib/constants";
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

export type PhoneValidationResult =
  | { ok: true; phoneE164: string }
  | { ok: false; error: string };

const ISO_TO_BETTERDEV: Record<string, BetterDevCountryKey> = {
  NG: "nigeria",
  RW: "rwanda",
  HK: "hong-kong",
  KE: "kenya",
};

export function isBetterDevCountry(value: string): value is BetterDevCountryKey {
  return value in BETTERDEV_COUNTRY_META;
}

export function countryLabel(country: string): string {
  if (!isBetterDevCountry(country)) return country;
  return BETTERDEV_COUNTRY_META[country].label;
}

export function dialCodeForCountry(country: string): string | null {
  if (!isBetterDevCountry(country)) return null;
  return BETTERDEV_COUNTRY_META[country].dial;
}

/** Parse phone and ensure it belongs to the selected BetterDev country. */
export function validatePhoneForCountry(phone: string, country: string): PhoneValidationResult {
  if (!isBetterDevCountry(country)) {
    return { ok: false, error: "Select your country of residence." };
  }

  const meta = BETTERDEV_COUNTRY_META[country];
  const trimmed = phone.trim();
  if (!trimmed) {
    return { ok: false, error: "Phone number is required." };
  }

  const parsed = parsePhoneNumberFromString(trimmed, meta.iso as CountryCode);
  if (!parsed || !parsed.isValid()) {
    return {
      ok: false,
      error: `Enter a valid ${meta.label} phone number (e.g. ${meta.dial} 801 234 5678).`,
    };
  }

  if (parsed.country !== meta.iso) {
    return {
      ok: false,
      error: `Phone number must be a ${meta.label} number starting with ${meta.dial}.`,
    };
  }

  return { ok: true, phoneE164: parsed.format("E.164") };
}

export function betterDevCountryFromIpIso(iso: string | null | undefined): BetterDevCountryKey | null {
  if (!iso) return null;
  const key = ISO_TO_BETTERDEV[iso.toUpperCase()];
  return key ?? null;
}

export function ipCountryIsoFromHeaders(headers: Headers): string | null {
  const raw =
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-country-code");
  if (!raw) return null;
  const iso = raw.trim().toUpperCase();
  if (!iso || iso === "XX" || iso === "T1") return null;
  return iso;
}

/** Phone + selected country + optional IP country (skipped when IP unknown). */
export function validateRegistration(input: {
  phone: string;
  country: string;
  ipCountryIso?: string | null;
}): PhoneValidationResult {
  const phoneResult = validatePhoneForCountry(input.phone, input.country);
  if (!phoneResult.ok) return phoneResult;

  const ipCountry = betterDevCountryFromIpIso(input.ipCountryIso);
  if (ipCountry && ipCountry !== input.country) {
    return {
      ok: false,
      error: `Your connection appears to be outside ${countryLabel(input.country)}. Select the country where you currently live.`,
    };
  }

  return phoneResult;
}
