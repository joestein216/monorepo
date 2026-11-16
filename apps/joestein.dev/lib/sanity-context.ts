import "server-only";
import { cache } from "react";
import { client } from "@/sanity/lib/client";
import { token } from "@/sanity/lib/token";
import { PORTFOLIO_CONTEXT_QUERY } from "@/sanity/lib/queries";
import type { PORTFOLIO_CONTEXT_QUERY_RESULT } from "@/sanity.types";

export type PortfolioContext = PORTFOLIO_CONTEXT_QUERY_RESULT;

// Explicitly published and unencoded for both the AI prompt and the public page.
// Next's data cache refreshes published edits after at most 60 seconds.
export const getSanityContext = cache(async (): Promise<PortfolioContext> =>
  client.fetch(PORTFOLIO_CONTEXT_QUERY, {}, {
    perspective: "published",
    stega: false,
    useCdn: false,
    token,
    next: { revalidate: 60, tags: ["portfolio"] },
  }),
);
