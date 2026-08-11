import { cache } from "react"
import { createClient } from "next-sanity"

export type ArtistImage = {
  src: string
  alt: string
  caption?: string | null
  credit?: string | null
  width?: number | null
  height?: number | null
}

export type ArtistLink = {
  label: string
  href: string
  openInNewTab?: boolean | null
}

export type ArtistAudio = {
  title: string
  provider: string
  sourceUrl?: string | null
  embedUrl: string
  details?: string | null
}

export type ArtistVideo = {
  title: string
  fileUrl?: string | null
  externalUrl?: string | null
  caption?: string | null
  poster?: ArtistImage | null
}

export type ArtistEvent = {
  title: string
  status?: "confirmed" | "pending" | "past" | "cancelled" | null
  startsAt?: string | null
  endsAt?: string | null
  dateDisplay?: string | null
  venue?: string | null
  location?: string | null
  details?: string | null
  url?: string | null
}

export type ArtistPressAsset = {
  label: string
  format?: string | null
  url?: string | null
}

export type ArtistTechnicalRider = {
  summary?: string | null
  preferredSetup?: string[] | null
  boothMonitors?: string | null
  mediaFormats?: string[] | null
  fileUrl?: string | null
}

export type ArtistEpk = {
  id: string
  name: string
  realName?: string | null
  slug: string
  positioning?: string | null
  tagline?: string | null
  location?: string | null
  activeSince?: string | null
  genres?: string[] | null
  heroImage?: ArtistImage | null
  primaryLogo?: ArtistImage | null
  wordmark?: ArtistImage | null
  shortBio: string
  biography?: string | null
  careerHighlights?: Array<{
    label?: string | null
    title: string
    description?: string | null
  }> | null
  collaborations?: Array<{
    name: string
    with?: string | null
    description?: string | null
    url?: string | null
  }> | null
  audioEmbeds?: ArtistAudio[] | null
  videos?: ArtistVideo[] | null
  gallery?: ArtistImage[] | null
  events?: ArtistEvent[] | null
  bookingEmail?: string | null
  bookingLabel?: string | null
  externalLinks?: ArtistLink[] | null
  pressAssets?: ArtistPressAsset[] | null
  technicalRider?: ArtistTechnicalRider | null
  showOnArtistIndex?: boolean | null
  sortOrder?: number | null
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    openGraphImage?: ArtistImage | null
  } | null
}

export type ArtistCard = Pick<
  ArtistEpk,
  "name" | "slug" | "positioning" | "shortBio" | "heroImage" | "showOnArtistIndex" | "sortOrder"
>

const imageProjection = `{
  alt,
  caption,
  credit,
  "src": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
}`

const artistQuery = `*[_type == "artistPage" && slug.current == $slug][0]{
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
    "poster": poster ${imageProjection}
  },
  "gallery": gallery[] ${imageProjection},
  events[]{title, status, startsAt, endsAt, dateDisplay, venue, location, details, url},
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
}`

const artistCardsQuery = `*[
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
}`

const artistSlugsQuery = `*[_type == "artistPage" && defined(slug.current)].slug.current`

