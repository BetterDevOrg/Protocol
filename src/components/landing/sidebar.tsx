import Link from "next/link";

const nav = [
  { href: "#process", label: "PROCESS" },
  { href: "#values", label: "VALUES" },
  { href: "#network", label: "NETWORK" },
];

export function LandingSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[72px] shrink-0 flex-col items-center border-r border-zinc-100 bg-white py-6 lg:flex">
      <Link href="/" className="flex flex-col items-center gap-0.5 text-center">
        <span className="text-xl font-bold leading-none tracking-tight text-zinc-900">b</span>
        <span className="text-[9px] font-medium tracking-[0.35em] text-zinc-500">DEV</span>
      </Link>

      <nav className="mt-14 flex flex-1 flex-col items-center justify-center gap-14">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-400 transition-colors hover:text-zinc-700"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-3 pb-2">
        <span
          className="text-[9px] font-medium uppercase tracking-[0.2em] text-zinc-400"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          LOGIN
        </span>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg bg-brand-purple text-white shadow-md transition hover:bg-violet-600"
          aria-label="Log in"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
