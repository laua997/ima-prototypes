"use client";

import { Button } from "@/components/ui/button";
import type { SamplePlate } from "@/lib/samples";

export function Nudge({
  plate,
  onDismiss,
  onBranch,
}: {
  plate: SamplePlate;
  onDismiss: () => void;
  onBranch: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-30 flex justify-center px-4">
      <div className="nudge-glow pointer-events-auto flex max-w-xl flex-wrap items-center gap-x-3 gap-y-2 rounded-full bg-white px-3 py-1.5 text-sm">
        <span className="size-2 shrink-0 rounded-full bg-[#7dae4e]" aria-hidden="true" />
        <p>
          <span className="sr-only">Suggestion. </span>
          Try another picture: <span className="font-grotesk">{plate.title}</span>
        </p>
        <button type="button" className="rounded-full px-2 py-1 hover:bg-black/5" onClick={onDismiss}>
          Not now
        </button>
        <Button type="button" size="sm" onClick={onBranch}>
          Open it
        </Button>
      </div>
    </div>
  );
}