const freakyFrankFallback: ArtistEpk = {
  id: "freaky-frank-starter",
  name: "Freaky Frank",
  realName: "Frank Clementi",
  slug: "freaky-frank",
  positioning: "New York DJ and underground-event builder",
  tagline: "He doesn’t just play to a crowd—he builds one.",
  location: "New York",
  activeSince: "the 1990s",
  genres: ["House", "Techno", "Tech House", "Experimental Dance"],
  heroImage: {
    src: "/artists/freaky-frank/hero.jpg",
    alt: "Freaky Frank DJing at Tasty Techno Chapter One under purple and blue lighting",
    width: 1800,
    height: 2400,
  },
  primaryLogo: {
    src: "/artists/freaky-frank/sigil.png",
    alt: "Freaky Frank gold FF sigil",
    width: 930,
    height: 930,
  },
  wordmark: {
    src: "/artists/freaky-frank/wordmark.png",
    alt: "Freaky Frank wordmark",
    width: 555,
    height: 82,
  },
  shortBio:
    "Freaky Frank (Frank Clementi) is a New York DJ and underground-event builder with roots in the city’s 1990s warehouse-rave era. Across more than three decades, his sets have moved between classic house, techno, tech house, and experimental dance music. Whether behind the decks or behind the scenes, Frank’s through-line is connection: he doesn’t just play to a crowd—he builds one.",
  biography:
    "Freaky Frank has spent more than three decades in New York’s underground music culture. Beginning in the 1990s, he worked across DJ booths and event production, with a history spanning Stormrave, the Caffeine warehouse, Journey to the Center of the Earth, Strong Island Underground, Mixology, and Respect the Dance Floor. His sets draw on classic house, techno, tech house, and experimental sounds, shaped by a career that has evolved from vinyl-era warehouse parties to contemporary dance floors.\n\nFrank’s experience also extends to DJ technology and education. During his time at IDJNOW, he trained and supported artists using professional DJ equipment across the vinyl-to-digital transition. Recent collaborative projects include FRANKLIN SQUARED with Frankie Bones and THE MONTAUK PROJECT with Heather Heart.",
  careerHighlights: [
    {
      label: "1990s–present",
      title: "New York underground",
      description: "A career moving between DJ booths, warehouse culture, event production, and technical education.",
    },
    {
      label: "Five-year residency",
      title: "Coney Island Mermaid Ball",
      description: "A recurring chapter in Frank’s history of large-format New York events.",
    },
    {
      label: "Event creator",
      title: "Strong Island Underground: Mixology",
      description: "Built to connect established underground DJs with emerging local talent.",
    },
    {
      label: "Renegade series",
      title: "Journey to the Center of the Earth",
      description: "Site-specific gatherings shaped around discovery, community, and a sense of adventure.",
    },
  ],
  collaborations: [
    {
      name: "FRANKLIN SQUARED",
      with: "Frankie Bones",
      description: "Tag-team DJ collaboration with original production in development.",
    },
    {
      name: "THE MONTAUK PROJECT",
      with: "Heather Heart",
      description: "A collaborative DJ project announced in 2025.",
    },
  ],
  audioEmbeds: [
    {
      title: "8.08 Friday Sessions with Freaky Frank — Part 1",
      provider: "HearThis",
      sourceUrl: "https://hearthis.at/freak/freaky-frank2026-08-081/",
      embedUrl:
        "https://hearthis.at/embed/14619955/transparent_black/?hcolor=55acee&color=&style=2&block_size=2&block_space=2&background=1&waveform=0&cover=0&autoplay=0&css=",
      details: "Tech House · 126 BPM · 2:26:23",
    },
    {
      title: "8.08 Friday Sessions with Freaky Frank — Part 2",
      provider: "HearThis",
      sourceUrl: "https://hearthis.at/freak/freaky-frank2026-08-082/",
      embedUrl:
        "https://hearthis.at/embed/14619956/transparent_black/?hcolor=55acee&color=&style=2&block_size=2&block_space=2&background=1&waveform=0&cover=0&autoplay=0&css=",
      details: "Tech House · 125 BPM · 42:18",
    },
  ],
  videos: [
    {
      title: "Live under the Verrazzano",
      fileUrl: "/artists/freaky-frank/live-under-verrazzano.mp4",
      caption: "A vertical live snapshot from beneath the Verrazzano-Narrows Bridge.",
    },
    {
      title: "Abandoned asylum, Shaolin",
      fileUrl: "/artists/freaky-frank/live-abandoned-asylum-shaolin.mp4",
      caption: "A short piece of atmospheric live footage.",
    },
  ],
  gallery: [
    {
      src: "/artists/freaky-frank/crowd.jpg",
      alt: "A dance floor in colored laser light with Freaky Frank DJing in the background",
      width: 2200,
      height: 1833,
    },
  ],
  events: [
    {
      title: "BBQ & Beats",
      status: "pending",
      dateDisplay: "August 15 · details pending",
      details: "Presented by Against the Grain. Confirm the year, venue, and set time before promotion.",
      url: "https://www.bbqandbeats.com/",
    },
    {
      title: "Camp Wonkru",
      status: "pending",
      startsAt: "2026-08-28T12:00:00-04:00",
      endsAt: "2026-08-30T23:00:00-04:00",
      dateDisplay: "August 28–30, 2026",
      venue: "Paradise Lakes",
      location: "Hammonton, New Jersey",
      details: "Performance date and set time to be announced.",
      url: "https://www.campwonkru.com/",
    },
  ],
  bookingEmail: "freakyfrank@tastytechno.com",
  bookingLabel: "Booking inquiries",
  externalLinks: [
    { label: "Instagram", href: "https://www.instagram.com/freaky69frank/", openInNewTab: true },
    { label: "Facebook", href: "https://www.facebook.com/DeeJayMrC", openInNewTab: true },
    { label: "Discogs", href: "https://www.discogs.com/user/DJFICO", openInNewTab: true },
  ],
  pressAssets: [
    { label: "Primary sigil", format: "Transparent PNG", url: "/artists/freaky-frank/sigil.png" },
    { label: "Wordmark", format: "Transparent PNG · best on light backgrounds", url: "/artists/freaky-frank/wordmark.png" },
    { label: "Press photo", format: "JPG · portrait", url: "/artists/freaky-frank/hero.jpg" },
    { label: "Live crowd photo", format: "JPG · landscape", url: "/artists/freaky-frank/crowd.jpg" },
  ],
  technicalRider: {
    summary:
      "Preferred setup: club-standard Pioneer DJ players and mixer. Please confirm the available models during the advance.",
  },
  showOnArtistIndex: true,
  sortOrder: 10,
  seo: {
    metaTitle: "Freaky Frank — DJ & underground event builder",
    metaDescription:
      "Music, video, biography, selected history, events, press assets, and booking information for New York DJ Freaky Frank.",
  },
}

