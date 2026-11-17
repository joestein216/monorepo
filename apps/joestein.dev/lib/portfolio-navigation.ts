import type { PortfolioMessage } from "./portfolio-tools";
import type { FollowUpSuggestion } from "./portfolio-topics";

// Only consume the response to the selected primary topic. Older tool outputs,
// unrelated freeform turns, and secondary clicks cannot create another tier.
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
