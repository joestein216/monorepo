import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim()
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim()
const builder = projectId && dataset ? createImageUrlBuilder({ projectId, dataset }) : null

type SiteImage = {
  _type?: "image"
  asset?: { _type?: "reference"; _ref?: string } | null
  crop?: { top: number; bottom: number; left: number; right: number } | null
  hotspot?: { x: number; y: number; width: number; height: number } | null
  alt: string
  caption?: string | null
  credit?: string | null
  width?: number | null
  height?: number | null
  fallbackSrc?: string | null
}

type ImageUrlOptions = {
  width: number
  height?: number
  quality?: number
}

export function getSiteImageUrl(image: SiteImage, options: ImageUrlOptions): string | '' {
  if (builder && image.asset?._ref) {
    let request = builder
      .image(image as SanityImageSource)
      .width(options.width)
      .quality(options.quality ?? 82)
      .auto("format")

    if (options.height) request = request.height(options.height).fit("crop")

    return request.url()
  }

  return image.fallbackSrc ?? ''
}

export function getSiteImageAspectRatio(image: SiteImage): number | null {
  if (!image.width || !image.height) return null

  const horizontalCrop = (image.crop?.left ?? 0) + (image.crop?.right ?? 0)
  const verticalCrop = (image.crop?.top ?? 0) + (image.crop?.bottom ?? 0)
  const width = image.width * Math.max(0.01, 1 - horizontalCrop)
  const height = image.height * Math.max(0.01, 1 - verticalCrop)

  return width / height
}
