/** Floating badge — Chainlink VRF attribution on the landing page. */

function ChainlinkMark({ className = "" }: { className?: string }) {
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
      <path d="M10 2L16.5 6v8L10 18 3.5 14V6L10 2z" fill="#375BD2" />
      <path
        d="M10 5.5L13.5 8v4L10 14.5 6.5 12V8L10 5.5z"
        fill="white"
        fillOpacity="0.9"
      />
    </svg>
  );
}

export function DesignBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none flex items-center gap-2 rounded-lg bg-zinc-950/95 px-2.5 py-2 shadow-lg ring-1 ring-white/10 ${className}`}
      role="note"
      aria-label="Powered by Chainlink VRF"
    >
      <ChainlinkMark className="size-5 shrink-0" />
      <p className="whitespace-nowrap text-[10px] font-normal leading-normal tracking-normal text-zinc-400">
        Powered by{" "}
        <span className="font-medium tracking-wide text-white">Chainlink VRF</span>
      </p>
    </div>
  );
}
