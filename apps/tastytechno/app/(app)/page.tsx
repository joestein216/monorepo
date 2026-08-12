import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { AlbumCard } from "../../components/site/album-card"
import { EventCard } from "../../components/site/event-card"
import { SiteFooter } from "../../components/site/site-footer"
import { SiteHeader } from "../../components/site/site-header"
import { getArtistCards } from "../../sanity/lib/artists"
import { getSiteImageUrl } from "../../sanity/lib/image"
import { getAlbums, getEvents, getHomePage, getSiteSettings } from "../../sanity/lib/site"

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const [settings, home, albums] = await Promise.all([
    getSiteSettings(),
    getHomePage(),
    getAlbums(),
  ])
  const title = home.seo?.metaTitle?.trim() || `${settings.title} | Artists, Events & Underground Culture`
  const description = home.seo?.metaDescription?.trim() || settings.description
  const featuredAlbum =
    albums.find((album) => album.slug === home.featuredAlbumSlug) ??
    albums.find((album) => album.showOnHome === true)
  const socialImage = home.seo?.openGraphImage ?? featuredAlbum?.coverPhoto?.image
  const socialImageUrl = socialImage
    ? getSiteImageUrl(socialImage, { width: 1200, height: 630, quality: 88 })
    : null

  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      type: "website",
      url: "/",
      siteName: settings.title,
      images: socialImageUrl && socialImage ? [{ url: socialImageUrl, alt: socialImage.alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: socialImageUrl ? [socialImageUrl] : undefined,
    },
  }
}

export default async function HomePage() {
  const [settings, home, events, albums, artists] = await Promise.all([
    getSiteSettings(),
    getHomePage(),
    getEvents(),
    getAlbums(),
    getArtistCards(),
  ])
  const featuredEvent =
    events.find((event) => event.slug === home.featuredEventSlug) ??
    events.find((event) => event.showOnHome === true) ??
    events[0]
  const featuredAlbum =
    albums.find((album) => album.slug === home.featuredAlbumSlug) ??
    albums.find((album) => album.showOnHome === true) ??
    albums[0]
  const featuredArtists = artists.slice(0, 3)
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.tastytechno.com/#organization",
        name: settings.title,
        url: "https://www.tastytechno.com",
        email: home.inquiryEmail,
        sameAs: home.socialLinks.map((link) => link.href),
      },
      {
        "@type": "WebSite",
        "@id": "https://www.tastytechno.com/#website",
        url: "https://www.tastytechno.com",
        name: settings.title,
        description: settings.description,
        publisher: { "@id": "https://www.tastytechno.com/#organization" },
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main id="main-content">
        <section aria-labelledby="home-heading" className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28 lg:py-32">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {home.eyebrow}
            </p>
            <h1
              id="home-heading"
              className="mt-4 max-w-5xl text-5xl font-semibold tracking-tight sm:text-7xl lg:text-8xl"
            >
              {home.heading}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
              {home.introduction}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                href="/events"
              >
                Explore events
              </Link>
              <Link
                className="inline-flex min-h-11 items-center rounded-md border border-border px-5 py-2.5 text-sm font-medium"
                href="/artists"
              >
                Meet the artists
              </Link>
            </div>
          </div>
        </section>

        <section id="events" aria-labelledby="events-heading" className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Past and future
                </p>
                <h2 id="events-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
                  Events
                </h2>
              </div>
              <Link className="text-sm font-medium underline underline-offset-4" href="/events">
                View all events
              </Link>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
              {featuredEvent ? <EventCard event={featuredEvent} featured /> : null}
              <article className="flex min-h-72 flex-col justify-between rounded-2xl border border-border bg-muted/40 p-7">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {home.nextChapterLabel}
                  </p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-tight">{home.nextChapterTitle}</h3>
                  <p className="mt-4 leading-7 text-muted-foreground">{home.nextChapterCopy}</p>
                </div>
                <a
                  className="mt-8 inline-flex text-sm font-medium underline underline-offset-4"
                  href={`mailto:${home.inquiryEmail}?subject=Tasty%20Techno%20Chapter%20Two`}
                >
                  Start a conversation
                </a>
              </article>
            </div>
          </div>
        </section>

        <section id="albums" aria-labelledby="albums-heading" className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Curated visual records
                </p>
                <h2 id="albums-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
                  Gallery
                </h2>
              </div>
              <Link className="text-sm font-medium underline underline-offset-4" href="/albums">
                Browse albums
              </Link>
            </div>
            {featuredAlbum ? (
              <div className="mt-10">
                <AlbumCard album={featuredAlbum} featured />
              </div>
            ) : null}
          </div>
        </section>

        <section id="artists" aria-labelledby="artists-heading" className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-3xl">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Artist profiles
                </p>
                <h2 id="artists-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
                  Artists
                </h2>
                <p className="mt-4 leading-7 text-muted-foreground">
                  Music, stories, live media, press materials, and direct booking information.
                </p>
              </div>
              <Link className="text-sm font-medium underline underline-offset-4" href="/artists">
                View all artists
              </Link>
            </div>

            {featuredArtists.length ? (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredArtists.map((artist) => (
                  <article
                    key={artist.slug}
                    className="overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    {artist.heroImage ? (
                      <Link
                        className="relative block aspect-[4/5] bg-muted"
                        href={`/artists/${artist.slug}`}
                        aria-label={`View ${artist.name} press kit`}
                      >
                        <Image
                          src={artist.heroImage.src}
                          alt={artist.heroImage.alt}
                          fill
                          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </Link>
                    ) : null}
                    <div className="p-6">
                      {artist.positioning ? (
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                          {artist.positioning}
                        </p>
                      ) : null}
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight">{artist.name}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {artist.shortBio}
                      </p>
                      <Link
                        className="mt-5 inline-flex text-sm font-medium underline underline-offset-4"
                        href={`/artists/${artist.slug}`}
                      >
                        View {artist.name}&apos;s EPK
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section id="contact" aria-labelledby="contact-heading">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 sm:py-24 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Contact
              </p>
              <h2 id="contact-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
                Connect with Tasty Techno
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
                Event ideas, collaborations, artist inquiries, and future chapters all start with a conversation.
              </p>
            </div>
            <address className="not-italic lg:pt-8">
              <dl className="space-y-6">
                <div>
                  <dt className="text-sm text-muted-foreground">Tasty Techno inquiries</dt>
                  <dd className="mt-1 text-lg">
                    <a className="underline underline-offset-4" href={`mailto:${home.inquiryEmail}`}>
                      {home.inquiryEmail}
                    </a>
                  </dd>
                </div>
                {home.artistBookingEmail ? (
                  <div>
                    <dt className="text-sm text-muted-foreground">Freaky Frank bookings</dt>
                    <dd className="mt-1 text-lg">
                      <a className="underline underline-offset-4" href={`mailto:${home.artistBookingEmail}`}>
                        {home.artistBookingEmail}
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
              {home.socialLinks.length ? (
                <ul className="mt-8 flex flex-wrap gap-4">
                  {home.socialLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        className="text-sm font-medium underline underline-offset-4"
                        href={link.href}
                        target={link.openInNewTab ? "_blank" : undefined}
                        rel={link.openInNewTab ? "noreferrer" : undefined}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </address>
          </div>
        </section>
      </main>

      <SiteFooter inquiryEmail={home.inquiryEmail} socialLinks={home.socialLinks} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </div>
  )
}
