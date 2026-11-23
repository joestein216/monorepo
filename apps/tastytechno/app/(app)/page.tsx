import { stegaClean } from "@sanity/client/stega"
import type { Metadata } from "next"
import Link from "next/link"

import { SanityImage } from "../../components/site/sanity-image"
import { ScrollScene } from "../../components/site/scroll-scene"
import { SiteFooter } from "../../components/site/site-footer"
import { SiteHeader } from "../../components/site/site-header"
import { getHomeEvents } from "../../lib/home-events"
import { getArtistCards } from "../../sanity/queries/artists"
import { getOpenGraphImageUrl } from "../../sanity/lib/image"
import { getAlbums, getEvents, getHomePage } from "../../sanity/queries/site"
import styles from "./home.module.css"

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const [home, events] = await Promise.all([getHomePage({ stega: false }), getEvents({ stega: false })])
  const { upcoming } = getHomeEvents(events)
  const nextEvent = upcoming.find((event) => event.slug === home?.featuredEventSlug) ?? upcoming[0]
  const title = "Into: Haven & Freaky Frank | Tasty Techno"
  const description = "Find the next Into: Haven night at Haven Lounge in Brooklyn. Meet Freaky Frank, explore the music, and look back through the photographs."
  const socialImage = nextEvent?.seo?.openGraphImage ?? nextEvent?.heroImage
  const imageUrl = getOpenGraphImageUrl(socialImage)
  return {
    title, description, alternates: { canonical: "/" },
    openGraph: { title, description, type: "website", url: "/", siteName: "Tasty Techno",
      images: imageUrl ? [{ url: imageUrl, alt: socialImage?.alt || undefined }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: imageUrl ? [imageUrl] : undefined },
  }
}

