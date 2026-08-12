import type { Metadata } from "next"

import { EventCard } from "../../components/site/event-card"
import { SiteFooter } from "../../components/site/site-footer"
import { SiteHeader } from "../../components/site/site-header"
import { getEvents, getHomePage } from "../../sanity/lib/site"

export const metadata: Metadata = {
  title: "Events | Tasty Techno",
  description: "Past events and future chapters from Tasty Techno.",
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
            Past events and future chapters from Tasty Techno.
          </p>
        </header>

        <section aria-labelledby="event-list-heading" className="mt-12">
          <h2 id="event-list-heading" className="sr-only">
            Event archive
          </h2>
          <div className="grid gap-7 lg:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
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
        </section>
      </main>
      <SiteFooter inquiryEmail={home.inquiryEmail} socialLinks={home.socialLinks} />
    </div>
  )
}
