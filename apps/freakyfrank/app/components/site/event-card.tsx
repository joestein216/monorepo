import Link from "next/link"
import { SanityImage } from "./sanity-image"
import type { SanityImageValue } from "../../../sanity/queries/image"

export type EventCardItem = {
  title?: string | null
  slug?: string | null
  chapterLabel?: string | null
  status?: string | null
  dateDisplay?: string | null
  startsAt?: string | null
  venue?: string | null
  location?: string | null
  summary?: string | null
  heroImage?: SanityImageValue | null
}

export type EventCardProps = {
  event: EventCardItem | null | undefined
  featured?: boolean
}

export function EventCard({ event, featured }: EventCardProps) {
  if (!event) return null

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      {event.heroImage ? (
        <Link
          className="relative block bg-muted aspect-[4/3]"
          href={`/events/${event.slug}`}
          aria-label={`View ${event.chapterLabel ?? event.title}`}
        >
          <SanityImage
            image={event.heroImage}
            alt={event.heroImage.alt || event.title || "event image"}
            fill
            sizes={
              featured
                ? "(max-width: 767px) 100vw, 66vw"
                : "(max-width: 767px) 100vw, 50vw"
            }
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
