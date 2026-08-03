import { ContributorCarousel } from "@/components/landing/contributor-carousel";

export function SocialProof() {
  return (
    <section id="network" className="scroll-mt-6 relative bg-black py-20 sm:py-28">
      <div className="relative z-[1] mx-auto max-w-[900px] px-5 text-center sm:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-[2.125rem] sm:leading-tight">
          Built by early contributors
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#9CA3AF]">
          Engineers shaping BetterDev across cities — open source, meetups, and on-chain coordination.
        </p>

        <div className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-4 sm:gap-5">
          <div className="min-w-[140px] flex-1 rounded-2xl bg-[#18181B] px-6 py-6 sm:min-w-[160px]">
            <p className="text-3xl font-bold text-brand-pink sm:text-4xl">4</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Cities active</p>
          </div>
          <div className="min-w-[140px] flex-1 rounded-2xl bg-[#18181B] px-6 py-6 sm:min-w-[160px]">
            <p className="text-3xl font-bold text-brand-sky sm:text-4xl">700+</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Engineers</p>
          </div>
          <div className="min-w-[140px] flex-1 rounded-2xl bg-[#18181B] px-6 py-6 sm:min-w-[160px]">
            <p className="text-3xl font-bold text-brand-purple sm:text-4xl">12+</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Meetups held</p>
          </div>
        </div>

        <ContributorCarousel />
      </div>
    </section>
  );
}
