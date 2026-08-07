import { resolveMeetupEventName } from "@/lib/meetup-route-metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ meetupId: string }>;
};

export async function generateMetadata({ params }: Pick<LayoutProps, "params">): Promise<Metadata> {
  const { meetupId } = await params;
  const eventName = await resolveMeetupEventName(meetupId);

  return {
    title: eventName ? `RSVP · ${eventName} · BetterDev` : "RSVP · BetterDev",
    description: eventName
      ? `RSVP for ${eventName} — join this BetterDev community meetup.`
      : "RSVP for a BetterDev community meetup.",
  };
}

export default function MeetupIdLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
