import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { getArtistCards } from "../../sanity/lib/artists"

export const metadata: Metadata = {
  title: "Artists | Tasty Techno",
  description: "Artist profiles, music, media, and booking information from Tasty Techno.",
  alternates: { canonical: "/artists" },
}

export const revalidate = 300

export default async function ArtistsPage() {
  const artists = await getArtistCards()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Link className="text-sm font-semibold tracking-wide" href="/">
            Tasty Techno
          </Link>
          <p className="text-sm text-muted-foreground">Artists</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">Roster</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">Tasty Techno artists</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Music, stories, live media, press materials, and direct booking information.
          </p>
        </div>

        {artists.length ? (
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((artist) => (
              <article key={artist.slug} className="overflow-hidden rounded-2xl border border-border bg-card">
                {artist.heroImage ? (
                  <div className="relative aspect-[4/5] bg-muted">
                    <Image
                      src={artist.heroImage.src}
                      alt={artist.heroImage.alt}
                      fill
                      sizes="(max-width: 639px) calc(100vw - 3rem), (max-width: 1023px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-6">
                  {artist.positioning ? (
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {artist.positioning}
                    </p>
                  ) : null}
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">{artist.name}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{artist.shortBio}</p>
                  <Link
                    className="mt-5 inline-flex text-sm font-medium underline underline-offset-4"
                    href={`/artists/${artist.slug}`}
                  >
                    View press kit
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-12 rounded-2xl border border-border p-8 text-muted-foreground">
            Artist profiles are being prepared.
          </p>
        )}
      </main>
    </div>
  )
}
