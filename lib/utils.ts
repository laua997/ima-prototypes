import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Prefix local public files when the site is served from a subpath, such as GitHub Pages. */
export function assetPath(src: string) {
  if (!src.startsWith("/") || src.startsWith("//")) return src;
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${src}`;
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function hashSeed(id: string) {
  return [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function formatElapsed(ms: number) {
  const safe = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
