import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url"
import { dataset, projectId } from "../env"

export const imageBuilder = projectId && dataset
  ? createImageUrlBuilder({ projectId, dataset })
  : null

export function urlForImage(source: SanityImageSource) {
  if (!imageBuilder) return null
  return imageBuilder.image(source).auto("format")
}

export function getOpenGraphImageUrl(
  source: SanityImageSource | null | undefined,
  options?: { width?: number; height?: number; quality?: number }
): string | null {
  if (!source) return null
  const builder = urlForImage(source)
  if (!builder) return null

  return builder
    .width(options?.width ?? 1200)
    .height(options?.height ?? 630)
    .quality(options?.quality ?? 85)
    .fit("crop")
    .url()
}

/**
 * Extracts dimensions and aspect ratio from Sanity image asset reference ID
 * (e.g. "image-75a7c20c42289f664a7812f866415bf3c39ebc57-1920x1080-jpg")
 * or fallback properties.
 */
export function getSanityImageDimensions(
  image: unknown
): {
  width: number
  height: number
  aspectRatio: number
} | null {
  if (!image) return null

  let ref: string | null = null

  if (typeof image === "string") {
    ref = image
  } else if (typeof image === "object") {
    const record = image as Record<string, unknown>
    if (typeof record._ref === "string") {
      ref = record._ref
    } else if (typeof record._id === "string") {
      ref = record._id
    } else if (record.asset && typeof record.asset === "object") {
      const asset = record.asset as Record<string, unknown>
      if (typeof asset._ref === "string") {
        ref = asset._ref
      } else if (typeof asset._id === "string") {
        ref = asset._id
      }
    }

    if (
      !ref &&
      typeof record.width === "number" &&
      typeof record.height === "number" &&
      record.width > 0 &&
      record.height > 0
    ) {
      return {
        width: record.width,
        height: record.height,
        aspectRatio: record.width / record.height,
      }
    }
  }

  if (ref) {
    const parts = ref.split("-")
    if (parts.length >= 3) {
      const dimensions = parts[2]
      const [widthStr, heightStr] = dimensions.split("x")
      const width = Number(widthStr)
      const height = Number(heightStr)
      if (width && height) {
        return {
          width,
          height,
          aspectRatio: width / height,
        }
      }
    }
  }

  return null
}
