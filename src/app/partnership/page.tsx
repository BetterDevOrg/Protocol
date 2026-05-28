import { CONTACT_EMAIL, COMMUNITY_URLS } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Partnership | BetterDev",
  description: "Partner with BetterDev on meetups, campus programs, hackathons, and ecosystem opportunities.",
};

export default function PartnershipPage() {
  return (
    <main className="min-h-dvh bg-zinc-950 text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-16 sm:px-8 lg:px-10">
        <Link href="/" className="text-sm font-semibold text-brand-sky transition hover:text-white">
          Back to BetterDev
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-float sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-brand-pink">Partnership</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Partner with BetterDev to grow engineering communities.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            BetterDev works with communities, universities, ecosystems, companies, and developer organizations to
            support engineering education, local meetups, hackathons, student showcases, and community-led
            opportunities.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {["Meetups and local chapters", "Hackathons and learning programs", "Student showcases and grants"].map(
              (item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 text-sm text-zinc-200">
                  {item}
                </div>
              ),
            )}
          </div>

          <div className="mt-10 rounded-2xl border border-brand-sky/25 bg-brand-sky/10 p-5">
            <h2 className="text-lg font-semibold">Start a partnership conversation</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              Tell us who you are, the community or organization you represent, and the kind of collaboration you want
              to explore.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=BetterDev Partnership`}
                className="rounded-full bg-brand-sash-diag px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Email BetterDev
              </a>
              <a
                href={COMMUNITY_URLS.x}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Reach us on X
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
