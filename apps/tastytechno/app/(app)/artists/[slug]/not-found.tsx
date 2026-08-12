import Link from "next/link"

export default function ArtistNotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-20">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Artist not found</h1>
      <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
        This artist page may still be in production, or its address may have changed.
      </p>
      <Link className="mt-8 inline-flex font-medium underline underline-offset-4" href="/artists">
        Browse Tasty Techno artists
      </Link>
    </main>
  )
}
