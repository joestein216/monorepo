import Image from "next/image"
import Link from "next/link"
import { type EventBySlugQueryResult } from "../../sanity.types"

import { getSiteImageUrl } from "../../sanity/queries/image"

type SiteImage = {
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

type EventCardProps = {
  event: EventBySlugQueryResult
}

export function EventCard({ event }: EventCardProps) {
  const imageUrl = event && event.heroImage
    ? getSiteImageUrl(event.heroImage as SiteImage, { width: 1000, height: 700 })
    : null

  return (
    event && <article className="overflow-hidden rounded-2xl border border-border bg-card">
      {imageUrl && event.heroImage ? (
        <Link
          className="relative block bg-muted aspect-[4/3]"
          href={`/events/${event.slug}`}
          aria-label={`View ${event.chapterLabel ?? event.title}`}
        >
          <Image
            src={imageUrl}
            alt={event.heroImage.alt || "event image"}
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
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
