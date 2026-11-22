import type { IMPORT_EXISTING_ARTIST_QUERY_RESULT } from "../sanity.types"
import { defineQuery } from "next-sanity"
import { randomUUID } from "node:crypto"
import { createReadStream } from "node:fs"
import { basename, resolve } from "node:path"

import { getCliClient } from "sanity/cli"

const IMPORT_EXISTING_ARTIST_QUERY = defineQuery(`*[_type == "artistPage" && slug.current == $slug]{_id}`)

const slug = "freaky-frank"
const mediaDirectory = resolve(process.cwd(), "public/artists/freaky-frank")

const client = getCliClient({
  apiVersion: "2026-08-11",
  perspective: "raw",
  useCdn: false,
})

function reference(assetId: string) {
  return { _type: "reference", _ref: assetId }
}

function image(assetId: string, alt: string) {
  return {
    _type: "image",
    asset: reference(assetId),
    alt,
  }
}

function file(assetId: string) {
  return {
    _type: "file",
    asset: reference(assetId),
  }
}

function paragraph(key: string, text: string) {
  return {
    _key: key,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: `${key}-span`,
        _type: "span",
        marks: [],
        text,
      },
    ],
  }
}

async function uploadImage(filename: string) {
  const path = resolve(mediaDirectory, filename)
  return client.assets.upload("image", createReadStream(path), {
    filename: basename(path),
  })
}

async function uploadFile(filename: string) {
  const path = resolve(mediaDirectory, filename)
  return client.assets.upload("file", createReadStream(path), {
    filename: basename(path),
  })
}

