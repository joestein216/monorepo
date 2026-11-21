import Link from "next/link";
import { SiteImage } from "./SiteImage";
import { PlayMix } from "./AudioDock";
import { safeUrl, playerUrl } from "./media";
import type { Event, Mix, Video, StoreItem } from "./types";

export function EventList({
  events,
  empty,
}: {
  events: Event[];
  empty: string;
}) {
  if (!events.length) return <p data-slot="empty-state">{empty}</p>;
  return (
    <ul data-slot="event-list">
      {events.map((event) => (
        <li key={event._id} id={`event-${event.slug || event._id}`}>
          <article data-slot="event">
            <p data-slot="event-date">
              {event.startsAt || event.eventDate ? (
                <time dateTime={event.startsAt || event.eventDate || undefined}>
                  {event.dateDisplay ||
                    new Intl.DateTimeFormat("en-US", {
                      timeZone: event.startsAt ? "America/New_York" : "UTC",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(
                      new Date(
                        event.startsAt || `${event.eventDate}T12:00:00Z`,
                      ),
                    )}
                </time>
              ) : (
                event.dateDisplay || "Date to be announced"
              )}
            </p>
            <header>
              <h3>{event.title}</h3>
              <p>{[event.venue, event.location].filter(Boolean).join(" · ")}</p>
            </header>
            {event.status === "cancelled" ? (
              <p>Cancelled</p>
            ) : (
              safeUrl(event.url) && (
                <a href={safeUrl(event.url)}>
                  Event details<span className="sr-only">: {event.title}</span>
                </a>
              )
            )}
            {event.summary && <p data-slot="event-summary">{event.summary}</p>}
          </article>
        </li>
      ))}
    </ul>
  );
}
export function EventArchive({
  upcoming,
  past,
  pending,
}: {
  upcoming: Event[];
  past: Event[];
  pending: Event[];
}) {
  return (
    <>
      <section data-slot="band" aria-labelledby="upcoming-dates" id="dates">
        <header data-slot="section-heading">
          <p data-slot="eyebrow">On the floor</p>
          <h2 id="upcoming-dates">Upcoming dates</h2>
        </header>
        <EventList
          events={upcoming}
          empty="New dates are on the way. Check back for the next dance."
        />
        {pending.length > 0 && (
          <section aria-labelledby="pending-dates">
            <h2 id="pending-dates">Dates to be announced</h2>
            <EventList events={pending} empty="" />
          </section>
        )}
      </section>
      <section data-slot="band" aria-labelledby="past-dates">
        <details data-slot="past-events">
          <summary>
            <h2 id="past-dates">
              Past events <span>({past.length})</span>
            </h2>
          </summary>
          <EventList
            events={past}
            empty="The archive is being built. More nights to come."
          />
        </details>
      </section>
    </>
  );
}
export function MixList({ mixes }: { mixes: Mix[] }) {
  return mixes.length ? (
    <ol data-slot="mix-list">
      {mixes.map((mix) => (
        <li key={mix._key}>
          <article data-slot="mix">
            <header>
              <p data-slot="eyebrow">{mix.provider || "Live recording"}</p>
              <h3>{mix.title}</h3>
              {mix.details && <p>{mix.details}</p>}
            </header>
            <PlayMix mix={mix} />
            {safeUrl(mix.sourceUrl) && (
              <a href={safeUrl(mix.sourceUrl)}>
                Original recording<span className="sr-only">: {mix.title}</span>
              </a>
            )}
          </article>
        </li>
      ))}
    </ol>
  ) : (
    <p data-slot="empty-state">
      The next transmission is coming. Check back for new sets.
    </p>
  );
}
export function VideoList({ videos }: { videos: Video[] }) {
  return videos.length ? (
    <ul data-slot="video-list">
      {videos.map((video) => (
        <li key={video._key}>
          <article data-slot="video">
            <SiteImage image={video.poster} />
            <h3>{video.title}</h3>
            {video.caption && <p>{video.caption}</p>}
            {playerUrl(video.externalUrl) ? (
              <iframe
                src={playerUrl(video.externalUrl)}
                title={video.title || "Freaky Frank live video"}
                loading="lazy"
                allow="fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : safeUrl(video.fileUrl) ? (
              <video
                controls
                preload="none"
                poster={video.poster?.src || undefined}
              >
                <source src={safeUrl(video.fileUrl)} />
                Your browser does not support video playback.
              </video>
            ) : null}
            {(safeUrl(video.externalUrl) || safeUrl(video.fileUrl)) && (
              <a href={safeUrl(video.externalUrl) || safeUrl(video.fileUrl)}>
                Open video<span className="sr-only">: {video.title}</span>
              </a>
            )}
          </article>
        </li>
      ))}
    </ul>
  ) : (
    <p data-slot="empty-state">More moments from the floor are on their way.</p>
  );
}
export function StoreItems({ items }: { items: StoreItem[] }) {
  return items.length ? (
    <ul data-slot="store-list">
      {items.map((item) => (
        <li key={item._id} id={`item-${item.slug || item._id}`}>
          <article data-slot="store-item">
            <SiteImage image={item.image} />
            <p data-slot="eyebrow">{item.category}</p>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            {item.price != null && (
              <p>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: item.currency || "USD",
                }).format(item.price)}
              </p>
            )}
            {item.availability === "sold-out" ? (
              <p>Sold out</p>
            ) : safeUrl(item.purchaseUrl) ? (
              <a href={safeUrl(item.purchaseUrl)}>
                {item.availability === "preorder" ? "Preorder" : "View item"}
                <span className="sr-only">: {item.title}</span>
              </a>
            ) : (
              <Link href="/contact">
                Ask about this item
                <span className="sr-only">: {item.title}</span>
              </Link>
            )}
          </article>
        </li>
      ))}
    </ul>
  ) : (
    <p data-slot="empty-state">
      The crates are being curated. For vinyl and merchandise inquiries,{" "}
      <Link href="/contact">get in touch</Link>.
    </p>
  );
}
