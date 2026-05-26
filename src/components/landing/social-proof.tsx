import Image from "next/image";

const avatars = [
  { img: "https://i.pravatar.cc/96?img=5", large: false },
  { img: "https://i.pravatar.cc/96?img=9", large: false },
  { img: "https://i.pravatar.cc/96?img=16", large: false },
  { img: "https://i.pravatar.cc/96?img=47", large: true },
  { img: "https://i.pravatar.cc/96?img=33", large: false },
  { img: "https://i.pravatar.cc/96?img=12", large: false },
  { img: "https://i.pravatar.cc/96?img=60", large: false },
];

export function SocialProof() {
  return (
    <section id="network" className="scroll-mt-6 relative bg-black py-20 sm:py-28">
      <div className="relative z-[1] mx-auto max-w-[900px] px-5 text-center sm:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-[2.125rem] sm:leading-tight">
          Join early members across cities
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#9CA3AF]">
          The betterdev network is growing. Engineers from top tech hubs are already claiming their IDs and organizing
          local walks.
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

        <div className="mt-14 flex items-center justify-center pl-2">
          <div className="flex items-center -space-x-3 sm:-space-x-4">
            {avatars.map((a, i) => (
              <div key={i} className={`relative ${a.large ? "z-20" : "z-10 opacity-[0.72]"}`}>
                <Image
                  src={a.img}
                  alt=""
                  width={a.large ? 72 : 52}
                  height={a.large ? 72 : 52}
                  className={`rounded-full object-cover ring-2 ring-black ${
                    a.large ? "size-[72px] ring-2 ring-white" : "size-12 sm:size-[52px]"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
