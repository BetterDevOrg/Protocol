import type { ReactNode } from "react";

/** Max-width section wrapper with vertical rhythm. */
export function Section({ children }: { children: ReactNode }) {
  return <section className="mx-auto w-full max-w-6xl px-4">{children}</section>;
}
