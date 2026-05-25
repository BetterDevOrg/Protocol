function IconPin() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-brand-purple" aria-hidden>
      <path
        d="M12 21s-8-4.5-8-11a8 8 0 0 1 16 0c0 6.5-8 11-8 11z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconCube() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-brand-sky" aria-hidden>
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTrend() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-brand-purple" aria-hidden>
      <path
        d="M23 6l-9.5 9.5-5-5L1 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 6h6v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const cards = [
  {
    icon: <IconPin />,
    iconBg: "bg-pink-50",
    title: "Get Matched",
    body: "Sign up and get grouped with 6–10 curated engineers based in your city who share similar interests and career stages.",
  },
  {
    icon: <IconCube />,
    iconBg: "bg-sky-50",
    title: "Walk + Coffee",
    body: "Meet up on a Saturday morning for light exercise, grabbing coffee, and having stress-free, engaging conversations.",
  },
  {
    icon: <IconTrend />,
    iconBg: "bg-purple-50",
    title: "Build & Grow",
    body: "Form lasting relationships, learn from peers, discover opportunities, and increase your community reputation score over time.",
  },
];

export function HowItWorks() {
  return (
    <section id="process" className="scroll-mt-6 relative bg-white pb-20 pt-16 sm:pb-24 sm:pt-20">
      <div className="relative z-[1] mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-purple">The process</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">How betterdev works</h2>
          <p className="mt-4 text-base leading-relaxed text-[#4B5563]">
            We handle the logistics so you can focus on making genuine connections with other engineers in your area.
          </p>
        </header>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {cards.map((card, i) => (
            <article
              key={card.title}
              className="flex flex-col items-center rounded-3xl border border-[#F3F4F6] bg-white px-6 pb-8 pt-8 text-center shadow-card"
            >
              <div className={`flex size-14 items-center justify-center rounded-2xl ${card.iconBg}`}>{card.icon}</div>
              <div className="mt-5 flex size-8 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
                {i + 1}
              </div>
              <h3 className="mt-4 text-lg font-bold text-brand-navy">{card.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#4B5563]">{card.body}</p>
            </article>
          ))}
        </div>
      </div>

    </section>
  );
}
