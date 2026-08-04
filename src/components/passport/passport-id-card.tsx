function CodeBracketsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 18L22 12L16 6M8 6L2 12L8 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export type PassportIdCardProps = {
  communityId: string;
  fullName: string;
  role?: string;
  city?: string;
  joinedLabel?: string;
  reputation: number;
  reputationMax?: number;
  className?: string;
};

export function PassportIdCard({
  communityId,
  fullName,
  role = "BetterDev member",
  city,
  joinedLabel,
  reputation,
  reputationMax = 1000,
  className = "",
}: PassportIdCardProps) {
  const barWidth = Math.min(100, Math.round((reputation / Math.max(reputationMax, 1)) * 100));
  const displayId = communityId || "DEV-????";
  const displayCity = city?.trim() || "—";
  const displayJoined = joinedLabel?.trim() || "—";

  return (
    <div
      className={`community-id-card relative w-full rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Community ID</p>
          <p className="mt-1 font-mono text-3xl font-bold tracking-tight text-white">{displayId}</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-icon-tile text-white shadow-lg">
          <CodeBracketsIcon className="text-white" />
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Member</p>
        <p className="mt-1 text-lg font-semibold text-white">{fullName || "BetterDev member"}</p>
        <p className="text-sm font-medium text-brand-sky">{role}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">City</p>
          <p className="mt-0.5 flex items-center gap-1.5 font-medium text-white">
            <MapPinIcon className="text-brand-sky" />
            {displayCity}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">Joined</p>
          <p className="mt-0.5 font-medium text-white">{displayJoined}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">
          <span>Reputation</span>
          <span className="text-sm font-bold tabular-nums text-white">{reputation}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-rep-bar transition-all duration-700"
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}
