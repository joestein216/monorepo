import { tool, type InferUITools, type UIMessage } from "ai";
import { z } from "zod";
import type { PortfolioData } from "./portfolio-topics";
import { followUpsSchema } from "./portfolio-topics";

export const receiptsInputSchema = z.object({
  receipts: z.array(z.object({
    id: z.string().min(1).describe(
      "Copy the exact achievement _key or project _id from SANITY_PORTFOLIO_JSON. Never invent or rewrite an ID, or substitute a slug, title, or starter-topic ID. Achievement keys must identify exactly one achievement across the portfolio.",
    ),
    type: z.enum(["achievement", "project"]).optional().describe(
      "Optional disambiguation hint. The server determines and returns receipt type from the matching Sanity record. Omit when the ID uniquely identifies one record.",
    ),
    relevanceScore: z.number().min(1).max(100).describe(
      "An honest 1–100 score for how strongly this work substantiates the visitor’s specific prompt. Score projects and achievements together on the same relevance scale, without a type preference. Score the evidence, not merely a keyword match.",
    ),
    matchReason: z.string().trim().min(1).describe(
      "A concise note explaining why this particular accomplishment or project matches the visitor’s question.",
    ),
    tailoredNarrative: z.string().trim().min(1).describe(
      "A complete, self-contained 2–3 sentence third-person engineering vignette combining the outcome and technical implementation from the achievement bullet and deepDive, or project problem and architectureNotes. Explain its relevance to the visitor. Say Joe/he/his; use only facts from that record. The full story must be readable immediately without opening a disclosure.",
    ),
  })).max(3).describe(
    "The strongest zero to three genuinely relevant achievements and projects, ranked together with honest relevance scores. Never pad with unrelated work. Use an empty array when nothing matches.",
  ),
});

export function createPortfolioTools(context: PortfolioData) {
  return {
    suggestFollowUps: tool({
      description: "Alongside the portfolio response, suggest three short questions that go deeper into the current question using the prose summary just written and its supporting evidence. Each question is the exact visible button text and submitted prompt: one focus, usually 5–10 words, at most 65 characters. Explore a documented mechanism, decision, or outcome within the current subject, rather than unrelated adjacent topics. Prefer questions beyond what the summary already fully answered. Older conversation is background, not the current topic. Suggestions are first-class prompts with contextual origin, not a navigation hierarchy.",
      inputSchema: followUpsSchema,
      execute: async ({ suggestions }) => suggestions,
    }),
    showReceipts: tool({
      description: "After a concise third-person prose summary, call once with at most three of the strongest genuinely relevant achievements/projects. Include exact Sanity _key/_id values, an honest relevanceScore from 1–100, a concise matchReason, and a complete 2–3 sentence third-person tailoredNarrative weaving the outcome and engineering implementation into a self-contained vignette. Use fewer than three when the evidence is limited; never pad with unrelated work. The server infers receipt type from an unambiguous ID, hydrates metadata, and sorts by relevance; unknown or ambiguous IDs are discarded. Do not use for explicit download or full-overview requests.",
      inputSchema: receiptsInputSchema,
      execute: async ({ receipts }) => {
        const hydrated = [];
        const seen = new Set<string>();

        // Rank before deduplication so a repeated ID keeps its strongest match.
        const ranked = [...receipts].sort((a, b) => b.relevanceScore - a.relevanceScore);
        for (const receipt of ranked) {
          const project = context.projects.find((item) => item._id === receipt.id);
          const matches = context.roles.flatMap((role) =>
            (role.achievements ?? [])
              .filter((achievement) => achievement._key === receipt.id)
              .map((achievement) => ({ role, achievement })),
          );
          // Type is authoritative server metadata too. Missing model hints are
          // safe only when the exact pointer identifies one record globally.
          if (!receipt.type && (Number(Boolean(project)) + matches.length !== 1)) continue;
          const type = receipt.type ?? (project ? "project" : "achievement");
          if (type === "project" ? !project : matches.length !== 1) continue;
          const identity = `${type}:${receipt.id}`;
          if (seen.has(identity)) continue;
          seen.add(identity);

          if (type === "project" && project) {
            hydrated.push({
              type: "project" as const,
              id: project._id,
              relevanceScore: receipt.relevanceScore,
              matchReason: receipt.matchReason,
              tailoredNarrative: receipt.tailoredNarrative,
              title: project.title,
              subtitle: project.subtitle,
              technologies: project.techStack,
              liveUrl: project.liveUrl,
              repoUrl: project.repoUrl,
              architectureNotes: project.architectureNotes,
            });
          } else {
            const { role, achievement } = matches[0];
            hydrated.push({
              type: "achievement" as const,
              id: achievement._key,
              relevanceScore: receipt.relevanceScore,
              matchReason: receipt.matchReason,
              tailoredNarrative: receipt.tailoredNarrative,
              roleId: role._id,
              roleTitle: role.title,
              company: role.company,
              dateRange: role.dateRange,
              technologies: achievement.technologies,
              deepDive: achievement.deepDive,
            });
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
