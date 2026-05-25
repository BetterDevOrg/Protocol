"use client";

import { EVENT_PHOTOS } from "@/lib/event-photos";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

function MarqueeThumb({
  src,
  caption,
  fit = "cover",
}: {
  src: string;
  caption: string;
  fit?: "cover" | "contain";
}) {
  const [resolvedSrc, setResolvedSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[10px] bg-gallery-placeholder">
      {!failed && (
        <Image
          src={resolvedSrc}
          alt=""
          fill
          className={fit === "contain" ? "object-contain" : "object-cover"}
          sizes="192px"
          onError={() => {
            if (resolvedSrc.endsWith(".jpg")) {
              setResolvedSrc(resolvedSrc.replace(/\.jpg$/, ".png"));
            } else {
              setFailed(true);
            }
          }}
        />
      )}
      {failed && (
        <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[10px] font-semibold text-white/80">
          {caption}
        </span>
      )}
    </div>
  );
}

function SlideImage({
  src,
  alt,
  fit = "cover",
  priority,
  active,
}: {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  priority?: boolean;
  active: boolean;
}) {
  const [resolvedSrc, setResolvedSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  const onError = useCallback(() => {
    if (resolvedSrc.endsWith(".jpg")) {
      setResolvedSrc(resolvedSrc.replace(/\.jpg$/, ".png"));
      return;
    }
    setFailed(true);
  }, [resolvedSrc]);

  return (
    <div
      className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out ${
        active ? "z-[2] opacity-100" : "z-[1] opacity-0"
      } ${active && !failed ? "gallery-slide-active" : ""}`}
      aria-hidden={!active}
    >
      {failed ? (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gallery-placeholder p-8 text-center">
          <span className="text-4xl font-bold lowercase tracking-tight text-white/90">betterdev</span>
          <p className="mt-2 text-sm font-medium text-white/70">Add photos to public/images/events/</p>
        </div>
      ) : (
        <Image
          src={resolvedSrc}
          alt={alt}
          fill
          className={fit === "contain" ? "object-contain" : "object-cover"}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 720px"
          priority={priority}
          onError={onError}
        />
      )}
    </div>
  );
}

export function EventGallery() {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const count = EVENT_PHOTOS.length;

  useEffect(() => {
    if (reducedMotion || count < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 5000);
    return () => window.clearInterval(id);
  }, [reducedMotion, count]);

  const go = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <section id="events" className="scroll-mt-20 border-t border-zinc-100 bg-white px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
          <div className="lg:max-w-[340px] lg:shrink-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-pink">From the community</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-brand-ink sm:text-4xl">
              Our last meetup
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-600">
              Walk, coffee, and real conversations — the same energy you see in our banner, in person every month.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-zinc-500">
              <li className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-brand-sky" />
                Light exercise
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-brand-pink" />
                Coffee &amp; conversation
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-brand-purple" />
                Meaningful connections
              </li>
            </ul>
          </div>

          <div className="min-w-0 flex-1">
            <div
              className="relative mx-auto max-w-[720px] -rotate-1 transition-transform duration-500 hover:rotate-0"
              style={{ transformOrigin: "center center" }}
            >
              <div className="rounded-2xl bg-brand-sash-diag p-[3px] shadow-gallery-frame">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(1rem-3px)] bg-brand-navy">
                  {EVENT_PHOTOS.map((photo, i) => (
                    <SlideImage
                      key={photo.src}
                      src={photo.src}
                      alt={photo.alt}
                      fit={photo.fit}
                      active={i === index}
                      priority={i === 0}
                    />
                  ))}
                  <div
                    className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-brand-purpledeep/80 via-transparent to-transparent"
                    aria-hidden
                  />
                  <p className="absolute bottom-0 left-0 right-0 z-[4] px-5 py-4 text-sm font-semibold text-white">
                    {EVENT_PHOTOS[index]?.caption}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              {EVENT_PHOTOS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-8 bg-brand-purple" : "w-2 bg-zinc-300 hover:bg-brand-sky"
                  }`}
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="event-marquee-mask relative mt-14 overflow-hidden">
          <div
            className={`flex gap-4 ${reducedMotion ? "flex-wrap justify-center" : "event-marquee-track"}`}
            aria-hidden={!reducedMotion}
          >
            {[...EVENT_PHOTOS, ...EVENT_PHOTOS].map((photo, i) => (
              <div
                key={`${photo.src}-${i}`}
                className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl bg-brand-sash p-[2px] sm:h-32 sm:w-48"
              >
                <MarqueeThumb src={photo.src} caption={photo.caption} fit={photo.fit} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
