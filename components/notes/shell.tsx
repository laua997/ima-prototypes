"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResetSample } from "@/components/reset-sample";
import { Button } from "@/components/ui/button";

export function NotesShell({ children, onReset }: { children: ReactNode; onReset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#efe6d8] text-[#1a120e]">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1a120e]/15 px-4 py-4 md:px-8">
        <div>
          <Link href="/notes" className="font-fraunces text-2xl italic">
            prototype
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-outfit">
          <Button variant="quiet" size="sm" asChild>
            <Link href="/">Prototypes</Link>
          </Button>
          <ResetSample
            onReset={() => {
              onReset();
              router.push("/notes");
            }}
          />
        </div>
      </header>
      <p className="px-4 py-2 font-outfit text-xs tracking-wide text-[#5c463c] md:px-8">
        Saved in this browser only. Nothing is uploaded.
      </p>
      <main id="content">{children}</main>
    </div>
  );
}

export function NotesOpening() {
  return <p className="px-4 py-16 font-outfit md:px-8">Opening…</p>;
}
