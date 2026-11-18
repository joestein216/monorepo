import "server-only";
import { cache } from "react";
import { client } from "@/sanity/lib/client";
import { token } from "@/sanity/lib/token";
import { PORTFOLIO_CONTEXT_QUERY, COLOPHON_PAGE_QUERY } from "@/sanity/lib/queries";
import { getStarterTopics, type PortfolioData, type StarterTopic } from "./portfolio-topics";

export type PortfolioContext = PortfolioData & { starterTopics: StarterTopic[] };

export const getPortfolioData = cache(async (): Promise<PortfolioData> => client.fetch(PORTFOLIO_CONTEXT_QUERY, {}, {
  perspective: "published",
  stega: false,
  useCdn: false,
  token,
  cache: "no-store",
}));

export const getSanityContext = cache(async (): Promise<PortfolioContext> => {
  const context = await getPortfolioData();
  return { ...context, starterTopics: getStarterTopics(context) };
});

export const getColophonPage = cache(async () => client.fetch(COLOPHON_PAGE_QUERY, {}, {
  perspective: "published", stega: false, useCdn: false, token, cache: "no-store",
}));
