import { CONTACT_EMAIL, COMMUNITY_URLS } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact | BetterDev",
  description: "Contact BetterDev for partnerships, community support, and contributor questions.",
};

export default function ContactPage() {
  return (
    <main className="min-h-dvh bg-white text-zinc-950">
      <section className="mx-auto flex max-w-4xl flex-col gap-8 px-5 py-16 sm:px-8 lg:px-10">
        <Link href="/" className="text-sm font-semibold text-brand-purple transition hover:text-brand-pink">
          Back to BetterDev
        </Link>

        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-card-lg sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-brand-purple">Contact</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Reach the BetterDev team.</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
            For partnerships, community support, careers, campus chapters, city chapters, or ecosystem collaboration,
            reach out by email or X.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-brand-sky/50 hover:shadow-card"
            >
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-sky">Email</span>
              <p className="mt-3 break-all text-lg font-semibold">{CONTACT_EMAIL}</p>
            </a>
            <a
              href={COMMUNITY_URLS.x}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-brand-pink/50 hover:shadow-card"
            >
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-pink">X</span>
              <p className="mt-3 text-lg font-semibold">@BetterDev_com</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
