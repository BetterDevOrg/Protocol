"use client";

import { EARLY_CONTRIBUTORS, githubAvatarUrl } from "@/lib/early-contributors";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const VISIBLE_RADIUS = 3;
const PAUSE_MS = 4000;

function slotStyle(offset: number) {
  const distance = Math.abs(offset);
  const size = distance === 0 ? 72 : distance === 1 ? 52 : distance === 2 ? 44 : 36;
  const opacity = distance === 0 ? 1 : 0.85 - distance * 0.08;
  const zIndex = 20 - distance;
  return { size, opacity, zIndex };
}

export function ContributorCarousel() {
  const reducedMotion = useReducedMotion();
  const count = EARLY_CONTRIBUTORS.length;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion || count < 2) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % count);
    }, PAUSE_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, count]);

  const active = EARLY_CONTRIBUTORS[activeIndex];

  return (
    <div className="mt-14 flex flex-col items-center">
      <div className="flex items-center justify-center pl-2">
        <div className="flex items-center -space-x-3 sm:-space-x-4">
          {Array.from({ length: VISIBLE_RADIUS * 2 + 1 }, (_, i) => {
            const offset = i - VISIBLE_RADIUS;
            const index = (activeIndex + offset + count) % count;
            const contributor = EARLY_CONTRIBUTORS[index];
            const { size, opacity, zIndex } = slotStyle(offset);
            const isCenter = offset === 0;

            return (
              <div
                key={`${contributor.github}-${offset}`}
                className="relative shrink-0 transition-all duration-700 ease-out"
                style={{ zIndex, opacity }}
              >
                <Image
                  src={githubAvatarUrl(contributor.github, 128)}
                  alt={contributor.name}
                  width={size}
                  height={size}
                  className={`rounded-full object-cover ring-2 ring-black transition-all duration-700 ${
                    isCenter ? "ring-white" : ""
                  }`}
                  style={{ width: size, height: size }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="mt-6 min-h-[3.5rem] text-center transition-opacity duration-500"
        aria-live="polite"
      >
        <p className="text-lg font-semibold text-white">{active.name}</p>
        <a
          href={`https://github.com/${active.github}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-sm text-brand-sky transition hover:text-brand-pink hover:underline"
        >
          @{active.github}
        </a>
      </div>

      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
        Our awesome contributors
      </p>
    </div>
  );
}
