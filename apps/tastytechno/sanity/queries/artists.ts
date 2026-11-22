import { sanityFetch } from '../lib/live';
import { serverClient } from '../lib/server-client';
import { defineQuery } from 'next-sanity';

const imageProjection = `{
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

const artistQuery = defineQuery(`*[_type == "artistPage" && slug.current == $slug][0]{
  "id": _id,
  name,
  realName,
  "slug": slug.current,
  positioning,
  tagline,
  location,
  activeSince,
  genres,
  "heroImage": heroImage ${imageProjection},
  "primaryLogo": primaryLogo ${imageProjection},
  "wordmark": wordmark ${imageProjection},
  shortBio,
  "biography": pt::text(biography),
  careerHighlights[]{label, title, description},
  collaborations[]{name, with, description, url},
  audioEmbeds[]{title, provider, sourceUrl, embedUrl, details},
  videos[]{
    title,
    "fileUrl": file.asset->url,
    externalUrl,
    caption,
    "poster": poster ${imageProjection},
    loop
  },
  "gallery": gallery[] ${imageProjection},
  events[]{title, organizer, status, startsAt, endsAt, dateDisplay, venue, location, details, url},
  bookingEmail,
  bookingLabel,
  externalLinks[]{label, href, openInNewTab},
  pressAssets[]{
    label,
    format,
    "url": coalesce(image.asset->url, file.asset->url, externalUrl)
  },
  technicalRider{
    summary,
    preferredSetup,
    boothMonitors,
    mediaFormats,
    "fileUrl": file.asset->url
  },
  showOnArtistIndex,
  sortOrder,
  seo{
    metaTitle,
    metaDescription,
    "openGraphImage": openGraphImage ${imageProjection}
  }
}`)

const artistCardsQuery = defineQuery(`*[
  _type == "artistPage" &&
  defined(slug.current) &&
  showOnArtistIndex != false
] | order(sortOrder asc, name asc){
  name,
  "slug": slug.current,
  positioning,
  shortBio,
  "heroImage": heroImage ${imageProjection},
  showOnArtistIndex,
  sortOrder
}`)

const artistSlugsQuery = defineQuery(`*[_type == "artistPage" && defined(slug.current)].slug.current`)

export const getArtistBySlug = async (slug: string, options: { stega?: false } = {}) => {
  const { data } = await sanityFetch({ query: artistQuery, params: { slug }, ...options })

  return data
}

export const getArtistCards = async () => {
  const { data } = await sanityFetch({ query: artistCardsQuery })

  return data
}

export const getArtistSlugs = async () => {
  return serverClient.fetch(artistSlugsQuery)
}
