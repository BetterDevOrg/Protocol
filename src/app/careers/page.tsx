import { CONTACT_EMAIL, COMMUNITY_URLS } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers | BetterDev",
  description: "Join BetterDev as a builder, organizer, city co-lead, campus ambassador, or ecosystem contributor.",
};

const roles = [
  "City Co-Leads",
  "Campus Ambassadors",
  "Community Organizers",
  "Content Contributors",
  "Ecosystem Partners",
  "Product and Engineering Contributors",
];

export default function CareersPage() {
  return (
    <main className="min-h-dvh bg-hero-gradient text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-16 sm:px-8 lg:px-10">
        <Link href="/" className="text-sm font-semibold text-brand-sky transition hover:text-white">
          Back to BetterDev
        </Link>

        <div className="rounded-3xl border border-white/10 bg-zinc-950/75 p-6 shadow-float backdrop-blur sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-brand-sky">Careers</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Help build the BetterDev network from the ground up.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            BetterDev is building a DeSoc-inspired engineering coordination network. We are looking for builders,
            organizers, campus ambassadors, city co-leads, and ecosystem collaborators who want to help create an open,
            community-driven network for engineers.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <div key={role} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm font-semibold">
                {role}
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-brand-pink/30 bg-brand-pink/10 p-5">
            <h2 className="text-lg font-semibold">Interested in contributing?</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            Send your location, role of interest, CV, cover letter, and links that show your work or community experience.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=BetterDev Careers`}
                className="rounded-full bg-brand-sash-diag px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Email BetterDev
              </a>
              <a
                href={COMMUNITY_URLS.x}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Message us on X
              </a>
              <a
                href="https://github.com/BetterDevOrg/protocol/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Browse good first issues →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
