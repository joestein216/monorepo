import { z } from "zod";
import type { PORTFOLIO_CONTEXT_QUERY_RESULT } from "@/sanity.types";

export type PortfolioData = PORTFOLIO_CONTEXT_QUERY_RESULT;
export type StarterTopic = { id: string; label: string; prompt: string };
export type FollowUpSuggestion = { label: string; prompt: string };

export const starterTopicsSchema = z.object({
  starterTopics: z.array(z.object({
    id: z.string().regex(/^[a-z0-9-]+$/).max(100),
    label: z.string().trim().min(1).max(70),
    prompt: z.string().trim().min(1).max(500),
  })).length(8).describe("Eight distinct, non-overlapping chapters covering the breadth and outer edges of the supplied portfolio."),
}).superRefine(({ starterTopics }, ctx) => {
  for (const field of ["id", "label", "prompt"] as const) {
    const values = starterTopics.map((topic) => topic[field].toLowerCase().replace(/\s+/g, " ").trim());
    if (new Set(values).size !== 8) ctx.addIssue({ code: "custom", message: `Topic ${field} values must be distinct.` });
  }
});

export const followUpsSchema = z.object({
  suggestions: z.array(z.object({
    label: z.string().trim().min(1).max(70).describe("A concise 2–4 word label for the next question."),
    prompt: z.string().trim().min(1).max(500).describe("The full next-step question, grounded in Joe’s portfolio and the current conversation."),
  })).length(3),
});

function spread<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  return Array.from({ length: count }, (_, i) => items[Math.round(i * (items.length - 1) / (count - 1))]);
}

export function fallbackStarterTopics(context: PortfolioData): StarterTopic[] {
  const projects = context.projects.map((project) => ({
    id: `project-${project._id}`,
    label: project.title?.split(" — ")[0] || "Project architecture",
    prompt: `Explain Joe’s work on ${project.title || "this project"}, including the problem, implementation, and engineering trade-offs.`,
  }));
  const roles = context.roles.map((role) => ({
    id: `role-${role._id}`,
    label: role.company || role.title || "Engineering experience",
    prompt: `What engineering problems did Joe solve at ${role.company || "this role"}, and how did he implement the solutions?`,
  }));
  const candidates = [
    ...spread(projects, 4), ...spread(roles, 2), ...roles, ...projects,
    { id: "technology-stack", label: "Technology stack", prompt: "Which technologies does Joe use, and what portfolio evidence demonstrates that experience?" },
    { id: "engineering-approach", label: "Engineering approach", prompt: "How does Joe approach engineering decisions and technical trade-offs?" },
    { id: "career-timeline", label: "Career timeline", prompt: "How has Joe’s engineering experience evolved across his roles?" },
    { id: "resume-downloads", label: "Resume downloads", prompt: "Show Joe’s available resume downloads." },
    { id: "project-overview", label: "Project overview", prompt: "What projects are available in Joe’s portfolio?" },
    { id: "contact-joe", label: "Contact Joe", prompt: "How can a visitor contact Joe?" },
  ];
  const chosen: StarterTopic[] = [];
  const ids = new Set<string>(["working-together", "full-overview"]);
  const labels = new Set<string>(["working together", "full overview"]);
  for (const topic of candidates) {
    if (ids.has(topic.id) || labels.has(topic.label.toLowerCase())) continue;
    ids.add(topic.id);
    labels.add(topic.label.toLowerCase());
    chosen.push(topic);
    if (chosen.length === 6) break;
  }
  return [...chosen,
    { id: "working-together", label: "Working together", prompt: "What does Joe’s portfolio say about his next-role preferences and advisory focus areas? Distinguish confirmed details from placeholders." },
    { id: "full-overview", label: "Full overview", prompt: "Show full overview" },
  ];
}

// Kept injectable so fallback and validation can be tested without model calls.
export async function resolveStarterTopics(
  context: PortfolioData,
  generate?: () => Promise<unknown>,
): Promise<StarterTopic[]> {
  if (generate) {
    try {
      return starterTopicsSchema.parse(await generate()).starterTopics;
    } catch {
      // Navigation enhancement failures must not prevent SSR or ordinary chat.
    }
  }
  return fallbackStarterTopics(context);
}
