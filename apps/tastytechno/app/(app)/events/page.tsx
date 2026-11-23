import type { Metadata } from "next"

import { EventCard } from "../../../components/site/event-card"
import { SiteFooter } from "../../../components/site/site-footer"
import { SiteHeader } from "../../../components/site/site-header"
import { getEvents, getHomePage } from "../../../sanity/queries/site"
import { EventBySlugQueryResult } from "../../../sanity.types"

export const metadata: Metadata = {
  title: "Events | Tasty Techno",
  description: "Into: Haven nights, upcoming gatherings, and the events behind us.",
  alternates: { canonical: "/events" },
}

export const revalidate = 300

export default async function EventsPage() {
  const [events, home] = await Promise.all([getEvents(), getHomePage()])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main id="main-content" className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <header className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Tasty Techno
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">Events</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Into: Haven nights, upcoming gatherings, and the events behind us.
          </p>
        </header>

        <section aria-labelledby="event-list-heading" className="mt-12">
          <h2 id="event-list-heading" className="sr-only">
            Event archive
          </h2>
          <div className="grid gap-7 lg:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.slug} event={event as EventBySlugQueryResult} />
            ))}
            {!events.length ? <p data-slot="content-panel">The next event will appear here once it’s announced.</p> : null}
          </div>
        </section>
      </main>
      <SiteFooter inquiryEmail={home?.inquiryEmail} socialLinks={home?.socialLinks} />
    </div>
  )
}
