import type { UIMessageChunk } from "ai";

export const recoveryMessage = "That response didn’t quite come together. Try again or ask another question.";
const primaryTools = new Set(["showReceipts", "showDownloads", "showOverview"]);

// Stop once core evidence is ready. Never spend another step just to obtain
// optional navigation suggestions.
export function portfolioTurnComplete({ steps }: {
  steps: readonly { toolResults: readonly { toolName: string }[] }[];
}) {
  const names = new Set(steps.flatMap((step) => step.toolResults.map((tool) => tool.toolName)));
  return steps.length >= 2 || [...primaryTools].some((name) => names.has(name));
}

// Preserve every live chunk and partial answer. Surface silent provider aborts,
// truncated core output, empty streams, and incomplete evidence as honest failures.
// Optional suggestions can fail independently without replacing a valid answer.
export function guardPortfolioStream(signal: AbortSignal) {
  const calls = new Map<string, string>();
  const completed = new Set<string>();
  let hasText = false;
  let failed = false;
  let finished = false;
  function incomplete() {
    return !hasText || [...calls].some(([id, name]) => primaryTools.has(name) && !completed.has(id));
  }
  function onlyOptionalWorkRemains() {
    return hasText && !incomplete() && [...completed].some((id) => primaryTools.has(calls.get(id) ?? "")) &&
      [...calls].some(([id, name]) => name === "suggestFollowUps" && !completed.has(id));
  }
  return new TransformStream<UIMessageChunk, UIMessageChunk>({
    transform(chunk, controller) {
      if (chunk.type === "text-delta" && chunk.delta.trim()) hasText = true;
      if (chunk.type === "tool-input-start" || chunk.type === "tool-input-available" || chunk.type === "tool-input-error") calls.set(chunk.toolCallId, chunk.toolName);
      if (chunk.type === "tool-output-available" && !chunk.preliminary) completed.add(chunk.toolCallId);
      if (chunk.type === "error") failed = true;
      if (["tool-input-error", "tool-output-error", "tool-output-denied"].includes(chunk.type)) {
        controller.enqueue(chunk);
        if (calls.get("toolCallId" in chunk ? chunk.toolCallId : "") !== "suggestFollowUps") {
          if (!failed) controller.enqueue({ type: "error", errorText: recoveryMessage });
          failed = true;
        }
        return;
      }
      if (chunk.type === "abort" && !signal.aborted) {
        if (onlyOptionalWorkRemains()) return;
        failed = true;
        controller.enqueue({ type: "error", errorText: recoveryMessage });
        return;
      }
      if (chunk.type === "finish") {
        finished = true;
        if (!failed && !signal.aborted && (incomplete() || (["error", "content-filter", "interrupted"].includes(chunk.finishReason ?? "") || (chunk.finishReason === "length" && !onlyOptionalWorkRemains())))) {
          failed = true;
          controller.enqueue({ type: "error", errorText: recoveryMessage });
        }
      }
      controller.enqueue(chunk);
    },
    flush(controller) {
      if (!finished && !failed && !signal.aborted && !onlyOptionalWorkRemains()) controller.enqueue({ type: "error", errorText: recoveryMessage });
    },
  });
}
