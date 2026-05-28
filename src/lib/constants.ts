/** Countries with local WhatsApp groups — extend as BetterDev grows. */
export const BETTERDEV_COUNTRY_META = {
  nigeria: { label: "Nigeria", dial: "+234", iso: "NG" },
  rwanda: { label: "Rwanda", dial: "+250", iso: "RW" },
  "hong-kong": { label: "Hong Kong", dial: "+852", iso: "HK" },
  kenya: { label: "Kenya", dial: "+254", iso: "KE" },
} as const;

export type BetterDevCountryKey = keyof typeof BETTERDEV_COUNTRY_META;

export const BETTERDEV_COUNTRIES = [
  { value: "", label: "Select country" },
  ...(
    Object.entries(BETTERDEV_COUNTRY_META) as [BetterDevCountryKey, (typeof BETTERDEV_COUNTRY_META)[BetterDevCountryKey]][]
  ).map(([value, meta]) => ({ value, label: meta.label })),
] as const;

export const COUNTRY_WHATSAPP_LINKS = {
  nigeria: "https://chat.whatsapp.com/LSfKQQ8h8U2Kr892axKmCZ",
  rwanda: "https://chat.whatsapp.com/IwY4sAuq27L3lW8w42X3dU",
  "hong-kong": "https://chat.whatsapp.com/J8H0baX8t7hHcqww9q8QUO",
  kenya: "https://chat.whatsapp.com/KTEmZ5NV0aeITVbc5OyL7E",
} as const;

export type BetterDevCountry = BetterDevCountryKey | "";

/** External community URLs — replace with real links before launch. */
export const COMMUNITY_URLS = {
  x: "https://x.com/BetterDev_com",
  telegram: "https://t.me/betterdev",
  discord: "https://discord.com/",
  linkedin: "https://www.linkedin.com/company/betterdev",
  /** Generic community hub (Telegram/Discord landing) */
  communityHub: "https://t.me/betterdev",
} as const;

export const CONTACT_EMAIL = "betterdevCommunity.team@gmail.com";
