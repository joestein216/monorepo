import type { PortfolioMessage } from "./portfolio-tools";
import type { StarterTopic, FollowUpSuggestion } from "./portfolio-topics";

// Only consume suggestions from the response to this exact starter turn.
// Other conversation turns must not replace its contextual suggestions.
export function getTurnFollowUps(messages: PortfolioMessage[], turnId: string | null): FollowUpSuggestion[] {
  if (!turnId) return [];
  const start = messages.findIndex((message) => message.id === turnId && message.role === "user");
  if (start < 0) return [];
  let suggestions: FollowUpSuggestion[] = [];
  for (const message of messages.slice(start + 1)) {
    if (message.role === "user") break;
    for (const part of message.parts) {
      if (part.type === "tool-suggestFollowUps" && part.state === "output-available" && part.output.length === 3) {
        suggestions = part.output;
      }
    }
  }
  return suggestions;
}


export type PromptSuggestion = {
  id: string;
  prompt: string;
  tier: "starter" | "contextual";
  originTopicId?: string;
  originLabel?: string;
};

export function getPromptSuggestions(
  starters: StarterTopic[],
  messages: PortfolioMessage[],
  starterTurns: Record<string, string>,
): PromptSuggestion[] {
  return starters.flatMap((starter): PromptSuggestion[] => {
    const turnId = starterTurns[starter.id];
    const suggestions = getTurnFollowUps(messages, turnId ?? null);
    // Preserve the wording actually clicked, even if CMS copy later changes.
    const originLabel = messages.find((message) => message.id === turnId && message.role === "user")?.parts
      .filter((part) => part.type === "text").map((part) => part.text).join("\n") || starter.question;
    return suggestions.length === 3 ? suggestions.map((suggestion, index) => ({
      id: `${starter.id}:${turnId}:${index}`,
      prompt: suggestion.question,
      tier: "contextual",
      originTopicId: starter.id,
      originLabel,
    })) : [{ id: starter.id, prompt: starter.question, tier: "starter" }];
  });
}
