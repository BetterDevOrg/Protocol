"use client";

import type { MilestoneBadgeContext, MilestoneBadgeMintStatusMap } from "@/lib/milestone-badges";
import { getEventMeetupId } from "@/lib/event-config";
import { useCallback, useEffect, useState } from "react";

const EMPTY_CONTEXT: MilestoneBadgeContext = {
  reputation: 0,
  passportMinted: false,
  attendanceVerified: false,
};

type UseMilestoneBadgeContextOptions = {
  email?: string;
  communityId?: string;
  meetupId?: string;
  enabled?: boolean;
};

type UseMilestoneBadgeContextResult = {
  context: MilestoneBadgeContext;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateMintedBadge: (badgeId: string, tokenId: number, mintTx?: string) => void;
};

export function useMilestoneBadgeContext(
  options: UseMilestoneBadgeContextOptions = {},
): UseMilestoneBadgeContextResult {
  const {
    email: emailOverride,
    communityId: communityIdOverride,
    meetupId: meetupIdOverride,
    enabled = true,
  } = options;
  const [context, setContext] = useState<MilestoneBadgeContext>(EMPTY_CONTEXT);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      let email = emailOverride?.trim().toLowerCase() ?? "";
      let offChainReputation = 0;
      let communityId = communityIdOverride?.trim().toUpperCase() ?? "";
      const meetupId = meetupIdOverride?.trim().toLowerCase() || getEventMeetupId();

      if (!email) {
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        if (!meRes.ok) {
          setContext(EMPTY_CONTEXT);
          return;
        }
        const meData = (await meRes.json()) as {
          member?: { email?: string; reputation?: number; communityId?: string };
        };
        email = meData.member?.email?.trim().toLowerCase() ?? "";
        offChainReputation = meData.member?.reputation ?? 0;
        if (!communityId) communityId = meData.member?.communityId?.trim().toUpperCase() ?? "";
      }

      if (!email && !communityId) {
        setContext(EMPTY_CONTEXT);
        return;
      }

      const params = new URLSearchParams({ meetupId });
      if (email) params.set("email", email);
      if (communityId) params.set("communityId", communityId);

      const statusRes = await fetch(`/api/badges/mint?${params.toString()}`, { cache: "no-store" });
      const statusData = (await statusRes.json()) as {
        error?: string;
        communityId?: string;
        email?: string;
        meetupId?: string;
        reputation?: number;
        passportMinted?: boolean;
        attendanceVerified?: boolean;
        badges?: Record<string, { minted: boolean; tokenId: number }>;
      };

      if (!statusRes.ok) {
        throw new Error(statusData.error ?? "Could not load milestone progress.");
      }

      const mintedBadges: MilestoneBadgeMintStatusMap = {};
      if (statusData.badges) {
        for (const [badgeId, record] of Object.entries(statusData.badges)) {
          mintedBadges[badgeId] = {
            minted: record.minted,
            tokenId: record.tokenId,
          };
        }
      }

      setContext({
        reputation: statusData.reputation ?? offChainReputation,
        passportMinted: Boolean(statusData.passportMinted),
        attendanceVerified: Boolean(statusData.attendanceVerified),
        communityId: statusData.communityId ?? communityId,
        email: statusData.email ?? email,
        meetupId: statusData.meetupId ?? meetupId,
        mintedBadges,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load milestone progress.");
      setContext(EMPTY_CONTEXT);
    } finally {
      setLoading(false);
    }
  }, [communityIdOverride, emailOverride, enabled, meetupIdOverride]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateMintedBadge = useCallback((badgeId: string, tokenId: number, mintTx?: string) => {
    setContext((prev) => ({
      ...prev,
      passportMinted: badgeId === "betterdev-passport" ? true : prev.passportMinted,
      mintedBadges: {
        ...prev.mintedBadges,
        [badgeId]: { minted: true, tokenId, mintTx },
      },
    }));
  }, []);

  return { context, loading, error, refresh, updateMintedBadge };
}
