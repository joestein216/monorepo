import Image from "next/image"
import Link from "next/link"

import { getSiteImageUrl } from "../../sanity/lib/image"
import type { SiteEvent } from "../../sanity/lib/site"

type EventCardProps = {
  event: SiteEvent
  featured?: boolean
}

export function EventCard({ event, featured = false }: EventCardProps) {
  const imageUrl = event.heroImage
    ? getSiteImageUrl(event.heroImage, { width: featured ? 1600 : 1000, height: 700 })
    : null

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      {imageUrl && event.heroImage ? (
        <Link
          className={`relative block bg-muted ${featured ? "aspect-[16/9]" : "aspect-[4/3]"}`}
          href={`/events/${event.slug}`}
          aria-label={`View ${event.chapterLabel ?? event.title}`}
        >
          <Image
            src={imageUrl}
            alt={event.heroImage.alt}
            fill
            sizes={featured ? "(max-width: 1023px) 100vw, 66vw" : "(max-width: 767px) 100vw, 50vw"}
            className="object-cover"
          />
        </Link>
      ) : null}
      <div className="p-6 sm:p-7">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {event.chapterLabel ?? event.status}
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          <Link className="underline-offset-4 hover:underline" href={`/events/${event.slug}`}>
            {event.title}
          </Link>
        </h3>
        {[event.dateDisplay, event.venue, event.location].filter(Boolean).length ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {[event.dateDisplay, event.venue, event.location].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{event.summary}</p>
        <Link
          className="mt-5 inline-flex text-sm font-medium underline underline-offset-4"
          href={`/events/${event.slug}`}
        >
          View event
        </Link>
      </div>
    </article>
  )
}
