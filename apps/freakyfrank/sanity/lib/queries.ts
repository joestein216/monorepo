import { defineQuery } from "next-sanity";

const image = `{asset, crop, hotspot, alt, "src": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height}`;
const artist = `*[_type == "artistPage" && slug.current == "freaky-frank"][0]`;
const identity = `${artist}{name, positioning, tagline, shortBio, bookingEmail, genres, location, "heroImage": heroImage${image}, "primaryLogo": primaryLogo${image}, "wordmark": wordmark${image}, externalLinks[]{_key, label, href}}`;
const settings = `*[_type == "siteSettings"] | order(_updatedAt desc)[0]{siteTitle, siteDescription, heroStatement, "heroPortrait": heroPortrait${image}, "logo": logo${image}, "crowdImage": crowdImage${image}, "recordStoreHeroImage": recordStoreHeroImage${image}, recordStoreTitle, recordStoreDescription, managementEmail, pressEmail, socialLinks[]{_key, label, href}}`;
const home = `*[_type == "homePage"] | order(_updatedAt desc)[0]{heading, introduction, inquiryEmail, socialLinks[]{_key,label,href}}`;
// Date-only events are compared against the current New York calendar day.
const eventDate = `coalesce(startsAt, eventDate)`;
const eventFields = `{_id, title, status, startsAt, eventDate, endsAt, dateDisplay, venue, location, summary, "url": eventUrl, "slug": slug.current, "image": heroImage${image}}`;
const upcoming = `*[_type == "event" && ((defined(startsAt) && dateTime(startsAt) >= dateTime(now())) || (!defined(startsAt) && eventDate >= $today))] | order(${eventDate} asc)${eventFields}`;
const past = `*[_type == "event" && ((defined(startsAt) && dateTime(startsAt) < dateTime(now())) || (!defined(startsAt) && eventDate < $today))] | order(${eventDate} desc)${eventFields}`;
const pending = `*[_type == "event" && !defined(startsAt) && !defined(eventDate)] | order(sortOrder asc)${eventFields}`;
const mixes = `${artist}.audioEmbeds[]{_key, title, provider, sourceUrl, embedUrl, details, streamUrl, uploadDate, duration}`;
const videos = `${artist}.videos[]{_key, title, externalUrl, "fileUrl": file.asset->url, caption, uploadDate, duration, "poster": poster${image}}`;
const items = `*[_type == "recordStoreItem"] | order(sortOrder asc, title asc){_id, title, "slug": slug.current, category, description, "image": image${image}, price, currency, purchaseUrl, availability}`;

export const PUBLIC_HOME_QUERY = defineQuery(
  `{"artist": ${identity}, "settings": ${settings}, "home": ${home}, "upcoming": ${upcoming}, "past": ${past}, "pending": ${pending}, "mixes": ${mixes}, "videos": ${videos}, "items": ${items}, "updates": *[_type == "photoAlbum"] | order(_createdAt desc)[0...6]{_id,title,summary,"image": coverPhoto->image${image}}}`,
);
export const PUBLIC_EVENTS_QUERY = defineQuery(
  `{"upcoming": ${upcoming}, "past": ${past}, "pending": ${pending}}`,
);
export const PUBLIC_MIXES_QUERY = defineQuery(mixes);
export const PUBLIC_VIDEOS_QUERY = defineQuery(videos);
export const PUBLIC_STORE_QUERY = defineQuery(
  `{"settings": ${settings}, "items": ${items}}`,
);
export const PUBLIC_CONTACT_QUERY = defineQuery(
  `{"artist": ${identity}, "settings": ${settings}, "home": ${home}}`,
);
export const PUBLIC_SITEMAP_QUERY = defineQuery(
  `*[_type in ["event", "recordStoreItem"] && defined(slug.current)]{_type, "slug": slug.current, _updatedAt}`,
);
