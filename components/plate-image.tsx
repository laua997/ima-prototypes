"use client";

import { useState } from "react";
import { assetPath, cn } from "@/lib/utils";

export function PlateImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={cn("grid min-h-24 place-items-center bg-[#e7e0d4] px-3 text-center text-xs text-[#3f3a34]", className)}
        role="img"
        aria-label={alt}
      >
        This picture could not be shown
      </div>
    );
  }
  return <img src={assetPath(src)} alt={alt} className={className} onError={() => setFailed(true)} />;
}
