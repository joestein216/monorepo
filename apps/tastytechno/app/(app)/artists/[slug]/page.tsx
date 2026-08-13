import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArtistEpk } from "../../../../components/artists/artist-epk"
import { getArtistBySlug, getArtistSlugs } from "../../../../sanity/lib/artists"

type ArtistPageProps = {
  params: Promise<{ slug: string }>
}

export const revalidate = 300
export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getArtistSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { slug } = await params
  const artist = await getArtistBySlug(slug)

  if (!artist) {
    return {
      title: "Artist not found | Tasty Techno",
      robots: { index: false, follow: false },
    }
  }

  const title = artist.seo?.metaTitle || `${artist.name} | Tasty Techno`
  const description = artist.seo?.metaDescription || artist.shortBio
  const socialImage = artist.seo?.openGraphImage || artist.heroImage
  const images = socialImage
    ? [
        {
          url: socialImage.src,
          width: socialImage.width ?? 1200,
          height: socialImage.height ?? 630,
          alt: socialImage.alt,
        },
      ]
    : undefined

  return {
    title,
    description,
    alternates: { canonical: `/artists/${artist.slug}` },
    openGraph: {
      type: "profile",
      title,
      description,
      url: `/artists/${artist.slug}`,
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

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params
  const artist = await getArtistBySlug(slug)

  if (!artist) notFound()

  return <ArtistEpk artist={artist} />
}
