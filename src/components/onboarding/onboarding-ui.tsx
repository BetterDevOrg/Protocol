import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/12 bg-zinc-950/80 px-3.5 py-2.5 text-sm text-white shadow-inner outline-none transition placeholder:text-zinc-600 focus:border-brand-sky/50 focus:ring-2 focus:ring-brand-sky/30";

export function OnboardingLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs font-medium tracking-wide text-zinc-400">{children}</span>;
}

export function OnboardingField({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <OnboardingLabel>{label}</OnboardingLabel>
      <input {...props} className={fieldClass} />
    </label>
  );
}

export function OnboardingSelect({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <OnboardingLabel>{label}</OnboardingLabel>
      <select {...props} className={`${fieldClass} cursor-pointer`}>
        {children}
      </select>
    </label>
  );
}

export function OnboardingPrimaryButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`rounded-full bg-brand-sash-diag px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-purple/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    />
  );
}

export function OnboardingSecondaryButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-brand-sky/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    />
  );
}

export function OnboardingGhostButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-md transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    />
  );
}

export function OnboardingLinkButton({
  href,
  children,
  variant = "default",
}: {
  href: string;
  children: ReactNode;
  variant?: "default" | "optional";
}) {
  const base =
    variant === "optional"
      ? "border border-dashed border-white/20 bg-transparent text-zinc-400 hover:border-brand-pink/40 hover:text-zinc-200"
      : "border border-white/12 bg-white/[0.06] text-white hover:border-brand-sky/30 hover:bg-white/[0.1]";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${base}`}
    >
      {children}
    </a>
  );
}

export function OnboardingError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-xl border border-brand-pink/30 bg-brand-pink/10 px-3 py-2 text-sm text-brand-pink" role="alert">
      {message}
    </p>
  );
}
