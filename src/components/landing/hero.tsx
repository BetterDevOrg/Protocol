import Image from "next/image";
import Link from "next/link";
import { PassportIdCard } from "@/components/passport/passport-id-card";

type HeroProps = {
  onJoin?: () => void;
};

export function Hero({ onJoin }: HeroProps) {
  return (
    <section className="relative isolate min-h-[min(100dvh,900px)] overflow-hidden bg-hero-gradient pb-28 pl-0 pt-0 md:pb-32">
      <div className="grain-overlay" aria-hidden />
      <div className="relative z-[2] mx-auto flex max-w-[1280px] flex-col gap-10 px-5 pb-8 pt-10 sm:px-8 lg:flex-row lg:items-center lg:gap-6 lg:px-10 lg:pt-12 xl:px-14">
        <div className="max-w-xl flex-1 lg:max-w-[540px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 backdrop-blur-md">
            <span className="size-1.5 shrink-0 rounded-full bg-brand-sky" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/95">
              Accepting early members
            </span>
          </div>

          <h1 className="mt-6 text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[1.08] tracking-tight text-white">
            Meet Engineers.
            <br />
            Build{" "}
            <span className="text-gradient-real">Real</span>
            <br />
            Connections.
          </h1>

          <p className="mt-5 max-w-[480px] text-[15px] leading-relaxed text-white/75">
            Join a decentralized network where meaningful relationships start offline. Small curated meetups in your
            city, focused on growth, not networking events.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-3">
              {onJoin ? (
                <button
                  type="button"
                  onClick={onJoin}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-zinc-900 shadow-float transition hover:bg-zinc-50"
                >
                  Join the Community
                  <span className="text-lg font-light" aria-hidden>
                    →
                  </span>
                </button>
              ) : (
                <Link
                  href="/join"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-zinc-900 shadow-float transition hover:bg-zinc-50"
                >
                  Join the Community
                  <span className="text-lg font-light" aria-hidden>
                    →
                  </span>
                </Link>
              )}
            </div>
            <p className="max-w-[220px] text-[13px] leading-snug text-white/45">
              Limited to 100 new members per city. Meetup attendance powers the Passport reputation layer.
            </p>
          </div>
        </div>

        <div className="relative mx-auto mt-4 w-full max-w-[400px] flex-1 lg:mx-0 lg:mt-0 lg:max-w-none lg:flex-1">
          {/* Card stack: inner box matches main card bounds; meetup ~45% width, ~1/3 width past left edge */}
          <div className="relative ml-auto mr-2 w-[min(100%,380px)] pb-16 sm:w-[380px] sm:pb-14">
            <div className="relative w-full">
              <PassportIdCard
                className="relative z-[1]"
                communityId="DEV-0842"
                fullName="Alex Chen"
                role="Frontend Engineer"
                city="Seattle"
                joinedLabel="Oct 2023"
                reputation={750}
                reputationMax={1000}
              />

              {/* Mobile: full bleed inside stack with safe insets; sm+: overlapping pill (~52% width, -left 17%) */}
              <div className="pointer-events-auto absolute left-3 right-3 top-full z-[3] -translate-y-1/2 sm:inset-x-auto sm:left-auto sm:right-auto sm:w-[68%] sm:min-w-[230px] sm:max-w-[285px] sm:-translate-x-0 sm:-left-[28%]">
                <Link
                  href="/meetup"
                  className="meetup-card-float block rounded-xl border border-zinc-100/90 bg-white px-3 py-2 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_-10px_rgba(0,0,0,0.4)] sm:rounded-[1.125rem] sm:px-4 sm:py-2.5"
                >
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="flex shrink-0 -space-x-1.5 sm:-space-x-2">
                      <Image
                        src="https://i.pravatar.cc/64?img=12"
                        alt=""
                        width={32}
                        height={32}
                        className="size-7 rounded-full border-2 border-white object-cover ring-1 ring-zinc-100 sm:size-8"
                      />
                      <Image
                        src="https://i.pravatar.cc/64?img=32"
                        alt=""
                        width={32}
                        height={32}
                        className="size-7 rounded-full border-2 border-white object-cover ring-1 ring-zinc-100 sm:size-8"
                      />
                      <Image
                        src="https://i.pravatar.cc/64?img=45"
                        alt=""
                        width={32}
                        height={32}
                        className="size-7 rounded-full border-2 border-white object-cover ring-1 ring-zinc-100 sm:size-8"
                      />
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate text-[11px] font-bold tracking-tight text-zinc-900 sm:text-xs">
                        Attend Next Meetup
                      </p>
                      <p className="truncate text-[10px] font-semibold text-brand-pink sm:text-[11px]">
                        Tap to verify & claim Passport NFT
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[3] h-[clamp(72px,12vw,120px)] text-white">
        <svg
          className="h-full w-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden
        >
          <path d="M0,65 C240,110 480,35 720,55 C960,75 1080,95 1200,88 C1320,82 1380,70 1440,72 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
}
