/** e.g. "benin meetup 9/26" from event name + ISO date */
export function formatMeetupRole(name: string, dateIso: string): string {
  const trimmed = name.trim();
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    return trimmed.toLowerCase();
  }
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${trimmed.toLowerCase()} ${month}/${day}`;
}

/** Resolve event date from optional explicit field or createdAt fallback */
export function resolveEventDate(event: { eventDate?: string; createdAt: string }): string {
  const explicit = event.eventDate?.trim();
  if (explicit) return explicit;
  return event.createdAt;
}
