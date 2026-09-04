"use client"

import Image, { type ImageLoaderProps, type ImageProps } from "next/image"
import type { SanityImageSource } from "@sanity/image-url"
import { urlForImage, getSanityImageDimensions } from "../../sanity/lib/image"
import type { SanityImageValue } from "../../sanity/queries/image"

export type SanityImageProps = Omit<ImageProps, "src" | "loader" | "alt" | "width" | "height"> & {
  image?: SanityImageValue | SanityImageSource | null
  alt?: string | null
  width?: number
  height?: number
  aspectRatio?: number
  fallbackSrc?: string
}

export function SanityImage({
  image,
  alt = "",
  width,
  height,
  fill,
  aspectRatio,
  quality = 75,
  className,
  priority,
  sizes,
  placeholder,
  blurDataURL,
  fallbackSrc,
  ...props
}: SanityImageProps) {
  if (!image) return null

  const imageObj = image as SanityImageValue
  const dimensions =
    imageObj?.asset?.metadata?.dimensions ?? getSanityImageDimensions(image)
  const lqip = blurDataURL ?? imageObj?.lqip ?? imageObj?.asset?.metadata?.lqip
  const resolvedAlt = alt || imageObj?.alt || ""

  // Custom loader that lets Sanity's Edge CDN generate responsive sizes for Next.js
  const sanityLoader = ({ width: requestedWidth, quality: requestedQuality }: ImageLoaderProps) => {
    const builder = urlForImage(image as SanityImageSource)
    if (!builder) {
      return imageObj?.fallbackSrc || imageObj?.src || fallbackSrc || ""
    }

    const resolvedQuality = requestedQuality ?? (quality ? Number(quality) : 75)
    let request = builder
      .width(requestedWidth)
      .quality(resolvedQuality)
      .auto("format")

    if (aspectRatio && !fill) {
      request = request.height(Math.round(requestedWidth / aspectRatio)).fit("crop")
    }

    return request.url()
  }

  const parsedWidth = width !== undefined ? Number(width) : dimensions?.width
  const parsedHeight = height !== undefined ? Number(height) : dimensions?.height

  // Calculate default width / height to prevent layout shift if fill is false
  const calculatedWidth = fill ? undefined : parsedWidth
  const calculatedHeight = fill
    ? undefined
    : (parsedHeight ??
      (aspectRatio && parsedWidth
        ? Math.round(parsedWidth / aspectRatio)
        : undefined))

  // If no dimensions can be resolved and not fill mode, fallback to default dimensions
  const finalWidth = !fill && !calculatedWidth ? 800 : calculatedWidth
  const finalHeight =
    !fill && !calculatedHeight
      ? (aspectRatio && finalWidth ? Math.round(Number(finalWidth) / aspectRatio) : 600)
      : calculatedHeight

  const hasBlur = Boolean(lqip) && placeholder !== "empty"

  return (
    <Image
      loader={sanityLoader}
      src={imageObj?.src || "sanity-asset"}
      alt={resolvedAlt}
      fill={fill}
      width={fill ? undefined : finalWidth}
      height={fill ? undefined : finalHeight}
      sizes={sizes || (fill ? "100vw" : undefined)}
      quality={quality}
      priority={priority}
      placeholder={hasBlur ? "blur" : (placeholder || "empty")}
      blurDataURL={hasBlur ? lqip! : undefined}
      className={className}
      {...props}
    />
  )
}
