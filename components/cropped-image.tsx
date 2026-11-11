import { clampCrop, type Crop } from "@/lib/crop";
import { assetPath, cn } from "@/lib/utils";

export function CroppedImage({
  src,
  alt,
  crop,
  className,
}: {
  src: string;
  alt: string;
  crop: Crop;
  className?: string;
}) {
  const safe = clampCrop(crop);
  return (
    <div className={cn("relative overflow-hidden bg-[#e7e0d4]", className)} style={{ aspectRatio: `${safe.w} / ${safe.h}` }}>
      <img
        src={assetPath(src)}
        alt={alt}
        className="absolute max-w-none"
        style={{
          width: `${10000 / safe.w}%`,
          height: `${10000 / safe.h}%`,
          left: `${(-safe.x * 100) / safe.w}%`,
          top: `${(-safe.y * 100) / safe.h}%`,
        }}
      />
    </div>
  );
}
