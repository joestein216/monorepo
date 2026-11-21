import type { Metadata } from "next";
import { getPublicContact } from "../../sanity/lib/public-site";
import { getOpenGraphImageUrl } from "../../sanity/lib/image";
import { safeUrl, playerUrl } from "./media";
import type { Event, Mix, Video, SiteData } from "./types";

export const SITE_URL = "https://freakyfrank.com";
export const artistId = `${SITE_URL}/#artist`;
export async function siteMetadata(
  path: string,
  title: string,
  description: string,
): Promise<Metadata> {
  const { artist, settings } = await getPublicContact();
  const image =
    path === "/record-store"
      ? settings?.recordStoreHeroImage || artist?.heroImage
      : settings?.heroPortrait || artist?.heroImage;
  const imageUrl = getOpenGraphImageUrl(image);
  const fullTitle =
    path === "/"
      ? "Freaky Frank | New York Underground DJ"
      : `${title} | Freaky Frank`;
  const images = imageUrl
    ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: image?.alt || "Freaky Frank",
        },
      ]
    : undefined;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      title: fullTitle,
      description,
      url: `${SITE_URL}${path}`,
      siteName: "Freaky Frank",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images,
    },
  };
}
export function artistSchema(
  data: Pick<SiteData, "artist" | "settings" | "home">,
) {
  return {
    "@type": "Person",
    "@id": artistId,
    name: "Freaky Frank",
    alternateName: "DJ Freaky Frank",
    description:
      data.artist?.shortBio ||
      "New York underground DJ. Techno, house, and underground electronic music.",
    url: SITE_URL,
    image: data.artist?.heroImage?.src || undefined,
    jobTitle: "DJ",
    knowsAbout: data.artist?.genres || [
      "Techno",
      "House",
      "Underground Electronic Music",
    ],
    homeLocation: {
      "@type": "Place",
      name: data.artist?.location || "Long Island / New York",
    },
    sameAs: [
      ...new Set(
        [
          ...(data.artist?.externalLinks || []),
          ...(data.settings?.socialLinks || []),
          ...(data.home?.socialLinks || []),
        ]
          .map((link) => safeUrl(link.href))
          .filter(Boolean),
      ),
    ],
  };
}
export function eventSchemas(events: Event[]) {
  return events
    .filter((event) => event.startsAt || event.eventDate)
    .map((event) => ({
      "@type": "MusicEvent",
      "@id": `${SITE_URL}/events#event-${event.slug || event._id}`,
      name: event.title,
      startDate: event.startsAt || event.eventDate,
      endDate: event.endsAt || undefined,
      description: event.summary || undefined,
      eventStatus:
        event.status === "cancelled"
          ? "https://schema.org/EventCancelled"
          : "https://schema.org/EventScheduled",
      location:
        event.venue || event.location
          ? {
              "@type": "Place",
              name: event.venue || event.location,
              address: {
                "@type": "PostalAddress",
                addressLocality: event.location || undefined,
              },
            }
          : undefined,
      performer: { "@id": artistId, "@type": "Person", name: "Freaky Frank" },
      offers: safeUrl(event.url)
        ? { "@type": "Offer", url: safeUrl(event.url) }
        : undefined,
    }));
}
export function mixSchemas(mixes: Mix[]) {
  return mixes.map((mix) => ({
    "@type": "AudioObject",
    name: mix.title,
    description: mix.details || undefined,
    url: safeUrl(mix.sourceUrl),
    embedUrl: playerUrl(mix.embedUrl),
    contentUrl: safeUrl(mix.streamUrl),
    duration: mix.duration || undefined,
    uploadDate: mix.uploadDate || undefined,
    creator: { "@id": artistId },
  }));
}
export function videoSchemas(videos: Video[]) {
  return videos.map((video) => ({
    "@type": "VideoObject",
    name: video.title,
    description: video.caption || video.title,
    thumbnailUrl: video.poster?.src || undefined,
    uploadDate: video.uploadDate || undefined,
    duration: video.duration || undefined,
    embedUrl: playerUrl(video.externalUrl),
    contentUrl: safeUrl(video.fileUrl),
    creator: { "@id": artistId },
  }));
}
