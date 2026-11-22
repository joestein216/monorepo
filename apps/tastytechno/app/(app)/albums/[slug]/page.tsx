import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { SanityImage } from "../../../../components/site/sanity-image"
import { SiteFooter } from "../../../../components/site/site-footer"
import { SiteHeader } from "../../../../components/site/site-header"
import { getOpenGraphImageUrl } from "../../../../sanity/lib/image"
import { getAlbumBySlug, getAlbumSlugs, getHomePage } from "../../../../sanity/queries/site"

type AlbumPageProps = {
  params: Promise<{ slug: string }>
}

export const revalidate = 300

export async function generateStaticParams() {
  return (await getAlbumSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> {
  const { slug } = await params
  const album = await getAlbumBySlug(slug, { stega: false })
  if (!album) return { title: "Album not found | Tasty Techno" }

  const title = album.seo?.metaTitle?.trim() || `${album.title} | Tasty Techno`
  const description = album.seo?.metaDescription?.trim() || album.summary || undefined
  const socialImage = album.seo?.openGraphImage ?? album.coverPhoto?.image
  const socialImageUrl = getOpenGraphImageUrl(socialImage)

  return {
    title,
    description,
    alternates: { canonical: `/albums/${album.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/albums/${album.slug}`,
      images: socialImageUrl && socialImage ? [{ url: socialImageUrl, alt: socialImage.alt || "" }] : undefined,
    },
  }
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { slug } = await params
  const [album, home] = await Promise.all([getAlbumBySlug(slug), getHomePage()])
  if (!album) notFound()

  return (
    home && <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main id="main-content">
        <header className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
          <Link className="text-sm text-muted-foreground underline underline-offset-4" href="/albums">
            Photo albums
          </Link>
          <p className="mt-8 text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Tasty Techno gallery
          </p>
          <h1 className="mt-3 max-w-5xl text-4xl font-semibold tracking-tight sm:text-6xl">
            {album.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{album.summary}</p>
          {album.relatedEvent ? (
            <Link
              className="mt-6 inline-flex text-sm font-medium underline underline-offset-4"
              href={`/events/${album.relatedEvent.slug}`}
            >
              View the related event
            </Link>
          ) : null}
        </header>

        <section aria-labelledby="photos-heading" className="mx-auto w-full max-w-6xl px-6 pb-20">
          <h2 id="photos-heading" className="sr-only">
            Album photos
          </h2>
          {album.photos?.length ? (
            <div className="columns-1 gap-6 md:columns-2">
              {album.photos.map((placement) => {
                const image = placement.photo?.image
                if (!image) return null

                return (
                  <figure key={placement.key} className="mb-6 break-inside-avoid">
                    <SanityImage
                      image={image}
                      alt={image.alt || album.title}
                      sizes="(max-width: 767px) 100vw, 50vw"
                      className="h-auto w-full rounded-2xl"
                    />
                    {placement.captionOverride || image.caption || image.credit ? (
                      <figcaption className="mt-3 text-sm leading-6 text-muted-foreground">
                        {[placement.captionOverride || image.caption, image.credit].filter(Boolean).join(" · ")}
                      </figcaption>
                    ) : null}
                  </figure>
                )
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-border p-8 text-muted-foreground">
              Photos are being curated for this album.
            </p>
          )}
        </section>
      </main>
      <SiteFooter inquiryEmail={home.inquiryEmail} socialLinks={home.socialLinks} />
    </div>
  )
}
