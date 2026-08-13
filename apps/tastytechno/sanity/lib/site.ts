import { sanityFetch } from './live';
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
  "height": asset->metadata.dimensions.height
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
  return await sanityFetch({ query: siteSettingsQuery });
}

export const getHomePage = async () => {
  return await sanityFetch({ query: homePageQuery })
}

export const getEvents = async () => {
  return await sanityFetch({ query: eventsQuery })
}

export const getEventBySlug = async (slug: string) => {
  return await sanityFetch({ query: eventBySlugQuery, params: { slug }, })
}

export const getEventSlugs = async () => {
  return await sanityFetch({ query: eventSlugsQuery })
}

export const getAlbums = async () => {
  return await sanityFetch({ query: albumsQuery })
}

export const getAlbumBySlug = async (slug: string) => {
  return await sanityFetch({ query: albumBySlugQuery, params: { slug }, })
}

export const getAlbumSlugs = async () => {
  return await sanityFetch({ query: albumSlugsQuery })
}
