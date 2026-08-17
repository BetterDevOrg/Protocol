import Link from "next/link";
import { AccountNavButton } from "@/components/landing/account-nav-button";

const nav = [
  { href: "#events", label: "EVENTS" },
  { href: "#process", label: "PROCESS" },
  { href: "#values", label: "VALUES" },
  { href: "#partners", label: "PARTNERS" },
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

      <AccountNavButton variant="sidebar" />
    </aside>
  );
}
