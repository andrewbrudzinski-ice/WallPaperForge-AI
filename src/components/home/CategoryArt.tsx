import type { WallpaperCategory } from "@/types";
import { motifDataUrl } from "@/lib/generation/motif-svg";

/**
 * Category thumbnail. Renders the shared motif SVG (the same generator the mock
 * provider uses for actual wallpapers) as a data-URL image, so browse cards and
 * generated results look like the same art system. Deterministic per category.
 */
export function CategoryArt({
  category,
  className,
}: {
  category: WallpaperCategory;
  className?: string;
}) {
  const src = motifDataUrl({ category, width: 200, height: 250, seed: category });
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      className={className}
      style={{ objectFit: "cover" }}
    />
  );
}
