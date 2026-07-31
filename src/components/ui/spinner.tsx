type SpinnerSize = "sm" | "md" | "lg";

const SIZES: Record<SpinnerSize, string> = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-10 border-4",
};

/**
 * Accessible loading spinner with a brand-sky accent.
 * Usage: <Spinner /> or <Spinner size="lg" className="mt-10" />
 */
export function Spinner({
  size = "md",
  className = "",
}: {
  size?: SpinnerSize;
  className?: string;
}) {
  return (
    <span role="status" className={className}>
      <span
        aria-hidden="true"
        className={`inline-block animate-spin [animation-duration:0.7s] rounded-full border-white/20 border-t-brand-sky motion-reduce:animate-none motion-reduce:border-t-white/20 ${SIZES[size]}`}
      />
      <span className="sr-only">Loading…</span>
    </span>
  );
}
