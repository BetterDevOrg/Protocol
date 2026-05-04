import Link from "next/link";
import { DesignBadge } from "./design-badge";

function IconUsers() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-brand-purple" aria-hidden>
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-brand-teal" aria-hidden>
      <path d="M12 3v3M12 18v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M3 12h3M18 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-brand-purple" aria-hidden>
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 10h.01M12 10h.01M16 10h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-brand-teal" aria-hidden>
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const features = [
  {
    icon: <IconUsers />,
    title: "Small, Curated Groups",
    text: "Meetups are capped at 6–10 people. We algorithmically match you with peers to ensure relevant and engaging conversations.",
  },
  {
    icon: <IconSparkles />,
    title: "Designed for Introverts",
    text: "No standing around awkwardly with a name tag. Structured walking and coffee makes breaking the ice natural and effortless.",
  },
  {
    icon: <IconChat />,
    title: "Real Conversations",
    text: "Escape the noise of Twitter and LinkedIn. Discuss technical challenges, career progression, and side projects in person.",
  },
  {
    icon: <IconShield />,
    title: "Build Reputation",
    text: "Get a unique Community ID. Earn reputation points for attending, organizing, and helping others in your local network.",
  },
];

export function WhyJoin() {
  return (
    <section id="values" className="scroll-mt-6 relative bg-white pb-20 pt-4 sm:pb-24 sm:pt-8">
      <div className="relative z-[1] mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.4fr)] lg:items-start lg:gap-16">
          <div className="max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-purple">Why join us</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-brand-ink sm:text-[2rem]">
              Designed for engineers who hate traditional networking.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#6B7280]">
              We built betterdev to be the antithesis of awkward conferences and noisy online forums. It&apos;s about
              high-signal, low-stress interactions.
            </p>
            <Link
              href="#"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-purple transition hover:text-violet-700"
            >
              Read our community manifesto <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            {features.map((f) => (
              <article
                key={f.title}
                className="rounded-3xl border border-zinc-100 bg-[#F7F9FB] p-8 shadow-sm sm:p-10"
              >
                <div className="mb-5">{f.icon}</div>
                <h3 className="text-lg font-bold text-brand-ink">{f.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#6B7280]">{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <DesignBadge className="absolute bottom-6 right-5 z-20 hidden sm:flex lg:right-8" />
    </section>
  );
}
