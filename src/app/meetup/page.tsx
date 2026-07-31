import { MeetupPassportClient } from "@/components/passport/meetup-passport-client";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BetterDev Passport | Attend Meetup",
  description: "Mint your chain-agnostic BetterDev Passport and verify meetup participation on the current deployment.",
};

export default function MeetupPage() {
  return (
    <main className="min-h-dvh bg-black text-white">
      <MeetupPassportClient />
      <footer className="border-t border-white/10 bg-black px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 text-xs text-zinc-600 sm:flex-row">
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="font-black uppercase text-white">betterdev</span>
            <span className="uppercase text-brand-sky">Passport</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/contact" className="transition hover:text-white">
              Contact
            </Link>
            <Link href="/partnership" className="transition hover:text-white">
              Partners
            </Link>
            <Link href="/careers" className="transition hover:text-white">
              Careers
            </Link>
            <Link href="/organizers" className="transition hover:text-white">
              City Organizers
            </Link>
            <a href="#documentation" className="transition hover:text-white">
              Docs
            </a>
          </nav>
          <p>© {new Date().getFullYear()} BetterDev Protocol // Verified Identity</p>
        </div>
      </footer>
    </main>
  );
}
