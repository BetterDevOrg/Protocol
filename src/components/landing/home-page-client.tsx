"use client";

import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { DesignBadge } from "@/components/landing/design-badge";
import { EventGallery } from "@/components/landing/event-gallery";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingSidebar } from "@/components/landing/sidebar";
import { SocialProof } from "@/components/landing/social-proof";
import { WhyJoin } from "@/components/landing/why-join";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function HomePageClientInner() {
  const [joinOpen, setJoinOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("openJoin") === "1") {
      setJoinOpen(true);
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  const openJoin = () => setJoinOpen(true);

  return (
    <div className="min-h-dvh bg-white">
      <LandingSidebar />

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:hidden">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-zinc-900">b</span>
          <span className="text-[9px] font-medium tracking-[0.35em] text-zinc-500">DEV</span>
        </Link>
        <nav className="flex gap-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          <a href="#process" className="hover:text-zinc-800">
            Process
          </a>
          <a href="#values" className="hover:text-zinc-800">
            Values
          </a>
          <a href="#events" className="hover:text-zinc-800">
            Events
          </a>
          <a href="#network" className="hover:text-zinc-800">
            Network
          </a>
        </nav>
      </header>

      <div className="lg:pl-[72px]">
        <Hero onJoin={openJoin} />
        <EventGallery />
        <HowItWorks />
        <WhyJoin />
        <SocialProof />
        <FinalCta onJoin={openJoin} />
      </div>

      <OnboardingModal open={joinOpen} onClose={() => setJoinOpen(false)} />

      <DesignBadge className="fixed bottom-6 right-5 z-50 hidden sm:flex lg:bottom-8 lg:right-8" />
    </div>
  );
}

export function HomePageClient() {
  return (
    <Suspense fallback={<div className="min-h-dvh animate-pulse bg-white" aria-hidden />}>
      <HomePageClientInner />
    </Suspense>
  );
}
