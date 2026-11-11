export type Crop = { x: number; y: number; w: number; h: number };

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function clampCrop(crop: Crop): Crop {
  const w = clamp(crop.w, 8, 100);
  const h = clamp(crop.h, 8, 100);
  const x = clamp(crop.x, 0, 100 - w);
  const y = clamp(crop.y, 0, 100 - h);
  return {
    x: round(x),
    y: round(y),
    w: round(w),
    h: round(h),
  };
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}

export function cropFromDrag(x1: number, y1: number, x2: number, y2: number): Crop {
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const w = Math.abs(x2 - x1);
  const h = Math.abs(y2 - y1);
  if (w < 2 && h < 2) {
    return clampCrop({ x: x1 - 16, y: y1 - 16, w: 32, h: 32 });
  }
  return clampCrop({ x, y, w: Math.max(w, 8), h: Math.max(h, 8) });
}

export function nudgeCrop(crop: Crop, dx: number, dy: number, dw = 0, dh = 0): Crop {
  return clampCrop({
    x: crop.x + dx,
    y: crop.y + dy,
    w: crop.w + dw,
    h: crop.h + dh,
  });
}

export function isCrop(value: unknown): value is Crop {
  if (!value || typeof value !== "object") return false;
  const crop = value as Crop;
  return [crop.x, crop.y, crop.w, crop.h].every((n) => typeof n === "number" && Number.isFinite(n));
}
