import { useState, type ReactElement } from "react";
import { speciesEmoji } from "../../../lib/format";

interface PetImageProps {
  src: string | null;
  alt: string;
  speciesSlug: string;
  className?: string;
}

/** รูปสัตว์ ถ้าไม่มีรูปหรือโหลดรูปไม่ได้จะแสดงอีโมจิแทน (ไม่ทิ้งช่องว่าง) */
export function PetImage({ src, alt, speciesSlug, className = "" }: PetImageProps): ReactElement {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-linear-to-br from-primary/20 via-accent/20 to-secondary/25 text-6xl ${className}`}
      >
        {speciesEmoji(speciesSlug)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`bg-base-300 object-cover ${className}`}
    />
  );
}
