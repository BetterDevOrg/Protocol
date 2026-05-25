"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function JoinPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/?openJoin=1");
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-white">
      <p className="text-sm text-zinc-500">Opening join…</p>
    </main>
  );
}
