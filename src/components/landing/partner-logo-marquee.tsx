"use client";

import { PartnerIcon } from "@/components/partnership/partner-icon";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { PARTNERS } from "@/lib/partners";
import Link from "next/link";

const TRACK = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS];

export function PartnerLogoMarquee() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="partners" className="scroll-mt-6 border-y border-white/10 bg-zinc-950 py-12 sm:py-14">
      <div className="mx-auto max-w-[900px] px-5 text-center sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-400">Trusted partners</p>
        <Link href="/partnership" className="mt-1 inline-block text-sm text-brand-sky transition hover:text-white">
          Become a partner →
        </Link>
      </div>

      <div className="event-marquee-mask relative mt-8 overflow-hidden">
        <div
          className={`flex items-center gap-10 px-6 sm:gap-14 ${
            reducedMotion ? "flex-wrap justify-center" : "event-marquee-track hover:[animation-play-state:paused]"
          }`}
          style={reducedMotion ? undefined : { animationDuration: "35s" }}
        >
          {TRACK.map((partner, i) => (
            <a
              key={`${partner.id}-${i}`}
              href={partner.href}
              target="_blank"
              rel={partner.sponsored ? "noopener noreferrer sponsored" : "noopener noreferrer"}
              className="group flex h-[6.25rem] w-36 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 backdrop-blur-sm transition hover:border-brand-sky/50 hover:bg-white/10 sm:h-[6.75rem] sm:w-40"
              aria-label={`Visit ${partner.name}`}
            >
              <PartnerIcon partner={partner} />
              <span className="text-center text-[10px] font-medium leading-tight tracking-wide text-zinc-500 transition group-hover:text-zinc-300 sm:text-[11px]">
                {partner.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
