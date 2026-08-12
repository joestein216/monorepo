import Image from "next/image"
import Link from "next/link"

import { getSiteImageUrl } from "../../sanity/lib/image"
import type { SitePhotoAlbum } from "../../sanity/lib/site"

type AlbumCardProps = {
  album: SitePhotoAlbum
  featured?: boolean
}

export function AlbumCard({ album, featured = false }: AlbumCardProps) {
  const cover = album.coverPhoto?.image
  const imageUrl = cover
    ? getSiteImageUrl(cover, { width: featured ? 1600 : 1000, height: featured ? 1000 : 750 })
    : null

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      {imageUrl && cover ? (
        <Link
          className={`relative block bg-muted ${featured ? "aspect-[8/5]" : "aspect-[4/3]"}`}
          href={`/albums/${album.slug}`}
          aria-label={`View ${album.title}`}
        >
          <Image
            src={imageUrl}
            alt={cover.alt}
            fill
            sizes={featured ? "(max-width: 1023px) 100vw, 66vw" : "(max-width: 767px) 100vw, 50vw"}
            className="object-cover"
          />
        </Link>
      ) : null}
      <div className="p-6 sm:p-7">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Photo album
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          <Link className="underline-offset-4 hover:underline" href={`/albums/${album.slug}`}>
            {album.title}
          </Link>
        </h3>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{album.summary}</p>
        <Link
          className="mt-5 inline-flex text-sm font-medium underline underline-offset-4"
          href={`/albums/${album.slug}`}
        >
          View album
        </Link>
      </div>
    </article>
  )
}