const fallbackArtists: Record<string, ArtistEpk> = {
  [freakyFrankFallback.slug]: freakyFrankFallback,
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

export const getArtistBySlug = cache(async (slug: string): Promise<ArtistEpk | null> => {
  const fallback = fallbackArtists[slug] ?? null
  const client = createPublishedClient()

  if (!client) return fallback

  try {
    return (await client.fetch<ArtistEpk | null>(artistQuery, { slug })) ?? fallback
  } catch {
    return fallback
  }
})

export const getArtistCards = cache(async (): Promise<ArtistCard[]> => {
  const fallbackCards = Object.values(fallbackArtists).filter(
    (artist) => artist.showOnArtistIndex !== false,
  )
  const client = createPublishedClient()

  if (!client) return fallbackCards

  try {
    const records = await client.fetch<ArtistCard[]>(artistCardsQuery)
    const bySlug = new Map<string, ArtistCard>(
      fallbackCards.map((artist) => [artist.slug, artist]),
    )

    for (const artist of records) bySlug.set(artist.slug, artist)

    return [...bySlug.values()].sort(
      (a, b) => (a.sortOrder ?? 100) - (b.sortOrder ?? 100) || a.name.localeCompare(b.name),
    )
  } catch {
    return fallbackCards
  }
})

export async function getArtistSlugs(): Promise<string[]> {
  const fallbackSlugs = Object.keys(fallbackArtists)
  const client = createPublishedClient()

  if (!client) return fallbackSlugs

  try {
    const slugs = await client.fetch<string[]>(artistSlugsQuery)
    return [...new Set([...fallbackSlugs, ...slugs])]
  } catch {
    return fallbackSlugs
  }
}
