import type { PUBLIC_HOME_QUERY_RESULT } from "../../sanity.types";

export type SiteData = PUBLIC_HOME_QUERY_RESULT;
export type SiteImage = NonNullable<
  NonNullable<SiteData["artist"]>["heroImage"]
>;
export type Mix = NonNullable<SiteData["mixes"]>[number];
export type Video = NonNullable<SiteData["videos"]>[number];
export type Event = SiteData["upcoming"][number];
export type StoreItem = SiteData["items"][number];
