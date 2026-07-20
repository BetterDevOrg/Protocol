"use client";

import { useEffect, useState } from "react";

/** null = still checking session */
export function useMemberAuth(): boolean | null {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => {
        if (!cancelled) setAuthenticated(res.ok);
      })
      .catch(() => {
        if (!cancelled) setAuthenticated(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return authenticated;
}
