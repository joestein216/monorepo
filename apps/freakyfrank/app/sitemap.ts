import type { MetadataRoute } from "next"

import { getArtistSlugs } from "../sanity/queries/artists"
import { getAlbumSlugs, getEventSlugs } from "../sanity/queries/site"

const baseUrl = "https://www.djfreakyfrank.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artistSlugs, eventSlugs, albumSlugs] = await Promise.all([
    getArtistSlugs(),
    getEventSlugs(),
    getAlbumSlugs(),
  ])

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/events`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/albums`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/artists`, changeFrequency: "weekly", priority: 0.8 },
    ...eventSlugs.map((slug) => ({
      url: `${baseUrl}/events/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...albumSlugs.map((slug) => ({
      url: `${baseUrl}/albums/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...artistSlugs.map((slug) => ({
      url: `${baseUrl}/artists/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
