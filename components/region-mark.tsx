"use client";

import { useRef, useState, type PointerEvent } from "react";
import { cropFromDrag, nudgeCrop, type Crop } from "@/lib/crop";
import { Button } from "@/components/ui/button";
import { assetPath } from "@/lib/utils";

export function RegionMark({
  src,
  alt,
  crop,
  onChange,
  accent = "#8e2a1c",
}: {
  src: string;
  alt: string;
  crop: Crop | null;
  onChange: (crop: Crop) => void;
  accent?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  function point(event: PointerEvent<HTMLDivElement>) {
    const box = boxRef.current;
    if (!box) return { x: 0, y: 0 };
    const rect = box.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  }

  return (
    <div className="space-y-3">
      <div
        ref={boxRef}
        className="relative touch-none select-none overflow-hidden bg-[#e7e0d4]"
        onPointerDown={(event) => {
          if (!boxRef.current) return;
          boxRef.current.setPointerCapture(event.pointerId);
          const next = point(event);
          startRef.current = next;
          setDragging(true);
          onChange(cropFromDrag(next.x, next.y, next.x, next.y));
        }}
        onPointerMove={(event) => {
          if (!dragging || !startRef.current) return;
          const next = point(event);
          onChange(cropFromDrag(startRef.current.x, startRef.current.y, next.x, next.y));
        }}
        onPointerUp={(event) => {
          if (startRef.current) {
            const next = point(event);
            onChange(cropFromDrag(startRef.current.x, startRef.current.y, next.x, next.y));
          }
          startRef.current = null;
          setDragging(false);
        }}
      >
        <img src={assetPath(src)} alt={alt} draggable={false} className="block h-auto w-full" />
        {crop ? (
          <div
            className="pointer-events-none absolute border-2"
            style={{
              left: `${crop.x}%`,
              top: `${crop.y}%`,
              width: `${crop.w}%`,
              height: `${crop.h}%`,
              borderColor: accent,
              boxShadow: "0 0 0 1px rgba(255,255,255,0.7) inset",
            }}
          >
            <span className="absolute -left-px -top-px size-2" style={{ background: accent }} />
            <span className="absolute -right-px -top-px size-2" style={{ background: accent }} />
            <span className="absolute -bottom-px -left-px size-2" style={{ background: accent }} />
            <span className="absolute -bottom-px -right-px size-2" style={{ background: accent }} />
          </div>
        ) : null}
      </div>
      <p className="text-sm text-[#3f3a34]">Drag on the picture to draw a box. A short click makes a small box. You can also use the buttons.</p>
      <div className="flex flex-wrap gap-2" aria-label="Move or resize the box">
        <Button type="button" variant="line" size="sm" onClick={() => crop && onChange(nudgeCrop(crop, -2, 0))} disabled={!crop}>
          Left
        </Button>
        <Button type="button" variant="line" size="sm" onClick={() => crop && onChange(nudgeCrop(crop, 2, 0))} disabled={!crop}>
          Right
        </Button>
        <Button type="button" variant="line" size="sm" onClick={() => crop && onChange(nudgeCrop(crop, 0, -2))} disabled={!crop}>
          Up
        </Button>
        <Button type="button" variant="line" size="sm" onClick={() => crop && onChange(nudgeCrop(crop, 0, 2))} disabled={!crop}>
          Down
        </Button>
        <Button type="button" variant="line" size="sm" onClick={() => crop && onChange(nudgeCrop(crop, -1, -1, 2, 2))} disabled={!crop}>
          Larger
        </Button>
        <Button type="button" variant="line" size="sm" onClick={() => crop && onChange(nudgeCrop(crop, 1, 1, -2, -2))} disabled={!crop}>
          Smaller
        </Button>
      </div>
    </div>
  );
}
