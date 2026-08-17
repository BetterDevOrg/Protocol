import type { Partner } from "@/lib/partners";
import Image from "next/image";

type PartnerIconProps = {
  partner: Partner;
};

export function PartnerIcon({ partner }: PartnerIconProps) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
      <Image
        src={partner.logoSrc}
        alt=""
        width={56}
        height={56}
        className={`max-h-full max-w-full object-contain transition group-hover:scale-105 ${partner.logoClassName ?? ""}`}
      />
    </div>
  );
}
