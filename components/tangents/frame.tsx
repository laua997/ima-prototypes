"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResetSample } from "@/components/reset-sample";
import { Button } from "@/components/ui/button";
import { initialTangentsState, type TangentsState } from "@/lib/tangents";
import { cn } from "@/lib/utils";

export function PaperGrain() {
  return (
    <svg className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.22] mix-blend-multiply" aria-hidden="true">
      <filter id="tangents-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#tangents-grain)" />
    </svg>
  );
}

export function TangentsFrame({
  state,
  onReset,
  children,
  glow = false,
}: {
  state?: TangentsState;
  onReset: () => void;
  children: ReactNode;
  glow?: boolean;
}) {
  const started = !!state?.startedAt;
  const router = useRouter();
  return (
    <div className="relative min-h-screen bg-[#f3efe6] text-[#1c1915]">
      <PaperGrain />
      {glow ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-16 right-[8%] z-0 h-64 w-80 rounded-full bg-[rgba(156,196,122,0.45)] blur-3xl"
        />
      ) : null}
      <div className="relative z-10 flex min-h-screen flex-col">
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
          Skip to content
        </a>
        <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/tangents" className="font-grotesk text-[22px] leading-none tracking-tight lowercase">
              prototype
            </Link>
            {started ? (
              <nav aria-label="Sample session" className="flex items-center gap-1 rounded-full bg-white/80 p-1 text-sm shadow-sm">
                <Link href="/tangents" className="rounded-full px-3 py-1 hover:bg-[#f3efe6]">
                  Search
                </Link>
                <Link href="/tangents/field" className="rounded-full px-3 py-1 hover:bg-[#f3efe6]">
                  Pictures
                </Link>
                <Link href="/tangents/map" className="rounded-full px-3 py-1 hover:bg-[#f3efe6]">
                  Opened
                </Link>
              </nav>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {started && state ? (
              <p className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm shadow-sm">
                <span
                  className={cn("size-2 rounded-full", state.endedAt ? "bg-[#e2b340]" : "bg-[#6f9a52]")}
                  aria-hidden="true"
                />
                <span className="max-w-40 truncate font-grotesk">{state.sessionName}</span>
                <span className="sr-only">{state.endedAt ? "Session closed" : "Session open"}</span>
              </p>
            ) : null}
            <Button variant="quiet" size="sm" asChild>
              <Link href="/">Prototypes</Link>
            </Button>
            <ResetSample
              onReset={() => {
                onReset();
                router.push("/tangents");
              }}
            />
          </div>
        </header>
        <p className="px-4 pb-2 text-sm leading-snug text-[#3f3a34] md:px-6">
          Sample of a browser side panel. It only tracks these sample searches and pages, not your other tabs.
        </p>
        <main id="content" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export function Opening({ label = "Opening the sample…" }: { label?: string }) {
  return <p className="px-4 py-16 font-grotesk text-sm md:px-6">{label}</p>;
}

export { initialTangentsState };
