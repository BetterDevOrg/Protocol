import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "City Organizers | BetterDev",
  description:
    "Meet the city co-leads and local meetup organizers behind BetterDev.",
};

export default function OrganizersLayout({ children }: { children: ReactNode }) {
  return children;
}