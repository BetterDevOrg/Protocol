"use client";

import { useEffect, useState } from "react";

type OrganizerCodePanelProps = {
  organizerId: string;
  organizerSecret?: string;
  canIssue?: boolean;
};

type CodeResponse = {
  organizerCode?: string;
  vrfFulfilled?: boolean;
  pending?: boolean;
  onChainConfigured?: boolean;
  error?: string;
  requestTx?: string;
  links?: {
    contractUrl?: string | null;
    requestTxUrl?: string | null;
  };
};

export function OrganizerCodePanel({
  organizerId,
  organizerSecret = "",
  canIssue = false,
}: OrganizerCodePanelProps) {
  const [data, setData] = useState<CodeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCode = async () => {
    const res = await fetch(`/api/organizers/${encodeURIComponent(organizerId)}/code`, {
      cache: "no-store",
    });
    const json = (await res.json()) as CodeResponse;
    if (!res.ok) throw new Error(json.error ?? "Could not load organizer code.");
    setData(json);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadCode();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load code.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [organizerId]);

  const issueCode = async () => {
    setIssuing(true);
    setError(null);
    try {
      const res = await fetch(`/api/organizers/${encodeURIComponent(organizerId)}/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: organizerSecret }),
      });
      const json = (await res.json()) as CodeResponse;
      if (!res.ok) throw new Error(json.error ?? "Could not issue organizer code.");
      setData(json);
      if (json.pending) {
        window.setTimeout(() => {
          void loadCode().catch(() => undefined);
        }, 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not issue organizer code.");
    } finally {
      setIssuing(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading organizer code…</p>;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Organizer code</p>
      <p className="mt-3 font-mono text-2xl font-black text-brand-sky">
        {data?.organizerCode && data.organizerCode !== "PENDING-VRF" ? data.organizerCode : "Not issued yet"}
      </p>
      {data?.vrfFulfilled ? (
        <p className="mt-2 text-xs text-emerald-300">VRF verified on-chain via Chainlink</p>
      ) : data?.pending ? (
        <p className="mt-2 text-xs text-amber-200">VRF request pending — check again in a minute</p>
      ) : (
        <p className="mt-2 text-xs text-zinc-500">
          {data?.onChainConfigured
            ? "Issue a verifiable code tied to your organizer ID."
            : "VRF contract not configured — using sheet placeholder."}
        </p>
      )}

      {canIssue && data?.onChainConfigured && !data.vrfFulfilled ? (
        <button
          type="button"
          onClick={issueCode}
          disabled={issuing}
          className="mt-4 rounded-xl bg-brand-sash-diag px-4 py-2 text-xs font-black text-white disabled:opacity-60"
        >
          {issuing ? "Requesting VRF…" : data.pending ? "Check VRF status" : "Issue VRF organizer code"}
        </button>
      ) : null}

      {data?.links?.contractUrl ? (
        <a
          href={data.links.contractUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs font-bold text-brand-sky hover:text-white"
        >
          View VRF contract →
        </a>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-xl border border-brand-pink/30 bg-brand-pink/10 p-3 text-xs text-brand-pink">
          {error}
        </p>
      ) : null}
    </div>
  );
}
