import type { ReactNode } from "react";

/** Page-level horizontal padding / width constraint. */
export function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4">{children}</div>;
}
