import Link from "next/link"
import { ArtistQueryResult } from "../../../sanity.types"
import { type SanityImageValue, getSiteImageUrl } from "../../../sanity/queries/image"
import { SanityImage } from "../site/sanity-image"

type ArtistEpkProps = {
  artist: ArtistQueryResult
}

export type ArtistVideo = {
  title: string
  fileUrl?: string | null
  externalUrl?: string | null
  caption?: string | null
  poster?: SanityImageValue | null
  loop: boolean
}

const trustedEmbedHosts = new Set([
  "hearthis.at",
  "open.spotify.com",
  "player.vimeo.com",
  "w.soundcloud.com",
  "widget.mixcloud.com",
  "www.youtube.com",
  "youtube.com",
])

function safeHref(value?: string | null) {
  if (!value) return null
  if (value.startsWith("/") && !value.startsWith("//")) return value

  try {
    const url = new URL(value)
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.toString() : null
  } catch {
    return null
  }
}

function safeEmbedUrl(value?: string | null) {
  if (!value) return null

  try {
    const url = new URL(value)
    if (url.protocol !== "https:" || !trustedEmbedHosts.has(url.hostname)) return null
    if (url.hostname === "hearthis.at" && !url.pathname.startsWith("/embed/")) return null
    if (["youtube.com", "www.youtube.com"].includes(url.hostname) && !url.pathname.startsWith("/embed/")) {
      return null
    }
    if (url.hostname === "open.spotify.com" && !url.pathname.startsWith("/embed/")) return null

    return url.toString()
  } catch {
    return null
  }
}

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://")
}



function VideoCard({ video }: { video: ArtistVideo }) {
  const localOrHostedFile = safeHref(video.fileUrl)
  const embedUrl = safeEmbedUrl(video.externalUrl)
  const externalUrl = safeHref(video.externalUrl)
  const poster = video.poster || null
  const posterUrl = poster ? getSiteImageUrl(poster, { width: 1280, height: 720 }) : undefined

  return (
    <article className="overflow-hidden rounded-md shadow-sm border border-border bg-card">
      {localOrHostedFile ? (
        <video
          className="aspect-[9/16] max-h-[38rem] w-full bg-black object-contain"
          controls
          playsInline
          preload="metadata"
          poster={posterUrl}
          aria-label={video.title}
          loop={video.loop}
        >
          <source src={localOrHostedFile} />
          Your browser does not support embedded video.
        </video>
      ) : embedUrl ? (
        <iframe
          className="aspect-video w-full bg-black"
          src={embedUrl}
          title={video.title}
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : null}

      <div className="p-5">
        <h3 className="font-medium">{video.title}</h3>
        {video.caption ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{video.caption}</p>
        ) : null}
        {!localOrHostedFile && !embedUrl && externalUrl ? (
          <a
            className="mt-3 inline-flex text-sm font-medium underline underline-offset-4"
            href={externalUrl}
            target="_blank"
            rel="noreferrer"
          >
            Watch video ↗
          </a>
        ) : null}
      </div>
    </article>
  )
}

