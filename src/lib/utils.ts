/** Class name merge helper — extend with clsx/tailwind-merge if desired. */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