async function main() {
  const existing = await client.fetch<IMPORT_EXISTING_ARTIST_QUERY_RESULT>(IMPORT_EXISTING_ARTIST_QUERY,
    { slug },
  )

  if (existing.length) {
    throw new Error(
      `Import stopped without changes: an artist document already exists (${existing
        .map((document) => document._id)
        .join(", ")}).`,
    )
  }

  const draftId = `drafts.${randomUUID()}`

  console.log("Uploading Freaky Frank media to Sanity…")

  const [hero, crowd, sigil, wordmark, verrazzanoVideo, asylumVideo] = await Promise.all([
    uploadImage("hero.jpg"),
    uploadImage("crowd.jpg"),
    uploadImage("sigil.png"),
    uploadImage("wordmark.png"),
    uploadFile("live-under-verrazzano.mp4"),
    uploadFile("live-abandoned-asylum-shaolin.mp4"),
  ])

  const heroImage = image(
    hero._id,
    "Freaky Frank DJing at Tasty Techno Chapter One under purple and blue lighting",
  )
  const crowdImage = image(
    crowd._id,
    "A dance floor in colored laser light with Freaky Frank DJing in the background",
  )
  const sigilImage = image(sigil._id, "Freaky Frank gold FF sigil")
  const wordmarkImage = image(wordmark._id, "Freaky Frank wordmark")

  const document = {
    _id: draftId,
    _type: "artistPage",
    name: "Freaky Frank",
    realName: "Frank Clementi",
    slug: { _type: "slug", current: slug },
    positioning: "New York DJ and underground-event builder",
    tagline: "He doesn’t just play to a crowd—he builds one.",
    location: "New York",
    activeSince: "the 1990s",
    genres: ["House", "Techno", "Tech House", "Experimental Dance"],
    heroImage,
    primaryLogo: sigilImage,
    wordmark: wordmarkImage,
    shortBio:
      "Freaky Frank (Frank Clementi) is a New York DJ and underground-event builder with roots in the city’s 1990s warehouse-rave era. Across more than three decades, his sets have moved between classic house, techno, tech house, and experimental dance music. Whether behind the decks or behind the scenes, Frank’s through-line is connection: he doesn’t just play to a crowd—he builds one.",
    biography: [
      paragraph(
        "bio-underground",
        "Freaky Frank has spent more than three decades in New York’s underground music culture. Beginning in the 1990s, he worked across DJ booths and event production, with a history spanning Stormrave, the Caffeine warehouse, Journey to the Center of the Earth, Strong Island Underground, Mixology, and Respect the Dance Floor. His sets draw on classic house, techno, tech house, and experimental sounds, shaped by a career that has evolved from vinyl-era warehouse parties to contemporary dance floors.",
      ),
      paragraph(
        "bio-technology",
        "Frank’s experience also extends to DJ technology and education. During his time at IDJNOW, he trained and supported artists using professional DJ equipment across the vinyl-to-digital transition. Recent collaborative projects include FRANKLIN SQUARED with Frankie Bones and THE MONTAUK PROJECT with Heather Heart.",
      ),
    ],
    careerHighlights: [
      {
        _key: "history-underground",
        _type: "careerHighlight",
        label: "1990s–present",
        title: "New York underground",
        description:
          "A career moving between DJ booths, warehouse culture, event production, and technical education.",
      },
      {
        _key: "history-mermaid-ball",
        _type: "careerHighlight",
        label: "Five-year residency",
        title: "Coney Island Mermaid Ball",
        description: "A recurring chapter in Frank’s history of large-format New York events.",
      },
      {
        _key: "history-mixology",
        _type: "careerHighlight",
        label: "Event creator",
        title: "Strong Island Underground: Mixology",
        description: "Built to connect established underground DJs with emerging local talent.",
      },
      {
        _key: "history-journey",
        _type: "careerHighlight",
        label: "Renegade series",
        title: "Journey to the Center of the Earth",
        description:
          "Site-specific gatherings shaped around discovery, community, and a sense of adventure.",
      },
    ],
    collaborations: [
      {
        _key: "collaboration-franklin-squared",
        _type: "collaboration",
        name: "FRANKLIN SQUARED",
        with: "Frankie Bones",
        description: "Tag-team DJ collaboration with original production in development.",
      },
      {
        _key: "collaboration-montauk-project",
        _type: "collaboration",
        name: "THE MONTAUK PROJECT",
        with: "Heather Heart",
        description: "A collaborative DJ project announced in 2025.",
      },
    ],
    audioEmbeds: [
      {
        _key: "audio-friday-sessions-part-one",
        _type: "audioEmbed",
        title: "8.08 Friday Sessions with Freaky Frank — Part 1",
        provider: "hearthis",
        sourceUrl: "https://hearthis.at/freak/freaky-frank2026-08-081/",
        embedUrl:
          "https://hearthis.at/embed/14619955/transparent_black/?hcolor=55acee&color=&style=2&block_size=2&block_space=2&background=1&waveform=0&cover=0&autoplay=0&css=",
        details: "Tech House · 126 BPM · 2:26:23",
      },
      {
        _key: "audio-friday-sessions-part-two",
        _type: "audioEmbed",
        title: "8.08 Friday Sessions with Freaky Frank — Part 2",
        provider: "hearthis",
        sourceUrl: "https://hearthis.at/freak/freaky-frank2026-08-082/",
        embedUrl:
          "https://hearthis.at/embed/14619956/transparent_black/?hcolor=55acee&color=&style=2&block_size=2&block_space=2&background=1&waveform=0&cover=0&autoplay=0&css=",
        details: "Tech House · 125 BPM · 42:18",
      },
    ],
    videos: [
      {
        _key: "video-verrazzano",
        _type: "artistVideo",
        title: "Live under the Verrazzano",
        file: file(verrazzanoVideo._id),
        caption: "A vertical live snapshot from beneath the Verrazzano-Narrows Bridge.",
        loop: false,
      },
      {
        _key: "video-asylum",
        _type: "artistVideo",
        title: "Abandoned asylum, Shaolin",
        file: file(asylumVideo._id),
        caption: "A short piece of atmospheric live footage.",
        loop: true,
      },
    ],
    gallery: [
      {
        _key: "gallery-crowd",
        ...crowdImage,
      },
    ],
    events: [
      {
        _key: "event-bbq-and-beats",
        _type: "artistEvent",
        title: "Against the Grain",
        organizer: "BBQ & Beats",
        status: "pending",
        dateDisplay: "August 15 · details pending",
        details: "Presented by Against the Grain. Confirm the year, venue, and set time before promotion.",
        url: "https://www.bbqandbeats.com/",
      },
      {
        _key: "event-camp-wonkru",
        _type: "artistEvent",
        title: "Camp Wonkru",
        organizer: "Camp Wonkru",
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
      {
        _key: "link-instagram",
        _type: "link",
        label: "Instagram",
        href: "https://www.instagram.com/freaky69frank/",
        openInNewTab: true,
      },
      {
        _key: "link-facebook",
        _type: "link",
        label: "Facebook",
        href: "https://www.facebook.com/DeeJayMrC",
        openInNewTab: true,
      },
      {
        _key: "link-discogs",
        _type: "link",
        label: "Discogs",
        href: "https://www.discogs.com/user/DJFICO",
        openInNewTab: true,
      },
    ],
    pressAssets: [
      {
        _key: "press-sigil",
        _type: "pressAsset",
        label: "Primary sigil",
        format: "Transparent PNG",
        image: sigilImage,
      },
      {
        _key: "press-wordmark",
        _type: "pressAsset",
        label: "Wordmark",
        format: "Transparent PNG · best on light backgrounds",
        image: wordmarkImage,
      },
      {
        _key: "press-photo",
        _type: "pressAsset",
        label: "Press photo",
        format: "JPG · portrait",
        image: heroImage,
      },
      {
        _key: "press-crowd",
        _type: "pressAsset",
        label: "Live crowd photo",
        format: "JPG · landscape",
        image: crowdImage,
      },
    ],
    technicalRider: {
      _type: "technicalRider",
      summary:
        "Preferred setup: club-standard Pioneer DJ players and mixer. Please confirm the available models during the advance.",
      boothMonitors: "One dedicated monitor speaker",
    },
    showOnArtistIndex: true,
    sortOrder: 10,
    seo: {
      _type: "seo",
      metaTitle: "Freaky Frank — DJ & underground event builder",
      metaDescription:
        "Music, video, biography, selected history, events, press assets, and booking information for New York DJ Freaky Frank.",
      openGraphImage: heroImage,
    },
  }

  const created = await client.create(document)

  console.log(`Created Studio draft ${created._id}. Review it in /studio, then publish when ready.`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
