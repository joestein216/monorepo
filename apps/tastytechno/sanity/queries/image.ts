import type { SanityImageSource } from "@sanity/image-url"
import {
  urlForImage,
  getOpenGraphImageUrl,
  getSanityImageDimensions,
} from "../lib/image"

export { urlForImage, getOpenGraphImageUrl, getSanityImageDimensions }

export type SanityImageCrop = {
  top?: number
  bottom?: number
  left?: number
  right?: number
}

export type SanityImageHotspot = {
  x?: number
  y?: number
  width?: number
  height?: number
}

export type SanityImageAsset = {
  _type?: "reference"
  _ref?: string
  _id?: string
  url?: string
  metadata?: {
    lqip?: string
    dimensions?: {
      width: number
      height: number
      aspectRatio: number
    }
  }
}

export type SanityImageValue = {
  _type?: "image"
  asset?: SanityImageAsset | null
  crop?: SanityImageCrop | null
  hotspot?: SanityImageHotspot | null
  alt?: string | null
  caption?: string | null
  credit?: string | null
  width?: number | null
  height?: number | null
  lqip?: string | null
  src?: string | null
  fallbackSrc?: string | null
}

export type SiteImage = SanityImageValue

export const imageProjection = `{
  _type,
  asset,
  crop,
  hotspot,
  alt,
  caption,
  credit,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip,
  "src": asset->url
}`

export type ImageUrlOptions = {
  width: number
  height?: number
  quality?: number
}

export function getSiteImageUrl(image: SanityImageValue | null | undefined, options: ImageUrlOptions): string {
  if (!image) return ""
  const builder = urlForImage(image as SanityImageSource)
  if (builder && (image.asset?._ref || image.asset?._id)) {
    let request = builder
      .width(options.width)
      .quality(options.quality ?? 82)
      .auto("format")

    if (options.height) request = request.height(options.height).fit("crop")

    return request.url()
  }

  return image.fallbackSrc ?? image.src ?? ""
}

export function getSiteImageAspectRatio(image: SanityImageValue | null | undefined): number | null {
  if (!image) return null
  const dims = getSanityImageDimensions(image)
  if (!dims) return null

  const horizontalCrop = (image.crop?.left ?? 0) + (image.crop?.right ?? 0)
  const verticalCrop = (image.crop?.top ?? 0) + (image.crop?.bottom ?? 0)
  const width = dims.width * Math.max(0.01, 1 - horizontalCrop)
  const height = dims.height * Math.max(0.01, 1 - verticalCrop)

  return width / height
}
