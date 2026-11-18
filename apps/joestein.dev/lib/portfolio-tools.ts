import { tool, type InferUITools, type UIMessage } from "ai";
import { z } from "zod";
import type { PortfolioData } from "./portfolio-topics";
import { followUpsSchema } from "./portfolio-topics";
import { getReceiptCatalog } from "./receipt-catalog";

export const receiptsInputSchema = z.object({
  receipts: z.array(z.object({
    id: z.string().min(1).describe(
      "Copy an exact id from SANITY_PORTFOLIO_JSON.receiptCatalog. Only these entries are selectable. Never use a role ID, slug, title, or starter-topic ID.",
    ),
    relevanceScore: z.number().min(1).max(100).describe(
      "An honest 1–100 score for how strongly this work substantiates the visitor’s specific prompt. Score projects and achievements together on the same relevance scale, without a type preference. Score the evidence, not merely a keyword match.",
    ),
    matchReason: z.string().trim().optional().describe(
      "Optional concise explanation of this match. Omit when unavailable; the receipt remains valid without a separate reason.",
    ),
    tailoredNarrative: z.string().trim().min(1).describe(
      "A complete, self-contained 2–3 sentence third-person engineering vignette combining the outcome and technical implementation from the achievement bullet and deepDive, or project problem and architectureNotes. Explain its relevance to the visitor. Say Joe/he/his; use only facts from that record. The full story must be readable immediately without opening a disclosure.",
    ),
  })).max(3).describe(
    "The strongest zero to three genuinely relevant achievements and projects, ranked together with honest relevance scores. Never pad with unrelated work. Use an empty array when nothing matches.",
  ),
});

export function createPortfolioTools(context: PortfolioData) {
  const catalog = new Map(getReceiptCatalog(context).map((record) => [record.id, record]));
  return {
    suggestFollowUps: tool({
      description: "Call alongside the core rendering tool in the same step to render three contextual question buttons. Omit only when the portfolio cannot support three useful grounded questions. Suggest three short questions that go deeper into the current question using the prose summary just written and its supporting evidence. Each question is the exact visible button text and submitted prompt: one focus, usually 5–10 words, at most 65 characters. Explore a documented mechanism, decision, or outcome within the current subject, rather than unrelated adjacent topics. Prefer questions beyond what the summary already fully answered. Older conversation is background, not the current topic. Suggestions are first-class prompts with contextual origin, not a navigation hierarchy.",
      inputSchema: followUpsSchema,
      execute: async ({ suggestions }) => suggestions,
    }),
    showReceipts: tool({
      description: "Required evidence-card renderer for experience, project, technology, and engineering answers, even when the supplied JSON already answers the question. After a concise third-person prose summary, call once with at most three of the strongest genuinely relevant achievements/projects. Select exact ids from SANITY_PORTFOLIO_JSON.receiptCatalog, an honest relevanceScore from 1–100, an optional matchReason, and a complete 2–3 sentence third-person tailoredNarrative weaving the outcome and engineering implementation into a self-contained vignette. Use fewer than three when the evidence is limited; never pad with unrelated work. Do not supply a type field. The server owns receipt type and metadata and sorts by relevance; unknown or ambiguous IDs are discarded. Do not use for explicit download or full-overview requests.",
      inputSchema: receiptsInputSchema,
      execute: async ({ receipts }) => {
        const hydrated = [];
        const seen = new Set<string>();

        // Rank before deduplication so a repeated ID keeps its strongest match.
        const ranked = [...receipts].sort((a, b) => b.relevanceScore - a.relevanceScore);
        for (const receipt of ranked) {
          const record = catalog.get(receipt.id);
          if (!record || seen.has(record.id)) continue;
          seen.add(record.id);
          const generated = {
            id: record.id, relevanceScore: receipt.relevanceScore,
            matchReason: receipt.matchReason?.trim() || undefined,
            tailoredNarrative: receipt.tailoredNarrative,
          };
          if (record.type === "project") {
            hydrated.push({ ...record.metadata, ...generated, type: "project" as const });
          } else {
            hydrated.push({ ...record.metadata, ...generated, type: "achievement" as const });
          }
        }
        return hydrated.slice(0, 3);
      },
    }),
    showDownloads: tool({
      description: "Render Joe's published resume download links from Sanity, only when the visitor explicitly requests resumes or downloads.",
      inputSchema: z.object({}),
      execute: async () => context.about?.downloads ?? [],
    }),
    showOverview: tool({
      description: "Render Joe's full portfolio overview: about, projects, default experience achievements, downloads, and contact. Use only for explicit full-overview or full-site requests such as 'Show full overview'.",
      inputSchema: z.object({}),
      execute: async () => ({ ...context, roles: context.roles.map((role) => ({
        ...role, achievements: (role.achievements ?? []).filter((achievement) => achievement.includeInDefaultOverview),
      })) }),
    }),
  };
}

export type PortfolioReceipt = InferUITools<ReturnType<typeof createPortfolioTools>>["showReceipts"]["output"][number];
export type PortfolioMessage = UIMessage<unknown, never, InferUITools<ReturnType<typeof createPortfolioTools>>>;
