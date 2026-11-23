import Link from 'next/link'
import {SiteHeader} from '../../components/site/site-header'
import {SiteFooter} from '../../components/site/site-footer'

export default function NotFound() {
  return <>
    <SiteHeader />
    <main id="main-content" className="mx-auto w-full max-w-6xl px-6 py-20">
      <section data-slot="content-panel" aria-labelledby="missing-heading">
        <p>404</p>
        <h1 id="missing-heading" className="my-5 text-4xl">This page isn’t here.</h1>
        <p>The address may have changed. You can still find the next night, the artists, and the photographs.</p>
        <nav aria-label="Find your way" className="mt-6 flex flex-wrap gap-6 underline">
          <Link href="/">Back to the homepage</Link><Link href="/events">Browse events</Link><Link href="/albums">Explore photographs</Link>
        </nav>
      </section>
    </main>
    <SiteFooter />
  </>
}
