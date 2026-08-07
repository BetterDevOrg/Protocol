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
    title: eventName ? `Builder Circles · ${eventName} · BetterDev` : "Builder Circles · BetterDev",
    description: eventName
      ? `View Builder Circles for ${eventName} — meet engineers in your assigned group.`
      : "View your Builder Circles assignment for this BetterDev meetup.",
  };
}

export default function MeetupCirclesLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
