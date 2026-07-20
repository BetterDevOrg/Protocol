export function getEventMeetupId(): string {
  return (
    process.env.EVENT_MEETUP_ID?.trim() ||
    process.env.NEXT_PUBLIC_EVENT_MEETUP_ID?.trim() ||
    "betterdev-lagos-001"
  );
}

export function getPublicEventMeetupId(): string {
  return process.env.NEXT_PUBLIC_EVENT_MEETUP_ID?.trim() || getEventMeetupId();
}