export function ArtistEpk({ artist }: ArtistEpkProps) {
  if (!artist) { return null }
  const biography = artist.biography
    ?.split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  const bookingHref = artist.bookingEmail
    ? `mailto:${encodeURIComponent(artist.bookingEmail)}?subject=${encodeURIComponent(
        `Booking inquiry for ${artist.name}`,
      )}`
    : null
  const events = artist.events?.filter((event) => event.status !== "cancelled") ?? []
  const hasTechnicalRider = Boolean(
    artist.technicalRider &&
      (artist.technicalRider.summary ||
        artist.technicalRider.preferredSetup?.length ||
        artist.technicalRider.boothMonitors ||
        artist.technicalRider.mediaFormats?.length ||
        artist.technicalRider.fileUrl),
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-5">
          <Link className="text-sm font-semibold tracking-wide" href="/">
            Freaky Frank  
          </Link>
          <nav aria-label="Artist page">
            <ul className="flex items-center gap-5 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-foreground" href="/artists">
                  Artists
                </Link>
              </li>
              {bookingHref ? (
                <li>
                  <a className="font-medium text-foreground" href={bookingHref}>
                    Book {artist.name}
                  </a>
                </li>
              ) : null}
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-border" aria-labelledby="artist-name">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)] md:items-center md:py-20">
            <div>
              {artist.primaryLogo ? (
                <div className="mb-8 h-24 w-24">
                  <SanityImage
                    image={artist.primaryLogo}
                    alt={artist.primaryLogo.alt || `${artist.name} logo`}
                    width={112}
                    height={112}
                    className="h-24 w-24 object-contain"
                  />
                </div>
              ) : null}
              {artist.positioning ? (
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {artist.positioning}
                </p>
              ) : null}
              <h1 id="artist-name" className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">
                {artist.name}
              </h1>
              {artist.realName ? (
                <p className="mt-3 text-lg text-muted-foreground">{artist.realName}</p>
              ) : null}
              {artist.tagline ? (
                <p className="mt-7 max-w-2xl text-2xl leading-tight tracking-tight sm:text-3xl">
                  {artist.tagline}
                </p>
              ) : null}

              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-sm">
                {artist.location ? (
                  <div>
                    <dt className="text-muted-foreground">Based in</dt>
                    <dd className="mt-1 font-medium">{artist.location}</dd>
                  </div>
                ) : null}
                {artist.activeSince ? (
                  <div>
                    <dt className="text-muted-foreground">Active since</dt>
                    <dd className="mt-1 font-medium">{artist.activeSince}</dd>
                  </div>
                ) : null}
              </dl>

              {artist.genres?.length ? (
                <ul className="mt-8 flex flex-wrap gap-2" aria-label="Genres">
                  {artist.genres.map((genre) => (
                    <li key={genre} className="rounded-md border border-border px-3 py-1.5 text-sm">
                      {genre}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-9 flex flex-wrap gap-3">
                {bookingHref ? (
                  <a
                    className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                    href={bookingHref}
                  >
                    {artist.bookingLabel || "Booking inquiries"}
                  </a>
                ) : null}
                {artist.audioEmbeds?.length ? (
                  <a
                    className="inline-flex min-h-11 items-center rounded-md border border-border px-5 py-2.5 text-sm font-medium"
                    href="#listen"
                  >
                    Listen to recent sets
                  </a>
                ) : null}
              </div>
            </div>

            {artist?.heroImage ? (
              <figure>
                <div className="relative aspect-[3/4] overflow-hidden rounded-md shadow-md border border-border bg-muted">
                  <SanityImage
                    image={artist.heroImage}
                    alt={artist.heroImage.alt || artist.name}
                    className="object-cover"
                    sizes="(max-width: 767px) calc(100vw - 3rem), 40vw"
                    priority
                    fill
                  />
                </div>
                {artist.heroImage.caption || artist.heroImage.credit ? (
                  <figcaption className="mt-3 text-xs text-muted-foreground">
                    {[artist.heroImage.caption, artist.heroImage.credit].filter(Boolean).join(" · ")}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}
          </div>
        </section>

        {artist.audioEmbeds?.length ? (
          <section id="listen" className="border-b border-border" aria-labelledby="listen-heading">
            <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
              <div className="max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Featured audio
                </p>
                <h2 id="listen-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Recent sets
                </h2>
              </div>
              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                {artist.audioEmbeds.map((audio) => {
                  const embedUrl = safeEmbedUrl(audio.embedUrl)
                  const sourceUrl = safeHref(audio.sourceUrl)

                  return (
                    <article key={`${audio.provider}-${audio.title}`} className="rounded-md border border-border bg-card p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                            {audio.provider}
                          </p>
                          <h3 className="mt-2 font-medium">{audio.title}</h3>
                          {audio.details ? (
                            <p className="mt-1 text-sm text-muted-foreground">{audio.details}</p>
                          ) : null}
                        </div>
                        {sourceUrl ? (
                          <a
                            className="shrink-0 text-sm underline underline-offset-4"
                            href={sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open ↗
                          </a>
                        ) : null}
                      </div>
                      {embedUrl ? (
                        <iframe
                          className="mt-5 h-44 w-full rounded-md border-0"
                          src={embedUrl}
                          title={audio.title || undefined}
                          loading="lazy"
                          allow="autoplay"
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </div>
          </section>
        ) : null}

        <section className="border-b border-border" aria-labelledby="about-heading">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-[0.7fr_1.3fr] md:py-20">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">Biography</p>
              <h2 id="about-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                About {artist.name}
              </h2>
            </div>
            <div>
              <p className="text-xl leading-8">{artist.shortBio}</p>
              {biography?.length ? (
                <div className="mt-8 space-y-5 text-base leading-7 text-muted-foreground">
                  {biography.map((paragraph, index) => (
                    <p key={`${index}-${paragraph}`}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {artist.careerHighlights?.length ? (
          <section className="border-b border-border" aria-labelledby="history-heading">
            <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">Career</p>
              <h2 id="history-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Selected history
              </h2>
              <div className="mt-9 grid gap-px overflow-hidden rounded-md border border-border bg-border shadow-sm sm:grid-cols-2">
                {artist.careerHighlights.map((highlight) => (
                  <article key={`${highlight.label}-${highlight.title}`} className="bg-card p-6 sm:p-7">
                    {highlight.label ? (
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        {highlight.label}
                      </p>
                    ) : null}
                    <h3 className="mt-3 text-xl font-medium">{highlight.title}</h3>
                    {highlight.description ? (
                      <p className="mt-3 leading-7 text-muted-foreground">{highlight.description}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {artist.videos?.length ? (
          <section className="border-b border-border" aria-labelledby="video-heading">
            <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">Live</p>
              <h2 id="video-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Field recordings
              </h2>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {artist.videos.map((video) => (
                  <VideoCard key={video.title} video={video as ArtistVideo} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {artist.gallery?.length ? (
          <section className="border-b border-border" aria-labelledby="gallery-heading">
            <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">Gallery</p>
              <h2 id="gallery-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                In the room
              </h2>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {artist.gallery.map((image, index) => (
                  <figure key={image.asset?._ref || image.src || index}>
                    <div className="relative aspect-[6/5] overflow-hidden rounded-md shadow-md bg-muted">
                      <SanityImage
                        image={image}
                        alt={image.alt || `${artist.name} gallery image`}
                        className="object-cover"
                        sizes="(max-width: 767px) calc(100vw - 3rem), 50vw"
                        fill
                      />
                    </div>
                    {image.caption || image.credit ? (
                      <figcaption className="mt-3 text-xs text-muted-foreground">
                        {[image.caption, image.credit].filter(Boolean).join(" · ")}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {events.length ? (
          <section className="border-b border-border" aria-labelledby="events-heading">
            <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">Schedule</p>
              <h2 id="events-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Upcoming
              </h2>
              <div className="mt-8 divide-y divide-border border-y border-border">
                {events.map((event, index) => {
                  const eventUrl = safeHref(event.url)
                  const venueLine = [event.venue, event.location].filter(Boolean).join(" · ")

                  return (
                    <article key={`${index}-${event.title}-${event.dateDisplay || event.startsAt}`} className="grid gap-4 py-6 sm:grid-cols-[12rem_1fr_auto] sm:items-start">
                      <div>
                        <p className="font-medium">xxxx</p>
                        {event.status === "pending" ? (
                          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                            Details pending
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{event.title}</h3>
                        {event.organizer ? <p className="mt-1 text-medium text-muted-foreground">{event.organizer}</p> : null}
                        {venueLine ? <p className="mt-1 text-sm text-muted-foreground italic">{venueLine}</p> : null}
                        {event.details ? (
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{event.details}</p>
                        ) : null}
                      </div>
                      {eventUrl ? (
                        <a
                          className="text-sm font-medium underline underline-offset-4"
                          href={eventUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Event site ↗
                        </a>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </div>
          </section>
        ) : null}

        {artist.collaborations?.length ? (
          <section className="border-b border-border" aria-labelledby="collaborations-heading">
            <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-[0.7fr_1.3fr] md:py-20">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">Projects</p>
                <h2 id="collaborations-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Collaborations
                </h2>
              </div>
              <div className="space-y-8">
                {artist.collaborations.map((collaboration) => {
                  const projectUrl = safeHref(collaboration.url)

                  return (
                    <article key={collaboration.name}>
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-xl font-medium">{collaboration.name}</h3>
                        {collaboration.with ? (
                          <p className="text-sm text-muted-foreground">with {collaboration.with}</p>
                        ) : null}
                      </div>
                      {collaboration.description ? (
                        <p className="mt-2 leading-7 text-muted-foreground">{collaboration.description}</p>
                      ) : null}
                      {projectUrl ? (
                        <a
                          className="mt-3 inline-flex text-sm font-medium underline underline-offset-4"
                          href={projectUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Visit project ↗
                        </a>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="booking-heading">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 md:grid-cols-2 md:py-20">
            <div className="rounded-md border border-border bg-card shadow-sm p-7 sm:p-9">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">Contact</p>
              <h2 id="booking-heading" className="mt-3 text-3xl font-semibold tracking-tight">
                Booking
              </h2>
              {artist.bookingEmail ? (
                <p className="mt-5 text-lg">
                  <a className="underline underline-offset-4" href={bookingHref ?? undefined}>
                    {artist.bookingEmail}
                  </a>
                </p>
              ) : (
                <p className="mt-5 text-muted-foreground">Booking contact coming soon.</p>
              )}
              {artist.externalLinks?.length ? (
                <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm">
                  {artist.externalLinks.map((link) => {
                    const href = safeHref(link.href)
                    if (!href) return null
                    const external = isExternalHref(href)

                    return (
                      <li key={`${link.label}-${href}`}>
                        <a
                          className="underline underline-offset-4"
                          href={href}
                          target={link.openInNewTab || external ? "_blank" : undefined}
                          rel={link.openInNewTab || external ? "noreferrer" : undefined}
                        >
                          {link.label}{external ? " ↗" : ""}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>

            <div className="rounded-md border border-border bg-card shadow-sm p-7 sm:p-9">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">Media</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Press assets</h2>
              {artist.pressAssets?.length ? (
                <ul className="mt-5 divide-y divide-border">
                  {artist.pressAssets.map((asset) => {
                    const href = safeHref(asset.url)
                    if (!href) return null

                    return (
                      <li key={`${asset.label}-${asset.url}`}>
                        <a
                          className="flex items-center justify-between gap-4 py-3 text-sm"
                          href={href}
                          download={href.startsWith("/") ? true : undefined}
                          target={isExternalHref(href) ? "_blank" : undefined}
                          rel={isExternalHref(href) ? "noreferrer" : undefined}
                        >
                          <span>
                            <span className="font-medium">{asset.label}</span>
                            {asset.format ? (
                              <span className="ml-2 text-muted-foreground">{asset.format}</span>
                            ) : null}
                          </span>
                          <span aria-hidden="true">↓</span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="mt-5 text-muted-foreground">Press assets available on request.</p>
              )}
            </div>

            {hasTechnicalRider && artist.technicalRider ? (
              <div className="rounded-md border border-border bg-card shadow-sm p-7 sm:col-span-2 sm:p-9">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">Production</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">Technical setup</h2>
                {artist.technicalRider.summary ? (
                  <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">
                    {artist.technicalRider.summary}
                  </p>
                ) : null}
                {artist.technicalRider.preferredSetup?.length ? (
                  <div className="mt-5">
                    <h3 className="text-sm font-medium">Preferred setup</h3>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {artist.technicalRider.preferredSetup.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {artist.technicalRider.boothMonitors ? (
                  <p className="mt-5 text-sm">
                    <span className="font-medium">Booth monitors:</span>{" "}
                    <span className="text-muted-foreground">{artist.technicalRider.boothMonitors}</span>
                  </p>
                ) : null}
                {artist.technicalRider.mediaFormats?.length ? (
                  <p className="mt-3 text-sm">
                    <span className="font-medium">Media formats:</span>{" "}
                    <span className="text-muted-foreground">
                      {artist.technicalRider.mediaFormats.join(", ")}
                    </span>
                  </p>
                ) : null}
                {safeHref(artist.technicalRider.fileUrl) ? (
                  <a
                    className="mt-6 inline-flex text-sm font-medium underline underline-offset-4"
                    href={safeHref(artist.technicalRider.fileUrl) ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download full rider ↗
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DJ Freaky Frank</p>
          <p>{artist.name} electronic press kit</p>
        </div>
      </footer>
    </div>
  )
}
