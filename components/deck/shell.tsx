"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResetSample } from "@/components/reset-sample";
import { Button } from "@/components/ui/button";

export function RegistrationMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 2.5v19M2.5 12h19" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function DeckShell({ children, onReset }: { children: ReactNode; onReset: () => void }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#d7d0c3] text-[#1b1a17]">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="no-print flex flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/deck" className="flex items-center gap-3">
          <span className="text-[#1d4e89]">
            <RegistrationMark />
          </span>
          <span>
            <span className="font-baskerville text-xl">prototype</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 font-plex text-sm" aria-label="Steps">
          <Link href="/deck" className="underline-offset-4 hover:underline">
            Choose
          </Link>
          <Link href="/deck/make" className="underline-offset-4 hover:underline">
            Cards
          </Link>
          <Link href="/deck/order" className="underline-offset-4 hover:underline">
            Order
          </Link>
          <Link href="/deck/print" className="underline-offset-4 hover:underline">
            Print
          </Link>
          <Button variant="quiet" size="sm" asChild>
            <Link href="/">Prototypes</Link>
          </Button>
          <ResetSample
            onReset={() => {
              onReset();
              router.push("/deck");
            }}
          />
        </nav>
      </header>
      <p className="no-print px-4 font-plex text-xs text-[#3c3832] md:px-8">
        Sample cards. They print from this browser. Nothing is uploaded.
      </p>
      <main id="content">{children}</main>
    </div>
  );
}

export function DeckOpening() {
  return <p className="px-4 py-16 font-plex md:px-8">Opening…</p>;
}
