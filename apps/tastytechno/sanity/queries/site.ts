import { sanityFetch } from '../lib/live';
import { client } from '../lib/client';
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

const seoProjection = `{
  metaTitle,
  metaDescription,
  "openGraphImage": openGraphImage ${imageProjection}
}`

const eventProjection = `{
  "id": _id,
  title,
  chapterLabel,
  "slug": slug.current,
  organizer,
  status,
  eventDate,
  startsAt,
  endsAt,
  dateDisplay,
  venue,
  location,
  summary,
  "heroImage": heroImage ${imageProjection},
  lineup[]{"key": _key, name, role, "artistSlug": artist->slug.current},
  eventUrl,
  showOnHome,
  sortOrder,
  "seo": seo ${seoProjection}
}`

const photoProjection = `{
  "id": _id,
  title,
  "image": image ${imageProjection}
}`

const albumProjection = `{
  "id": _id,
  title,
  "slug": slug.current,
  summary,
  "relatedEvent": relatedEvent->{"id": _id, title, "slug": slug.current},
  "coverPhoto": coverPhoto->${photoProjection},
  photos[]{
    "key": _key,
    captionOverride,
    "photo": photo->${photoProjection}
  },
  showOnHome,
  sortOrder,
  "seo": seo ${seoProjection}
}`

// Wrap your GROQ query with defineQuery for TypeScript generation support
const siteSettingsQuery = defineQuery(`*[_type == "siteSettings"] | order(_updatedAt desc)[0]{
  siteTitle,
  siteDescription
}`);

const homePageQuery = defineQuery(`*[_type == "homePage"] | order(_updatedAt desc)[0]{
  eyebrow,
  heading,
  introduction,
  "featuredEventSlug": featuredEvent->slug.current,
  "featuredAlbumSlug": featuredAlbum->slug.current,
  nextChapterLabel,
  nextChapterTitle,
  nextChapterCopy,
  inquiryEmail,
  artistBookingEmail,
  socialLinks[]{label, href, openInNewTab},
  "seo": seo ${seoProjection}
}`);

const eventsQuery = defineQuery(`*[_type == "event" && defined(slug.current)]
  | order(sortOrder asc, coalesce(startsAt, eventDate, "1900-01-01") desc, title asc) ${eventProjection}`);
const eventBySlugQuery = defineQuery(`*[_type == "event" && slug.current == $slug][0] ${eventProjection}`);
const eventSlugsQuery = defineQuery(`*[_type == "event" && defined(slug.current)].slug.current`);

const albumsQuery = defineQuery(`*[_type == "photoAlbum" && defined(slug.current)]
  | order(sortOrder asc, title asc) ${albumProjection}`);
const albumBySlugQuery = defineQuery(`*[_type == "photoAlbum" && slug.current == $slug][0] ${albumProjection}`);
const albumSlugsQuery = defineQuery(`*[_type == "photoAlbum" && defined(slug.current)].slug.current`);

export const getSiteSettings = async () => {
  const { data } = await sanityFetch({ 
    query: siteSettingsQuery 
  });

  return data
}

export const getHomePage = async () => {
  const { data } = await sanityFetch({ 
    query: homePageQuery, 
  })

  return data
}

export const getEvents = async () => {
  const { data } = await sanityFetch({
    query: eventsQuery,
  })

  return data
}

export const getEventBySlug = async (slug: string) => {
  const data = await sanityFetch({ 
    query: eventBySlugQuery, 
    params: { slug }, 
  })

  return data
}

export const getEventSlugs = async () => {
  return client.fetch(eventSlugsQuery)
}

export const getAlbums = async () => {
  const { data } = await sanityFetch({ 
    query: albumsQuery 
  })

  return data
}

export const getAlbumBySlug = async (slug: string) => {
  const { data } = await sanityFetch({ 
    query: albumBySlugQuery, 
    params: { slug },
  })

  return data
}

export const getAlbumSlugs = async () => {
  return client.fetch(albumSlugsQuery)
}

export type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>
export type SiteHomePage = NonNullable<Awaited<ReturnType<typeof getHomePage>>>
export type SiteEvent = NonNullable<Awaited<ReturnType<typeof getEvents>>>[number]
export type SitePhotoAlbum = NonNullable<Awaited<ReturnType<typeof getAlbums>>>[number]
export type SiteLink = NonNullable<SiteHomePage["socialLinks"]>[number]

