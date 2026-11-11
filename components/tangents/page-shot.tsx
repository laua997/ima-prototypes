"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { clampCrop, type Crop } from "@/lib/crop";

function rectBetween(a: { x: number; y: number }, b: { x: number; y: number }): Crop {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(b.x - a.x),
    h: Math.abs(b.y - a.y),
  };
}

export function PageShot({ onPick, onCancel }: { onPick: (crop: Crop) => void; onCancel: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [box, setBox] = useState<Crop | null>(null);

  function point(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
    return {
      x: Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100)),
    };
  }

  return (
    <div className="absolute inset-0 z-10">
      <div
        id="shot-stage"
        ref={ref}
        className="relative h-full w-full touch-none overflow-hidden"
        onPointerDown={(event) => {
          event.preventDefault();
          ref.current?.setPointerCapture(event.pointerId);
          const next = point(event);
          start.current = next;
          setBox({ x: next.x, y: next.y, w: 0, h: 0 });
        }}
        onPointerMove={(event) => {
          if (!start.current) return;
          setBox(rectBetween(start.current, point(event)));
        }}
        onPointerUp={(event) => {
          if (!start.current) return;
          const next = rectBetween(start.current, point(event));
          start.current = null;
          setBox(null);
          if (next.w >= 4 && next.h >= 4) onPick(clampCrop(next));
        }}
      >
        {box && box.w > 0.5 && box.h > 0.5 ? (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 bg-[#14100c]/60" style={{ height: `${box.y}%` }} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[#14100c]/60" style={{ height: `${Math.max(0, 100 - box.y - box.h)}%` }} />
            <div className="pointer-events-none absolute bg-[#14100c]/60" style={{ top: `${box.y}%`, height: `${box.h}%`, left: 0, width: `${box.x}%` }} />
            <div className="pointer-events-none absolute bg-[#14100c]/60" style={{ top: `${box.y}%`, height: `${box.h}%`, right: 0, width: `${Math.max(0, 100 - box.x - box.w)}%` }} />
            <div className="pointer-events-none absolute border-2 border-white" style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }} />
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-[#14100c]/25" />
        )}
      </div>
      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
        <p className="rounded-full bg-[#f7f1e8] px-3 py-2 text-sm">Drag across the part you want.</p>
        <button type="button" className="rounded-full bg-white px-3 py-2 text-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
