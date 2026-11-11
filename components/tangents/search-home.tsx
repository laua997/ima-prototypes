"use client";

import { TangentsFrame } from "@/components/tangents/frame";
import { SearchBox } from "@/components/tangents/search-box";
import { SidePanel } from "@/components/tangents/side-panel";
import { useTangents } from "@/components/tangents/use-tangents";

export function SearchHome() {
  const { value, reset } = useTangents();
  return (
    <TangentsFrame state={value.startedAt ? value : undefined} onReset={reset}>
      <div className="flex min-h-[calc(100vh-7rem)] flex-col bg-[#fbfaf7] md:flex-row">
        <section className="flex min-w-0 flex-1 flex-col items-center px-4 py-16 md:py-28" aria-label="Search">
          <p className="font-grotesk text-3xl tracking-tight text-[#1c1915]">Search</p>
          <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-[#3f3a34]">
            Sample pages about cloth, shells, and drawings. This is not the live web.
          </p>
          <div className="mt-8 w-full">
            <SearchBox large />
          </div>
        </section>
        <SidePanel />
      </div>
    </TangentsFrame>
  );
}
