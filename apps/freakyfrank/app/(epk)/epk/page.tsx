import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArtistEpk } from "../../components/artists/artist-epk"
import { getArtistBySlug } from "../../../sanity/queries/artists"
import { ArtistQueryResult } from "../../../sanity.types"

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const artist = await getArtistBySlug("freaky-frank")

  if (!artist) {
    return {
      title: "Artist not found | Freaky Frank",
      robots: { index: false, follow: false },
    }
  }

  const title = artist.seo?.metaTitle || `${artist.name} | Freaky Frank`
  const description = artist.seo?.metaDescription || artist.shortBio || undefined
  const socialImage = artist.seo?.openGraphImage || artist.heroImage
  const images = socialImage && socialImage.src
    ? [
      {
        url: String(socialImage.src),
        width: socialImage.width ?? 1200,
        height: socialImage.height ?? 630,
        alt: String(socialImage.alt || ""),
      },
    ]
    : undefined

  return {
    title,
    description,
    alternates: { canonical: `/epk` },
    openGraph: {
      type: "profile",
      title,
      description,
      url: `/epk`,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  }
}

export default async function EpkPage() {
  const artist = await getArtistBySlug("freaky-frank")

  if (!artist) notFound()

  return <ArtistEpk artist={artist as ArtistQueryResult} />
}
