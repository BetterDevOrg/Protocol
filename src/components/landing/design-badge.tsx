/** Small “Designed in variant” badge — matches reference placement. */
export function DesignBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none z-20 flex items-center gap-2 rounded-lg bg-zinc-900/95 px-2.5 py-2 text-[10px] leading-tight text-white shadow-lg ring-1 ring-white/10 ${className}`}
      aria-hidden
    >
      <span className="grid grid-cols-2 gap-0.5 opacity-90" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="size-1 rounded-[1px] bg-white/80" />
        ))}
      </span>
      <span className="text-left text-[9px] text-zinc-300">
        Designed in <span className="font-semibold text-white">variant</span>
      </span>
    </div>
  );
}
