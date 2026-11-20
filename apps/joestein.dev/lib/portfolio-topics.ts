import { z } from "zod";
import type { PORTFOLIO_CONTEXT_QUERY_RESULT } from "@/sanity.types";

export type PortfolioData = PORTFOLIO_CONTEXT_QUERY_RESULT;
// One question is both the button text and the submitted message.
export const suggestedQuestionSchema = z.string().trim().min(1).max(65)
  .describe("A short, single-focus question, usually 5–10 words. This exact text is displayed and submitted; there is no hidden expanded prompt.");
export type StarterTopic = { id: string; question: string };
export type FollowUpSuggestion = { question: string };

export const followUpsSchema = z.object({
  suggestions: z.array(z.object({ question: suggestedQuestionSchema })).length(3),
});

// Editorial order and stable array keys come directly from Site Settings.
// Missing questions mean no starter navigation, not an AI or hardcoded menu.
export function getStarterTopics(context: PortfolioData): StarterTopic[] {
  return (context.siteSettings?.promptExperience?.starterQuestions ?? []).flatMap((item) => {
    const question = suggestedQuestionSchema.safeParse(item.question);
    return question.success ? [{ id: item._key, question: question.data }] : [];
  }).slice(0, 8);
}
