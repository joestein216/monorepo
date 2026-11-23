import { stegaClean } from "@sanity/client/stega"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { SanityImage } from "../../../../components/site/sanity-image"
import { SiteFooter } from "../../../../components/site/site-footer"
import { SiteHeader } from "../../../../components/site/site-header"
import { getOpenGraphImageUrl } from "../../../../sanity/lib/image"
import { getAlbums, getEventBySlug, getEventSlugs, getHomePage } from "../../../../sanity/queries/site"
import { EventBySlugQueryResult } from "../../../../sanity.types"

type EventPageProps = {
  params: Promise<{ slug: string }>
}

export const revalidate = 300

export async function generateStaticParams() {
  return (await getEventSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params
  const { data } = await getEventBySlug(slug, { stega: false })
  if (!data) return { title: "Event not found | Tasty Techno" }

  const event = data
  const title = event.seo?.metaTitle?.trim() || `${event.chapterLabel ?? event.title} | Tasty Techno`
  const description = event.seo?.metaDescription?.trim() || event.summary || undefined
  const socialImage = event.seo?.openGraphImage ?? event.heroImage
  const socialImageUrl = getOpenGraphImageUrl(socialImage)

  return {
    title,
    description,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/events/${event.slug}`,
      images: socialImageUrl && socialImage ? [{ url: socialImageUrl, alt: socialImage.alt ?? "" }] : undefined,
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const [eventPromise, home, albums] = await Promise.all([getEventBySlug(slug), getHomePage(), getAlbums()])
  
  const event = eventPromise.data as EventBySlugQueryResult
  if (!event) notFound()

  const socialImage = event.seo?.openGraphImage ?? event.heroImage
  const ogImageUrl = getOpenGraphImageUrl(socialImage)
  const album = albums.find((candidate) => stegaClean(candidate.relatedEvent?.id) === stegaClean(event.id) || stegaClean(candidate.relatedEvent?.slug) === stegaClean(event.slug))
  const structuredData = event.startsAt || event.eventDate
    ? {
        "@context": "https://schema.org",
        "@type": "MusicEvent",
        name: event.title,
        description: event.summary,
        startDate: event.startsAt || event.eventDate,
        endDate: event.endsAt || undefined,
        eventStatus:
          stegaClean(event.status) === "cancelled"
            ? "https://schema.org/EventCancelled"
            : stegaClean(event.status) === "past"
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
        image: ogImageUrl || undefined,
        url: `https://www.tastytechno.com/events/${event.slug}`,
      }
    : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main id="main-content">
        <article>
          <header className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
            <div data-slot="content-panel">
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
                  <time dateTime={stegaClean(event.startsAt)}>{event.dateDisplay ?? event.startsAt}</time>
                ) : event.eventDate ? (
                  <time dateTime={stegaClean(event.eventDate)}>{event.dateDisplay ?? event.eventDate}</time>
                ) : (
                  event.dateDisplay
                )}
                {[event.venue, event.location].filter(Boolean).length
                  ? ` · ${[event.venue, event.location].filter(Boolean).join(" · ")}`
                  : null}
              </p>
            ) : null}
            </div>
          </header>

          {event.heroImage ? (
            <figure className="mx-auto w-full max-w-6xl px-6">
              <div data-slot="event-artwork"><div data-slot="metal-frame">
                <SanityImage
                  image={event.heroImage}
                  alt={event.heroImage.alt || event.title}
                  priority
                  sizes="(max-width: 767px) 90vw, 480px"
                />
              </div></div>
              {event.heroImage.caption || event.heroImage.credit ? (
                <figcaption className="mt-3 text-sm text-muted-foreground">
                  {[event.heroImage.caption, event.heroImage.credit].filter(Boolean).join(" · ")}
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-14 md:grid-cols-2 md:py-20">
            <section aria-labelledby="lineup-heading" data-slot="content-panel">
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

            <aside aria-labelledby="event-links-heading" data-slot="content-panel">
              <h2 id="event-links-heading" className="text-2xl font-semibold tracking-tight">
                Around this night
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
      <SiteFooter inquiryEmail={home?.inquiryEmail} socialLinks={home?.socialLinks} />
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(stegaClean(structuredData)).replace(/</g, "\\u003c") }}
        />
      ) : null}
    </div>
  )
}
