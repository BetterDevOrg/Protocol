import { PartnerIcon } from "@/components/partnership/partner-icon";
import { PARTNERS } from "@/lib/partners";

export function PartnerLogoGrid() {
  return (
    <section aria-labelledby="partners-heading" className="mt-10">
      <h2 id="partners-heading" className="text-lg font-semibold text-white">
        Our partners
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        BetterDev works with organizations that support developers with domains, security, and professional growth.
      </p>

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
        {PARTNERS.map((partner) => (
          <li key={partner.id}>
            <a
              href={partner.href}
              target="_blank"
              rel={partner.sponsored ? "noopener noreferrer sponsored" : "noopener noreferrer"}
              className="group flex h-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/70 px-4 py-6 transition hover:border-brand-sky/40 hover:bg-zinc-900"
              aria-label={`Visit ${partner.name}`}
            >
              <PartnerIcon partner={partner} />
              <span className="mt-3 text-center text-[11px] font-medium tracking-wide text-zinc-500 group-hover:text-zinc-300">
                {partner.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
