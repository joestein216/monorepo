'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {useClient, useCurrentUser, type CurrentUser} from 'sanity'
import {IntentLink} from 'sanity/router'
import type {BackstageQueryResult} from '../../../sanity.types'
import {backstageQuery} from '../../queries/backstage'
import {SanityImage} from '../../../components/site/sanity-image'
import styles from './backstage.module.css'

type Event = BackstageQueryResult['events'][number]
type Opportunity = BackstageQueryResult['opportunities'][number]

export function canUseBackstage(user: Pick<CurrentUser, 'roles'> | null) {
  return Boolean(user?.roles.some(({name}) => name === 'administrator' || name === 'editor'))
}

export function BackstageTool() {
  const user = useCurrentUser()
  return canUseBackstage(user) ? <BackstageBoard /> : <p role="alert">Backstage is available to editors and administrators.</p>
}

function BackstageBoard() {
  const userForMutation = useCurrentUser()
  const studioClient = useClient({apiVersion: '2026-11-01'})
  const client = useMemo(() => studioClient.withConfig({useCdn: false, perspective: 'published', stega: false, maxRetries: 0}), [studioClient])
  const [data, setData] = useState<BackstageQueryResult | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loadedAt, setLoadedAt] = useState<Date | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    const result = await client.fetch(backstageQuery, {}, {signal})
    setData(result)
    setLoadedAt(new Date())
  }, [client])

  useEffect(() => {
    const controller = new AbortController()
    client.fetch(backstageQuery, {}, {signal: controller.signal}).then((result) => {
      if (controller.signal.aborted) return
      setData(result)
      setLoadedAt(new Date())
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Backstage could not load.')
    })
    return () => controller.abort()
  }, [client])

  async function refresh() {
    setRefreshing(true)
    setError('')
    try { await load() } catch (cause) { setError(cause instanceof Error ? cause.message : 'Refresh failed.') }
    finally { setRefreshing(false) }
  }

  async function feature(mode: 'nextEvent' | 'selected' | 'hidden', id?: string) {
    if (!canUseBackstage(userForMutation) || saving || !data) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      let patch = client.patch('backstageBoard').set({focusMode: mode})
      patch = mode === 'selected' && id ? patch.set({featuredItem: {_type: 'reference', _ref: id}}) : patch.unset(['featuredItem'])
      if (data.board) {
        await patch.ifRevisionId(data.board._rev).commit()
      } else {
        await client.transaction().createIfNotExists({_id: 'backstageBoard', _type: 'backstageBoard', focusMode: 'nextEvent'}).patch(patch).commit()
      }
      await load()
      setMessage(mode === 'hidden' ? 'Feature cleared. The item stays in its group.' : 'Backstage feature saved for everyone.')
    } catch (cause) {
      setError(`${cause instanceof Error ? cause.message : 'Could not save the feature.'} Refresh before trying again.`)
    } finally { setSaving(false) }
  }

  const now = loadedAt?.getTime() ?? 0
  const upcoming = data?.events.filter((event) => {
    if (event.status !== 'upcoming' || !event.startsAt) return false
    const start = Date.parse(event.startsAt)
    const end = event.endsAt ? Date.parse(event.endsAt) : start
    return Number.isFinite(start) && Number.isFinite(end) && end >= start && end > now
  }) ?? []
  const nextEvent = upcoming[0]
  const mode = data?.board?.focusMode ?? 'nextEvent'
  const selectedEvent = upcoming.find((item) => item._id === data?.board?.featuredId)
  const selectedOpportunity = data?.opportunities.find((item) => item._id === data.board?.featuredId)
  const featured = mode === 'hidden' ? undefined : mode === 'selected' ? selectedEvent ?? selectedOpportunity ?? nextEvent : nextEvent
  const featuredId = featured?._id
  const referenceEvent = upcoming.find((item) => item.slug === 'into-haven-2026-11-27')
  const copyEvent = nextEvent ? [nextEvent.title, nextEvent.dateDisplay, [nextEvent.venue, nextEvent.location].filter(Boolean).join(' · '), nextEvent.summary].filter(Boolean).join('\n\n') : ''

  const featureButton = (item: Event | Opportunity) => (
    <button type="button" disabled={saving || refreshing} aria-pressed={featuredId === item._id} aria-label={`${featuredId === item._id ? 'Unfeature' : 'Feature'} ${item.title}`} onClick={() => feature(featuredId === item._id ? 'hidden' : 'selected', item._id)}>
      {featuredId === item._id ? 'Unfeature' : 'Feature this'}
    </button>
  )

  const opportunityContent = (item: Opportunity) => <>
    <p>{item.summary}</p>
    {item.address ? <address>{item.address}</address> : null}
    {item.nextStep ? <p data-slot="next-step">Next: {item.nextStep}</p> : null}
    <div data-slot="actions">
      <a href={item.actionUrl || item.sourceUrl || undefined} target="_blank" rel="noreferrer">{item.actionLabel || 'Visit the website'} ↗</a>
      {featureButton(item)}
      <IntentLink intent="edit" params={{id: item._id, type: 'backstageOpportunity'}}>Edit opportunity</IntentLink>
    </div>
    <p data-slot="source">Source checked {item.sourceCheckedAt || 'date not recorded'} · <a href={item.sourceUrl || undefined} target="_blank" rel="noreferrer">Official source ↗</a></p>
  </>

  return <div className={styles.board}>
    <header data-slot="board-heading">
      <div><p data-slot="eyebrow">Tasty Techno / Backstage</p><h1>A little room to look ahead.</h1><p>This week’s work, and the places it could lead.</p></div>
      <div><button type="button" disabled={refreshing || saving} onClick={refresh}>{refreshing ? 'Refreshing…' : 'Refresh the view'}</button><p data-slot="source">{loadedAt ? `Snapshot · ${loadedAt.toLocaleString()}` : 'Loading your workspace…'}</p></div>
    </header>
    {error ? <p role="alert" data-slot="notice">{error}</p> : null}
    <p role="status" aria-live="polite" data-slot="save-message">{saving ? 'Saving feature…' : message}</p>
    {data ? <main>
      <section aria-labelledby="focus-heading" data-slot="spotlight">
        <header><p data-slot="eyebrow">In focus</p><h2 id="focus-heading">{featured?.title || 'Leave a little space.'}</h2></header>
        {featured && 'startsAt' in featured ? <div data-slot="event-focus">
          <div><p data-slot="date">{featured.dateDisplay || (featured.startsAt ? new Intl.DateTimeFormat('en-US', {dateStyle: 'full', timeStyle: 'short', timeZone: 'America/New_York'}).format(new Date(featured.startsAt)) : 'Date to be confirmed')}</p><address>{[featured.venue, featured.location].filter(Boolean).join(' · ')}</address><p>{featured.summary}</p><div data-slot="actions"><a href={`/events/${featured.slug}`} target="_blank" rel="noreferrer">See the public event ↗</a>{featureButton(featured)}</div></div>
          {featured.image ? <figure data-slot="frame"><SanityImage image={featured.image} alt={featured.image.alt} sizes="(max-width: 767px) 90vw, 28vw" /></figure> : null}
        </div> : featured && 'sourceUrl' in featured ? opportunityContent(featured) : <p>{mode === 'hidden' ? 'Nothing is featured. Everything is still available below.' : 'There isn’t an upcoming event to feature yet.'}</p>}
        <div data-slot="focus-options"><button type="button" disabled={saving || refreshing} onClick={() => feature('nextEvent')}>Follow the next event</button><span>One featured item. Your choice is shared with Frank.</span></div>
      </section>

      <div data-slot="groups">
        <section aria-labelledby="promote-heading" data-slot="group">
          <header><p data-slot="eyebrow">01 / Promote</p><h2 id="promote-heading">Bring people into the night.</h2><p>Preparation examples for {nextEvent?.title || 'your next event'}. Platform activity isn’t monitored.</p></header>
          {referenceEvent?.eventUrl === 'https://ra.co/events/2590968' ? <article data-slot="card" data-complete="true"><p data-slot="eyebrow">Resident Advisor · Finished business</p><h3>Mikey’s party is listed.</h3><p>You confirmed this one is published. Keep the listing close for reference.</p><a href={referenceEvent.eventUrl} target="_blank" rel="noreferrer">Open the RA listing ↗</a><p data-slot="source">Manually confirmed · November 23, 2026</p></article> : null}
          {nextEvent ? <>
            <article data-slot="card"><p data-slot="eyebrow">Instagram · Preparation example</p><h3>Give the night a little airtime.</h3><p>Review the flyer alongside a starting caption. Edit the final presentation in Instagram.</p><details><summary>Review the starting caption</summary><p data-slot="caption">{copyEvent}</p></details><div data-slot="actions"><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(copyEvent); setMessage('Event copy copied. Nothing was posted.')} catch {setError('Clipboard unavailable. Select and copy the caption above.')} }}>Copy event text</button><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Open Instagram ↗</a></div></article>
            {[
              {name: 'Posh', title: 'Prepare the Posh listing.', href: 'https://posh.vip/'},
              {name: 'Shotgun', title: 'Make room on Shotgun.', href: 'https://shotgun.live/'},
              {name: 'Facebook', title: 'Bring it to the feed.', href: 'https://www.facebook.com/'},
            ].map((destination) => <article data-slot="card" key={destination.name}><p data-slot="eyebrow">{destination.name} · Preparation example</p><h3>{destination.title}</h3><p>Start with the event facts. Destination-specific content and publication status still need review.</p><a href={destination.href} target="_blank" rel="noreferrer">Open {destination.name} ↗</a></article>)}
          </> : <article data-slot="card"><h3>A clear slate.</h3><p>Add and publish the next event in Structure to begin preparing it here.</p></article>}
          {upcoming.map((event) => <article data-slot="card" key={event._id}><p data-slot="eyebrow">Upcoming event</p><h3>{event.title}</h3><p>{event.dateDisplay}</p>{featureButton(event)}</article>)}
        </section>
        {(['research', 'engage'] as const).map((group) => <section aria-labelledby={`${group}-heading`} data-slot="group" key={group}>
          <header><p data-slot="eyebrow">{group === 'research' ? '02 / Research' : '03 / Engage'}</p><h2 id={`${group}-heading`}>{group === 'research' ? 'Go where the music is.' : 'Give the next connection a start.'}</h2><p>{group === 'research' ? 'Experience the room before you try to play it.' : 'A real opening, with a manageable next step.'}</p></header>
          {data.opportunities.filter((item) => item.group === group).map((item) => <article data-slot="card" key={item._id}><h3>{item.title}</h3>{opportunityContent(item)}</article>)}
        </section>)}
      </div>
      <footer><p>This is a working view: real event content and sourced opportunities, with clearly labeled preparation examples. No posts, submissions, or performance measurements are automated.</p><p>Events leave the upcoming view when they end. Opportunity details stay until you edit or remove them in Structure.</p></footer>
    </main> : null}
  </div>
}
