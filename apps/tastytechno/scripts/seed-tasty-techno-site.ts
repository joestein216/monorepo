import type { SEED_ARTIST_QUERY_RESULT, SEED_EVENT_QUERY_RESULT, SEED_PHOTO_QUERY_RESULT, SEED_ALBUM_QUERY_RESULT, SEED_HOME_QUERY_RESULT } from "../sanity.types"
import { defineQuery } from "next-sanity"
import { randomUUID } from "node:crypto"

import { getCliClient } from "sanity/cli"

const SEED_ARTIST_QUERY = defineQuery(`*[
      _type == "artistPage" &&
      slug.current == $slug &&
      _id in path("*")
    ][0]{_id, heroImage}`)

const SEED_EVENT_QUERY = defineQuery(`*[_type == "event" && slug.current == $slug && _id in path("*")][0]{
      _id,
      startsAt,
      endsAt,
      dateDisplay
    }`)

const SEED_PHOTO_QUERY = defineQuery(`*[
      _type == "photo" &&
      title == "Freaky Frank at Tasty Techno Chapter One" &&
      references($eventId) &&
      _id in path("*")
    ][0]{_id}`)

const SEED_ALBUM_QUERY = defineQuery(`*[_type == "photoAlbum" && slug.current == $slug && _id in path("*")][0]{_id}`)

const SEED_HOME_QUERY = defineQuery(`*[_type == "homePage" && _id in path("*")] | order(_updatedAt desc)[0]{_id}`)

const eventSlug = "tasty-techno-chapter-one"
const albumSlug = "tasty-techno-chapter-one"
const frankSlug = "freaky-frank"

const client = getCliClient({
  apiVersion: "2026-08-11",
  perspective: "raw",
  useCdn: false,
})

function reference(id: string) {
  return { _type: "reference", _ref: id }
}

function keyedReference(id: string, key: string) {
  return { ...reference(id), _key: key }
}

async function main() {
  const frank = await client.fetch<SEED_ARTIST_QUERY_RESULT>(SEED_ARTIST_QUERY,
    { slug: frankSlug },
  )

  if (!frank?.heroImage?.asset?._ref) {
    throw new Error("Seed stopped: the published Freaky Frank profile or its hero image was not found.")
  }

  const eventImage = {
    ...frank.heroImage,
    _type: "image",
    alt: "Freaky Frank performing at Tasty Techno Chapter One under purple and blue lighting",
    caption: "Freaky Frank at Tasty Techno Chapter One",
  }

  let event = await client.fetch<SEED_EVENT_QUERY_RESULT>(SEED_EVENT_QUERY,
    { slug: eventSlug },
  )

  if (!event) {
    event = await client.create({
      _id: randomUUID(),
      _type: "event",
      title: "A Burlesque Affair: The First Temptation",
      chapterLabel: "Chapter One",
      slug: { _type: "slug", current: eventSlug },
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
      heroImage: eventImage,
      lineup: [
        {
          _key: "foodstampz",
          _type: "lineupArtist",
          name: "Foodstampz",
          role: "Drum & bass",
        },
        {
          _key: "mrfaust",
          _type: "lineupArtist",
          name: "MrFaust",
          role: "Resident",
        },
        {
          _key: "freaky-frank",
          _type: "lineupArtist",
          name: "Freaky Frank",
          role: "Headliner · closing set",
          artist: reference(frank._id),
        },
      ],
      eventUrl: "https://posh.vip/e/tasty-techno-a-burlesque-affair-the-first-temptation",
      showOnHome: true,
      sortOrder: 10,
      seo: {
        _type: "seo",
        metaTitle: "Tasty Techno Chapter One at Starr Bar",
        metaDescription:
          "Tasty Techno Chapter One brought Foodstampz, MrFaust, and Freaky Frank to Starr Bar in Brooklyn on July 17, 2026.",
        openGraphImage: eventImage,
      },
    })
  }

  let eventPatch = client.patch(event._id).setIfMissing({
    eventDate: "2026-07-17",
    startsAt: "2026-07-17T23:30:00-04:00",
    endsAt: "2026-07-18T04:00:00-04:00",
  })
  if (event.dateDisplay === "July 17, 2026 · Midnight–4:00 a.m.") {
    eventPatch = eventPatch.set({ dateDisplay: "July 17–18, 2026 · 11:30 p.m.–4:00 a.m." })
  }
  await eventPatch.commit()

  let photo = await client.fetch<SEED_PHOTO_QUERY_RESULT>(SEED_PHOTO_QUERY,
    { eventId: event._id },
  )

  if (!photo) {
    photo = await client.create({
      _id: randomUUID(),
      _type: "photo",
      title: "Freaky Frank at Tasty Techno Chapter One",
      image: eventImage,
      events: [keyedReference(event._id, "chapter-one")],
      artists: [keyedReference(frank._id, "freaky-frank")],
      usage: ["album", "event-gallery", "homepage"],
      tags: ["live", "dj", "chapter-one"],
    })
  }

  let album = await client.fetch<SEED_ALBUM_QUERY_RESULT>(SEED_ALBUM_QUERY,
    { slug: albumSlug },
  )

  if (!album) {
    album = await client.create({
      _id: randomUUID(),
      _type: "photoAlbum",
      title: "Tasty Techno: Chapter One",
      slug: { _type: "slug", current: albumSlug },
      summary: "A curated visual record of Tasty Techno’s first chapter at Starr Bar in Brooklyn.",
      relatedEvent: reference(event._id),
      coverPhoto: reference(photo._id),
      photos: [
        {
          _key: "chapter-one-freaky-frank",
          _type: "photoPlacement",
          photo: reference(photo._id),
        },
      ],
      showOnHome: true,
      sortOrder: 10,
      seo: {
        _type: "seo",
        metaTitle: "Tasty Techno Chapter One Photo Album",
        metaDescription: "Photos from Tasty Techno Chapter One at Starr Bar in Brooklyn.",
        openGraphImage: eventImage,
      },
    })
  }

  let homePage = await client.fetch<SEED_HOME_QUERY_RESULT>(SEED_HOME_QUERY,
  )

  if (!homePage) {
    homePage = await client.create({
      _id: randomUUID(),
      _type: "homePage",
      eyebrow: "New York",
      heading: "Tasty Techno",
      introduction:
        "Artists, events, music, and underground culture. Explore Chapter One, meet Freaky Frank, and see what comes next.",
      featuredEvent: reference(event._id),
      featuredAlbum: reference(album._id),
      nextChapterLabel: "Chapter Two",
      nextChapterTitle: "TBD",
      nextChapterCopy: "The next chapter is still unwritten. Reach out to write yourself in.",
      inquiryEmail: "connect@tastytechno.com",
      artistBookingEmail: "freakyfrank@tastytechno.com",
      socialLinks: [
        {
          _key: "instagram",
          _type: "link",
          label: "Instagram",
          href: "https://www.instagram.com/tastytechnoofficial",
          openInNewTab: true,
        },
        {
          _key: "facebook",
          _type: "link",
          label: "Facebook",
          href: "https://www.facebook.com/tastytechno",
          openInNewTab: true,
        },
      ],
      seo: {
        _type: "seo",
        metaTitle: "Tasty Techno | Artists, Events & Underground Culture",
        metaDescription:
          "Explore Tasty Techno artists, event archives, galleries, and booking information, featuring Freaky Frank and Chapter One at Starr Bar in Brooklyn.",
        openGraphImage: eventImage,
      },
    })
  }

  console.log(
    JSON.stringify({
      event: event._id,
      photo: photo._id,
      album: album._id,
      homePage: homePage._id,
    }),
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