export default async function HomePage() {
  const [home, events, albums, artists] = await Promise.all([
    getHomePage(), getEvents(), getAlbums(), getArtistCards(),
  ])
  const { upcoming, archive } = getHomeEvents(events)
  const nextId = (upcoming.find((event) => event.slug === stegaClean(home?.featuredEventSlug)) ?? upcoming[0])?.id
  // Keep visible content annotated for Studio visual editing.
  const nextEvent = events.find((event) => event.id === nextId)
  const artist = artists.find((item) => stegaClean(item.slug) === stegaClean(home?.featuredArtistSlug))
    ?? artists.find((item) => stegaClean(item.slug) === "freaky-frank")
  const artistSite = stegaClean(home?.artistSiteUrl) || "https://www.freakyfrank.com"
  const selectedAlbum = albums.find((album) => stegaClean(album.slug) === stegaClean(home?.featuredAlbumSlug))
    ?? albums.find((album) => album.showOnHome) ?? albums[0]
  const photographs = selectedAlbum?.photos?.filter((placement) => placement.photo?.image).slice(0, 4) ?? []
  const residency = home?.residency
  const structuredData = {
    "@context": "https://schema.org", "@type": "WebSite", name: "Tasty Techno",
    url: "https://www.tastytechno.com", description: "Into: Haven, Freaky Frank, and nights in Brooklyn.",
  }

  return (
    <div className={styles.page} data-slot="scene-home">
      <SiteHeader />
      <main id="main-content">
        <ScrollScene artwork={
          <div data-slot="residency-image">
            {nextEvent?.heroImage ? (
              <SanityImage image={nextEvent.heroImage} alt={nextEvent.heroImage.alt} priority sizes="(max-width: 767px) 100vw, 50vw" />
            ) : artist?.heroImage ? (
              <SanityImage image={artist.heroImage} alt={artist.heroImage.alt} priority sizes="(max-width: 767px) 100vw, 50vw" />
            ) : <p>Into: Haven · Brooklyn</p>}
            <p data-slot="image-note">{nextEvent?.heroImage ? "On the horizon" : "Behind the decks"}</p>
          </div>
        }>
          <div data-slot="residency-copy">
            <p data-slot="eyebrow">Brooklyn · Music after dark</p>
            <h1 id="home-heading">{residency?.title || "Into: Haven"}</h1>
            <p data-slot="introduction">{residency?.introduction || "Freaky Frank’s residency at Haven Lounge. A place for guest DJs, familiar faces, and a night that finds its own direction."}</p>
            <address>{residency?.venue || "Haven Lounge"}<br />{residency?.address || "683 Grand Street, Brooklyn"}</address>
            <nav aria-label="Explore the residency" data-slot="actions">
              <a href="#next-night" data-slot="button">Find the next night <span aria-hidden="true">↗</span></a>
              <a href="#artist">Meet Freaky Frank</a>
              {photographs.length ? <a href="#photographs">Look around</a> : null}
            </nav>
          </div>
        </ScrollScene>

        <section id="next-night" data-slot="next-night" aria-labelledby="next-heading">
          <header data-slot="section-heading"><p data-slot="eyebrow">Make a night of it</p><h2 id="next-heading">The next gathering.</h2></header>
          {nextEvent ? (
            <article data-slot="event-detail">
              <h3><Link href={`/events/${nextEvent.slug}`}>{nextEvent.title}</Link></h3>
              <p>{nextEvent.dateDisplay || <time dateTime={stegaClean(nextEvent.startsAt) || undefined}>{new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(stegaClean(nextEvent.startsAt)!))} · New York time</time>}</p>
              <p>{[nextEvent.venue, nextEvent.location].filter(Boolean).join(" · ")}</p>
              <p>{nextEvent.summary}</p>
              {nextEvent.lineup?.length ? <ul aria-label="Lineup" data-slot="lineup">{nextEvent.lineup.map((item) => <li key={item.key}>{item.name}</li>)}</ul> : null}
              <div data-slot="actions">
                <Link href={`/events/${nextEvent.slug}`} data-slot="button">Explore this event <span aria-hidden="true">↗</span></Link>
                {nextEvent.eventUrl ? <a href={stegaClean(nextEvent.eventUrl)}>Event listing & RSVP</a> : null}
              </div>
            </article>
          ) : (
            <div data-slot="event-detail"><p>The next date hasn’t been posted here yet. Follow along for the next Into: Haven announcement.</p><a href="https://www.instagram.com/tastytechnoofficial/" data-slot="button">Follow on Instagram <span aria-hidden="true">↗</span></a></div>
          )}
        </section>

        {artist ? <section id="artist" data-slot="artist" aria-labelledby="artist-heading">
          <div data-slot="artist-copy">
            <p data-slot="eyebrow">The resident</p><h2 id="artist-heading">{artist.name}</h2>
            <p>{artist.shortBio}</p>
            <div data-slot="actions"><a href={artistSite} data-slot="button">Visit {artist.name} <span aria-hidden="true">↗</span></a><Link href={`/artists/${artist.slug}`}>Artist profile & press kit</Link></div>
          </div>
          {artist.heroImage ? <figure data-slot="artist-portrait"><div data-slot="portrait-frame"><SanityImage image={artist.heroImage} alt={artist.heroImage.alt} sizes="(max-width: 767px) 100vw, 40vw" /></div><figcaption>{artist.positioning || artist.name}</figcaption></figure> : null}
        </section> : null}

        {photographs.length ? <section id="photographs" data-slot="photographs" aria-labelledby="photographs-heading">
          <header data-slot="section-heading"><p data-slot="eyebrow">From the floor</p><h2 id="photographs-heading">A little of the atmosphere.</h2><p>Photographs from {selectedAlbum?.title}. A record of the people and nights that brought us here.</p></header>
          <div data-slot="photo-grid">{photographs.map((placement) => <figure key={placement.key}>
            <Link href={`/albums/${selectedAlbum!.slug}`}><SanityImage image={placement.photo!.image} alt={placement.photo!.image?.alt} sizes="(max-width: 767px) 100vw, 50vw" /></Link>
            {placement.captionOverride || placement.photo?.image?.caption ? <figcaption>{placement.captionOverride || placement.photo?.image?.caption}</figcaption> : null}
          </figure>)}</div>
          <Link href="/albums" data-slot="text-link">Explore the photo albums <span aria-hidden="true">↗</span></Link>
        </section> : null}

        {archive.length ? <section data-slot="archive" aria-labelledby="archive-heading">
          <header data-slot="section-heading"><p data-slot="eyebrow">The nights behind us</p><h2 id="archive-heading">Part of the story.</h2></header>
          <ul data-slot="archive-list">{archive.slice(0, 4).map((event) => <li key={event.id}><Link href={`/events/${event.slug}`}><span>{event.title}</span><span>{event.dateDisplay || event.eventDate}</span><span aria-hidden="true">↗</span></Link></li>)}</ul>
          <Link href="/events" data-slot="text-link">All events</Link>
        </section> : null}

        <section id="contact" data-slot="contact" aria-labelledby="contact-heading">
          <div data-slot="contact-card">
            <p data-slot="eyebrow">Keep the conversation going</p><h2 id="contact-heading">See you around.</h2>
            <p>Guest sets, collaborations, photographs, or a question about the next night.</p>
            <div data-slot="actions">
              {home?.inquiryEmail ? <a href={`mailto:${stegaClean(home.inquiryEmail)}`} data-slot="button">Get in touch <span aria-hidden="true">↗</span></a> : null}
            </div>
            <dl data-slot="contact-details">
              {home?.inquiryEmail ? <div><dt>General inquiries</dt><dd><a href={`mailto:${stegaClean(home.inquiryEmail)}`}>{home.inquiryEmail}</a></dd></div> : null}
              {home?.artistBookingEmail ? <div><dt>Artist bookings</dt><dd><a href={`mailto:${stegaClean(home.artistBookingEmail)}`}>{home.artistBookingEmail}</a></dd></div> : null}
            </dl>
          </div>
        </section>
      </main>
      <SiteFooter inquiryEmail={home?.inquiryEmail} socialLinks={home?.socialLinks} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(stegaClean(structuredData)).replace(/</g, "\\u003c") }} />
    </div>
  )
}
