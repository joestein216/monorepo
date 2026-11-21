import Image from "next/image";
import { urlForImage } from "../../sanity/lib/image";
import type { SiteImage as ImageData } from "./types";

export function SiteImage({
  image,
  priority = false,
  slot = "image",
  decorative = false,
}: {
  image: ImageData | null | undefined;
  priority?: boolean;
  slot?: string;
  decorative?: boolean;
}) {
  if (!image?.asset) return null;
  const src = urlForImage(image)?.width(1800).url();
  if (!src) return null;
  return (
    <Image
      data-slot={slot}
      src={src}
      alt={decorative ? "" : image.alt || ""}
      width={image.width || 1200}
      height={image.height || 800}
      sizes="(max-width: 48rem) 100vw, 80vw"
      priority={priority}
    />
  );
}
