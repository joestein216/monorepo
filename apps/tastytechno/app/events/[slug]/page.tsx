import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { SiteFooter } from "../../../components/site/site-footer"
import { SiteHeader } from "../../../components/site/site-header"
import { getSiteImageUrl } from "../../../sanity/lib/image"
import { getAlbums, getEventBySlug, getEventSlugs, getHomePage } from "../../../sanity/lib/site"

type EventPageProps = {
  params: Promise<{ slug: string }>
}

export const revalidate = 300

export async function generateStaticParams() {
  return (await getEventSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) return { title: "Event not found | Tasty Techno" }

  const title = event.seo?.metaTitle?.trim() || `${event.chapterLabel ?? event.title} | Tasty Techno`
  const description = event.seo?.metaDescription?.trim() || event.summary
  const socialImage = event.seo?.openGraphImage ?? event.heroImage
  const socialImageUrl = socialImage
    ? getSiteImageUrl(socialImage, { width: 1200, height: 630, quality: 88 })
    : null

  return {
    title,
    description,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/events/${event.slug}`,
      images: socialImageUrl && socialImage ? [{ url: socialImageUrl, alt: socialImage.alt }] : undefined,
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const [event, home, albums] = await Promise.all([getEventBySlug(slug), getHomePage(), getAlbums()])
  if (!event) notFound()

  const heroUrl = event.heroImage
    ? getSiteImageUrl(event.heroImage, { width: 1800, height: 1100, quality: 86 })
    : null
  const album = albums.find((candidate) => candidate.relatedEvent?.id === event.id || candidate.relatedEvent?.slug === event.slug)
  const structuredData = event.startsAt || event.eventDate
    ? {
        "@context": "https://schema.org",
        "@type": "MusicEvent",
        name: event.title,
        description: event.summary,
        startDate: event.startsAt || event.eventDate,
        endDate: event.endsAt || undefined,
        eventStatus:
          event.status === "cancelled"
            ? "https://schema.org/EventCancelled"
            : event.status === "past"
              ? "https://schema.org/EventCompleted"
              : "https://schema.org/EventScheduled",
        location: event.venue
          ? {
              "@type": "Place",
              name: event.venue,
              address: event.location,
            }
          : undefined,
        organizer: {
          "@type": "Organization",
          name: event.organizer || "Tasty Techno",
          url: "https://www.tastytechno.com",
        },
        performer: event.lineup?.map((artist) => ({ "@type": "MusicGroup", name: artist.name })),
        image: heroUrl || undefined,
        url: `https://www.tastytechno.com/events/${event.slug}`,
      }
    : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main id="main-content">
        <article>
          <header className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
            <Link className="text-sm text-muted-foreground underline underline-offset-4" href="/events">
              Events
            </Link>
            <p className="mt-8 text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {event.chapterLabel ?? "Tasty Techno event"}
            </p>
            <h1 className="mt-3 max-w-5xl text-4xl font-semibold tracking-tight sm:text-6xl">
              {event.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{event.summary}</p>
            {[event.dateDisplay, event.venue, event.location].filter(Boolean).length ? (
              <p className="mt-6 text-sm leading-6 text-muted-foreground">
                {event.startsAt ? (
                  <time dateTime={event.startsAt}>{event.dateDisplay ?? event.startsAt}</time>
                ) : event.eventDate ? (
                  <time dateTime={event.eventDate}>{event.dateDisplay ?? event.eventDate}</time>
                ) : (
                  event.dateDisplay
                )}
                {[event.venue, event.location].filter(Boolean).length
                  ? ` · ${[event.venue, event.location].filter(Boolean).join(" · ")}`
                  : null}
              </p>
            ) : null}
          </header>

          {heroUrl && event.heroImage ? (
            <figure className="mx-auto w-full max-w-6xl px-6">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={heroUrl}
                  alt={event.heroImage.alt}
                  fill
                  priority
                  sizes="(max-width: 1151px) 100vw, 1152px"
                  className="object-cover"
                />
              </div>
              {event.heroImage.caption || event.heroImage.credit ? (
                <figcaption className="mt-3 text-sm text-muted-foreground">
                  {[event.heroImage.caption, event.heroImage.credit].filter(Boolean).join(" · ")}
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-14 md:grid-cols-2 md:py-20">
            <section aria-labelledby="lineup-heading">
              <h2 id="lineup-heading" className="text-2xl font-semibold tracking-tight">
                Lineup
              </h2>
              {event.lineup?.length ? (
                <ul className="mt-6 divide-y divide-border border-y border-border">
                  {event.lineup.map((artist) => (
                    <li key={artist.key} className="flex items-baseline justify-between gap-4 py-4">
                      {artist.artistSlug ? (
                        <Link className="font-medium underline underline-offset-4" href={`/artists/${artist.artistSlug}`}>
                          {artist.name}
                        </Link>
                      ) : (
                        <span className="font-medium">{artist.name}</span>
                      )}
                      {artist.role ? <span className="text-sm text-muted-foreground">{artist.role}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-muted-foreground">Lineup details are coming soon.</p>
              )}
            </section>

            <aside aria-labelledby="event-links-heading">
              <h2 id="event-links-heading" className="text-2xl font-semibold tracking-tight">
                Explore this chapter
              </h2>
              <div className="mt-6 flex flex-col items-start gap-4">
                {album ? (
                  <Link className="font-medium underline underline-offset-4" href={`/albums/${album.slug}`}>
                    View the photo album
                  </Link>
                ) : null}
                {event.eventUrl ? (
                  <a
                    className="font-medium underline underline-offset-4"
                    href={event.eventUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Original event listing
                  </a>
                ) : null}
              </div>
            </aside>
          </div>
        </article>
      </main>
      <SiteFooter inquiryEmail={home.inquiryEmail} socialLinks={home.socialLinks} />
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
      ) : null}
    </div>
  )
}
