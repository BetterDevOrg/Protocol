import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Your Profile | BetterDev",
  description:
    "View your BetterDev member profile — your Community ID, reputation, and the meetup passport that tracks your on-chain identity.",
};

export default function ProfileLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
