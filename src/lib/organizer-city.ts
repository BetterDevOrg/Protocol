export function normalizeCity(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeCountry(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function citiesMatch(eventCity: string, organizerCity: string): boolean {
  return normalizeCity(eventCity) === normalizeCity(organizerCity);
}

export function countriesMatch(eventCountry: string, organizerCountry: string): boolean {
  if (!organizerCountry.trim()) return true;
  if (!eventCountry.trim()) return true;
  return normalizeCountry(eventCountry) === normalizeCountry(organizerCountry);
}
