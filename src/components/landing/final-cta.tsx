import Link from "next/link";

function CodeBracketsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 18L22 12L16 6M8 6L2 12L8 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type FinalCtaProps = {
  onJoin?: () => void;
};

export function FinalCta({ onJoin }: FinalCtaProps) {
  return (
    <>
      <div className="h-1.5 w-full bg-black" aria-hidden />

      <section className="bg-cta-gradient px-5 py-20 sm:px-8 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight tracking-tight text-white">
            Ready to stop scrolling
            <br />
            and start connecting?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/80">
            Become an early member today and help shape the engineering community in your city.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3">
            {onJoin ? (
              <button
                type="button"
                onClick={onJoin}
                className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-zinc-950 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-black"
              >
                <CodeBracketsIcon className="text-brand-sky" />
                Get Your Community ID
              </button>
            ) : (
              <Link
                href="/join"
                className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-zinc-950 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-black"
              >
                <CodeBracketsIcon className="text-brand-sky" />
                Get Your Community ID
              </Link>
            )}
            <p className="text-sm font-medium text-brand-sky">100% free to join. No spam, ever.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-8 px-5 py-12 sm:flex-row sm:px-8 lg:px-10">
          <div>
            <p className="text-xl font-bold lowercase tracking-tight text-black">betterdev</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.35em] text-brand-purple">Community</p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-[#6B7280]">
            <a href="https://twitter.com" className="transition hover:text-zinc-900">
              Twitter
            </a>
            <a href="https://github.com" className="transition hover:text-zinc-900">
              GitHub
            </a>
            <a href="mailto:hello@betterdev.dev" className="transition hover:text-zinc-900">
              Contact
            </a>
          </nav>
          <p className="text-center text-xs text-[#6B7280] sm:text-right">
            © {new Date().getFullYear()} betterdev community. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
