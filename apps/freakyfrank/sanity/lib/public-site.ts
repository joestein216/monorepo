import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import { client } from "./client";
import {
  PUBLIC_HOME_QUERY,
  PUBLIC_EVENTS_QUERY,
  PUBLIC_MIXES_QUERY,
  PUBLIC_VIDEOS_QUERY,
  PUBLIC_STORE_QUERY,
  PUBLIC_CONTACT_QUERY,
} from "./queries";

async function fetchPublic<const Q extends string>(query: Q) {
  const { isEnabled } = await draftMode();
  return client.withConfig({ useCdn: false, stega: false }).fetch(
    query,
    {
      today: new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
    },
    {
      perspective: isEnabled ? "drafts" : "published",
      token: isEnabled ? process.env.SANITY_API_READ_TOKEN : undefined,
      next: { revalidate: isEnabled ? 0 : 60 },
    },
  );
}
export const getPublicHome = cache(() => fetchPublic(PUBLIC_HOME_QUERY));
export const getPublicEvents = cache(() => fetchPublic(PUBLIC_EVENTS_QUERY));
export const getPublicMixes = cache(() => fetchPublic(PUBLIC_MIXES_QUERY));
export const getPublicVideos = cache(() => fetchPublic(PUBLIC_VIDEOS_QUERY));
export const getPublicStore = cache(() => fetchPublic(PUBLIC_STORE_QUERY));
export const getPublicContact = cache(() => fetchPublic(PUBLIC_CONTACT_QUERY));
