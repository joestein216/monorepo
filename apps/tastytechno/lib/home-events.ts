import { stegaClean } from "@sanity/client/stega"
import type { SiteEvent } from "../sanity/queries/site"

/** A missing end time cannot establish that an event is still in progress. */
export function getHomeEvents(events: SiteEvent[], now: number = Date.now()) {
  const cleanEvents = stegaClean(events)
  const isCurrent = (event: (typeof cleanEvents)[number]) => {
    if (["past", "cancelled", "tba"].includes(event.status ?? "")) return false
    const starts = Date.parse(event.startsAt ?? "")
    if (!Number.isFinite(starts)) return false
    if (!event.endsAt) return starts >= now
    const ends = Date.parse(event.endsAt)
    return Number.isFinite(ends) && ends > starts && ends > now
  }

  return {
    upcoming: cleanEvents.filter(isCurrent).sort((a, b) => Date.parse(a.startsAt!) - Date.parse(b.startsAt!)),
    archive: cleanEvents.filter((event) => {
      if (["cancelled", "tba"].includes(event.status ?? "")) return false
      const end = Date.parse(event.endsAt ?? event.startsAt ?? "")
      return event.status === "past" || (Number.isFinite(end) && end <= now)
    }).sort((a, b) => Date.parse(b.startsAt ?? b.eventDate ?? "") - Date.parse(a.startsAt ?? a.eventDate ?? "")),
  }
}
