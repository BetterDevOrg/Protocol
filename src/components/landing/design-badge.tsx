/** Floating sponsor badge — single instance on the landing page. */

function SuperteamMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="20" height="20" rx="5" fill="url(#superteam-badge-grad)" />
      <text
        x="10"
        y="13.5"
        textAnchor="middle"
        fill="white"
        fontSize="8"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
      >
        ST
      </text>
      <defs>
        <linearGradient id="superteam-badge-grad" x1="0" y1="20" x2="20" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00B4D8" />
          <stop offset="0.55" stopColor="#E91E8C" />
          <stop offset="1" stopColor="#6B21A8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DesignBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none flex items-center gap-2 rounded-lg bg-zinc-950/95 px-2.5 py-2 shadow-lg ring-1 ring-white/10 ${className}`}
      role="note"
      aria-label="Proudly Superteam sponsors"
    >
      <SuperteamMark className="size-5 shrink-0" />
      <p className="whitespace-nowrap text-[10px] font-normal leading-normal tracking-normal text-zinc-400">
        Proudly{" "}
        <span className="font-medium tracking-wide text-white">Superteam</span> sponsors
      </p>
    </div>
  );
}
