export const ORGANIZER_SECRET_STORAGE_KEY = "betterdev_organizer_secret";

export function readStoredOrganizerSecret(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(ORGANIZER_SECRET_STORAGE_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function writeStoredOrganizerSecret(secret: string): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = secret.trim();
    if (!trimmed) {
      window.localStorage.removeItem(ORGANIZER_SECRET_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(ORGANIZER_SECRET_STORAGE_KEY, trimmed);
  } catch {
    // ignore quota / privacy mode
  }
}

export function clearStoredOrganizerSecret(): void {
  writeStoredOrganizerSecret("");
}
