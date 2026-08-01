import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Log in | BetterDev",
  description:
    "Log in to BetterDev with your member email and 6-digit code. Access your Community ID, reputation, and meetup passport.",
};

export default function LoginLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
