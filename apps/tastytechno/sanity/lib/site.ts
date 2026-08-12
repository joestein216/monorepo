import { cache } from "react"
import { createClient } from "next-sanity"

export type SiteLink = {
  label: string
  href: string
  openInNewTab?: boolean | null
}

export type SiteImage = {
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

export type SiteSeo = {
  metaTitle?: string | null
  metaDescription?: string | null
  openGraphImage?: SiteImage | null
}

export type SiteLineupArtist = {
  key: string
  name: string
  role?: string | null
  artistSlug?: string | null
}

export type SiteEvent = {
  id: string
  title: string
  chapterLabel?: string | null
  slug: string
  organizer?: string | null
  status: "upcoming" | "tba" | "past" | "cancelled"
  eventDate?: string | null
  startsAt?: string | null
  endsAt?: string | null
  dateDisplay?: string | null
  venue?: string | null
  location?: string | null
  summary: string
  heroImage?: SiteImage | null
  lineup?: SiteLineupArtist[] | null
  eventUrl?: string | null
  showOnHome?: boolean | null
  sortOrder?: number | null
  seo?: SiteSeo | null
}

export type SitePhoto = {
  id: string
  title: string
  image: SiteImage
}

export type PhotoPlacement = {
  key: string
  captionOverride?: string | null
  photo: SitePhoto
}

export type SitePhotoAlbum = {
  id: string
  title: string
  slug: string
  summary: string
  relatedEvent?: { id: string; title: string; slug: string } | null
  coverPhoto?: SitePhoto | null
  photos?: PhotoPlacement[] | null
  showOnHome?: boolean | null
  sortOrder?: number | null
  seo?: SiteSeo | null
}

export type HomePageContent = {
  eyebrow: string
  heading: string
  introduction: string
  featuredEventSlug?: string | null
  featuredAlbumSlug?: string | null
  nextChapterLabel: string
  nextChapterTitle: string
  nextChapterCopy: string
  inquiryEmail: string
  artistBookingEmail?: string | null
  socialLinks: SiteLink[]
  seo?: SiteSeo | null
}

export type SiteSettings = {
  title: string
  description: string
}

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

const siteSettingsQuery = `*[_type == "siteSettings"] | order(_updatedAt desc)[0]{
  siteTitle,
  siteDescription
}`

const homePageQuery = `*[_type == "homePage"] | order(_updatedAt desc)[0]{
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
}`

const eventsQuery = `*[_type == "event" && defined(slug.current)]
  | order(sortOrder asc, coalesce(startsAt, eventDate, "1900-01-01") desc, title asc) ${eventProjection}`
const eventBySlugQuery = `*[_type == "event" && slug.current == $slug][0] ${eventProjection}`
const eventSlugsQuery = `*[_type == "event" && defined(slug.current)].slug.current`

const albumsQuery = `*[_type == "photoAlbum" && defined(slug.current)]
  | order(sortOrder asc, title asc) ${albumProjection}`
const albumBySlugQuery = `*[_type == "photoAlbum" && slug.current == $slug][0] ${albumProjection}`
const albumSlugsQuery = `*[_type == "photoAlbum" && defined(slug.current)].slug.current`

const fallbackImage: SiteImage = {
  alt: "Freaky Frank performing at Tasty Techno Chapter One under purple and blue lighting",
  fallbackSrc: "/artists/freaky-frank/hero.jpg",
  width: 1800,
  height: 2400,
}

const chapterOneFallback: SiteEvent = {
  id: "tasty-techno-chapter-one-fallback",
  title: "A Burlesque Affair: The First Temptation",
  chapterLabel: "Chapter One",
  slug: "tasty-techno-chapter-one",
  organizer: "Tasty Techno",
  status: "past",
  eventDate: "2026-07-17",
  startsAt: "2026-07-17T23:30:00-04:00",
  endsAt: "2026-07-18T04:00:00-04:00",
  dateDisplay: "July 17–18, 2026 · 11:30 p.m.–4:00 a.m.",
  venue: "Starr Bar",
  location: "Brooklyn, New York",
  summary:
    "Tasty Techno’s first chapter brought Foodstampz, resident MrFaust, and headliner and closer Freaky Frank to Starr Bar in Brooklyn.",
  heroImage: fallbackImage,
  lineup: [
    { key: "foodstampz", name: "Foodstampz", role: "Drum & bass" },
    { key: "mrfaust", name: "MrFaust", role: "Resident" },
    {
      key: "freaky-frank",
      name: "Freaky Frank",
      role: "Headliner · closing set",
      artistSlug: "freaky-frank",
    },
  ],
  eventUrl: "https://posh.vip/e/tasty-techno-a-burlesque-affair-the-first-temptation",
  showOnHome: true,
  sortOrder: 10,
  seo: {
    metaTitle: "Tasty Techno Chapter One at Starr Bar",
    metaDescription:
      "Tasty Techno Chapter One brought Foodstampz, MrFaust, and Freaky Frank to Starr Bar in Brooklyn on July 17, 2026.",
  },
}

const chapterOnePhoto: SitePhoto = {
  id: "tasty-techno-chapter-one-photo-fallback",
  title: "Freaky Frank at Tasty Techno Chapter One",
  image: fallbackImage,
}

const chapterOneAlbumFallback: SitePhotoAlbum = {
  id: "tasty-techno-chapter-one-album-fallback",
  title: "Tasty Techno: Chapter One",
  slug: "tasty-techno-chapter-one",
  summary: "A curated visual record of Tasty Techno’s first chapter at Starr Bar in Brooklyn.",
  relatedEvent: {
    id: chapterOneFallback.id,
    title: chapterOneFallback.title,
    slug: chapterOneFallback.slug,
  },
  coverPhoto: chapterOnePhoto,
  photos: [{ key: "chapter-one-photo", photo: chapterOnePhoto }],
  showOnHome: true,
  sortOrder: 10,
  seo: {
    metaTitle: "Tasty Techno Chapter One Photo Album",
    metaDescription: "Photos from Tasty Techno Chapter One at Starr Bar in Brooklyn.",
  },
}

const fallbackHomePage: HomePageContent = {
  eyebrow: "New York",
  heading: "Tasty Techno",
  introduction:
    "Artists, events, music, and underground culture. Explore Chapter One, meet Freaky Frank, and see what comes next.",
  featuredEventSlug: chapterOneFallback.slug,
  featuredAlbumSlug: chapterOneAlbumFallback.slug,
  nextChapterLabel: "Chapter Two",
  nextChapterTitle: "TBD",
  nextChapterCopy: "The next chapter is still unwritten. Reach out to write yourself in.",
  inquiryEmail: "connect@tastytechno.com",
  artistBookingEmail: "freakyfrank@tastytechno.com",
  socialLinks: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/tastytechnoofficial",
      openInNewTab: true,
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/tastytechno",
      openInNewTab: true,
    },
  ],
  seo: {
    metaTitle: "Tasty Techno | Artists, Events & Underground Culture",
    metaDescription:
      "Explore Tasty Techno artists, event archives, galleries, and booking information, featuring Freaky Frank and Chapter One at Starr Bar in Brooklyn.",
  },
}

function createPublishedClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim()
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim()

  if (!projectId || !dataset) return null

  return createClient({
    projectId,
    dataset,
    apiVersion: "2026-08-11",
    perspective: "published",
    useCdn: true,
  })
}

function resolveHomePage(record: Partial<HomePageContent> | null): HomePageContent {
  return {
    ...fallbackHomePage,
    ...record,
    eyebrow: record?.eyebrow?.trim() || fallbackHomePage.eyebrow,
    heading: record?.heading?.trim() || fallbackHomePage.heading,
    introduction: record?.introduction?.trim() || fallbackHomePage.introduction,
    nextChapterLabel: record?.nextChapterLabel?.trim() || fallbackHomePage.nextChapterLabel,
    nextChapterTitle: record?.nextChapterTitle?.trim() || fallbackHomePage.nextChapterTitle,
    nextChapterCopy: record?.nextChapterCopy?.trim() || fallbackHomePage.nextChapterCopy,
    inquiryEmail: record?.inquiryEmail?.trim() || fallbackHomePage.inquiryEmail,
    socialLinks: record?.socialLinks?.length ? record.socialLinks : fallbackHomePage.socialLinks,
  }
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const fallback: SiteSettings = {
    title: "Tasty Techno",
    description: "Tasty Techno artists, events, music, and underground culture.",
  }
  const client = createPublishedClient()
  if (!client) return fallback

  try {
    const record = await client.fetch<{ siteTitle?: string | null; siteDescription?: string | null } | null>(
      siteSettingsQuery,
    )
    return {
      title: record?.siteTitle?.trim() || fallback.title,
      description: record?.siteDescription?.trim() || fallback.description,
    }
  } catch {
    return fallback
  }
})

export const getHomePage = cache(async (): Promise<HomePageContent> => {
  const client = createPublishedClient()
  if (!client) return fallbackHomePage

  try {
    return resolveHomePage(await client.fetch<Partial<HomePageContent> | null>(homePageQuery))
  } catch {
    return fallbackHomePage
  }
})

export const getEvents = cache(async (): Promise<SiteEvent[]> => {
  const client = createPublishedClient()
  if (!client) return [chapterOneFallback]

  try {
    return await client.fetch<SiteEvent[]>(eventsQuery)
  } catch {
    return [chapterOneFallback]
  }
})

export const getEventBySlug = cache(async (slug: string): Promise<SiteEvent | null> => {
  const fallback = slug === chapterOneFallback.slug ? chapterOneFallback : null
  const client = createPublishedClient()
  if (!client) return fallback

  try {
    return await client.fetch<SiteEvent | null>(eventBySlugQuery, { slug })
  } catch {
    return fallback
  }
})

export async function getEventSlugs(): Promise<string[]> {
  const client = createPublishedClient()
  if (!client) return [chapterOneFallback.slug]

  try {
    return await client.fetch<string[]>(eventSlugsQuery)
  } catch {
    return [chapterOneFallback.slug]
  }
}

export const getAlbums = cache(async (): Promise<SitePhotoAlbum[]> => {
  const client = createPublishedClient()
  if (!client) return [chapterOneAlbumFallback]

  try {
    return await client.fetch<SitePhotoAlbum[]>(albumsQuery)
  } catch {
    return [chapterOneAlbumFallback]
  }
})

export const getAlbumBySlug = cache(async (slug: string): Promise<SitePhotoAlbum | null> => {
  const fallback = slug === chapterOneAlbumFallback.slug ? chapterOneAlbumFallback : null
  const client = createPublishedClient()
  if (!client) return fallback

  try {
    return await client.fetch<SitePhotoAlbum | null>(albumBySlugQuery, { slug })
  } catch {
    return fallback
  }
})

export async function getAlbumSlugs(): Promise<string[]> {
  const client = createPublishedClient()
  if (!client) return [chapterOneAlbumFallback.slug]

  try {
    return await client.fetch<string[]>(albumSlugsQuery)
  } catch {
    return [chapterOneAlbumFallback.slug]
  }
}
