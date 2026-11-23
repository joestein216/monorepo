import {defineQuery} from 'next-sanity'

export const backstageQuery = defineQuery(`{
  "board": *[_id == "backstageBoard"][0]{_id, _rev, focusMode, "featuredId": featuredItem._ref},
  "events": *[_type == "event" && status == "upcoming" && defined(slug.current) && dateTime(coalesce(endsAt, startsAt)) > dateTime(now())] | order(startsAt asc)[0...50]{
    _id, title, status, startsAt, endsAt, dateDisplay, venue, location, summary, eventUrl,
    "slug": slug.current,
    "image": heroImage{asset, crop, hotspot, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, "lqip": asset->metadata.lqip}
  },
  "opportunities": *[_type == "backstageOpportunity"] | order(title asc){
    _id, title, group, summary, address, nextStep, sourceUrl, sourceCheckedAt, actionUrl, actionLabel
  }
}`)
