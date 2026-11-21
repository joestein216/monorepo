import type { MetadataRoute } from "next";
import { client } from "../sanity/lib/client";
import { PUBLIC_SITEMAP_QUERY } from "../sanity/lib/queries";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://freakyfrank.com";
  const entries = await client.fetch(
    PUBLIC_SITEMAP_QUERY,
    {},
    { stega: false, perspective: "published", next: { revalidate: 300 } },
  );
  // Records currently have addressable anchors in their catalogs, not detail routes.
  // Keep the sitemap limited to real pages and use CMS changes for lastModified.
  const modified = (type: string) =>
    entries
      .filter((item) => item._type === type)
      .map((item) => item._updatedAt)
      .sort()
      .at(-1);
  return [
    "/",
    "/events",
    "/mixes",
    "/videos",
    "/record-store",
    "/contact",
    "/epk",
  ].map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
    lastModified:
      path === "/events"
        ? modified("event")
        : path === "/record-store"
          ? modified("recordStoreItem")
          : undefined,
  }));
}
