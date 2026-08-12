import type { Metadata } from "next"

import { AlbumCard } from "../../components/site/album-card"
import { SiteFooter } from "../../components/site/site-footer"
import { SiteHeader } from "../../components/site/site-header"
import { getAlbums, getHomePage } from "../../sanity/lib/site"

export const metadata: Metadata = {
  title: "Photo Albums | Tasty Techno",
  description: "Curated visual records from Tasty Techno events.",
  alternates: { canonical: "/albums" },
}

export const revalidate = 300

export default async function AlbumsPage() {
  const [albums, home] = await Promise.all([getAlbums(), getHomePage()])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <header className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Tasty Techno
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">Photo albums</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Curated visual records from Tasty Techno events.
          </p>
        </header>

        <section aria-labelledby="album-list-heading" className="mt-12">
          <h2 id="album-list-heading" className="sr-only">
            Albums
          </h2>
          <div className="grid gap-7 md:grid-cols-2">
            {albums.map((album) => (
              <AlbumCard key={album.slug} album={album} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter inquiryEmail={home.inquiryEmail} socialLinks={home.socialLinks} />
    </div>
  )
}
