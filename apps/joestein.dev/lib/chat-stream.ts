import type { UIMessageChunk } from "ai";

export const recoveryMessage = "That response didn’t quite come together. Try again or ask another question.";
const primaryTools = new Set(["showReceipts", "showDownloads", "showOverview"]);

// Stop as soon as the evidence/navigation bundle is complete. A second step is
// available only to finish missing tools, rather than narrate their results.
export function portfolioTurnComplete({ steps }: {
  steps: readonly { toolResults: readonly { toolName: string }[] }[];
}) {
  const names = new Set(steps.flatMap((step) => step.toolResults.map((tool) => tool.toolName)));
  return steps.length >= 2 || (names.has("suggestFollowUps") && [...primaryTools].some((name) => names.has(name)));
}

// Preserve every live chunk and partial answer. Surface silent provider aborts,
// truncated JSON, empty streams, and incomplete tool bundles as honest failures.
export function guardPortfolioStream(signal: AbortSignal) {
  const calls = new Map<string, string>();
  const completed = new Set<string>();
  let hasText = false;
  let failed = false;
  let finished = false;
  function incomplete() {
    const names = [...completed].map((id) => calls.get(id));
    return !hasText || calls.size !== completed.size ||
      (names.some((name) => primaryTools.has(name ?? "")) && !names.includes("suggestFollowUps")) ||
      (names.includes("suggestFollowUps") && !names.some((name) => primaryTools.has(name ?? "")));
  }
  return new TransformStream<UIMessageChunk, UIMessageChunk>({
    transform(chunk, controller) {
      if (chunk.type === "text-delta" && chunk.delta.trim()) hasText = true;
      if (chunk.type === "tool-input-start" || chunk.type === "tool-input-available") calls.set(chunk.toolCallId, chunk.toolName);
      if (chunk.type === "tool-output-available" && !chunk.preliminary) completed.add(chunk.toolCallId);
      if (chunk.type === "error") failed = true;
      if (["tool-input-error", "tool-output-error", "tool-output-denied"].includes(chunk.type)) {
        controller.enqueue(chunk);
        if (!failed) controller.enqueue({ type: "error", errorText: recoveryMessage });
        failed = true;
        return;
      }
      if (chunk.type === "abort" && !signal.aborted) {
        failed = true;
        controller.enqueue({ type: "error", errorText: recoveryMessage });
        return;
      }
      if (chunk.type === "finish") {
        finished = true;
        if (!failed && !signal.aborted && (incomplete() || ["length", "error", "content-filter", "interrupted"].includes(chunk.finishReason ?? ""))) {
          failed = true;
          controller.enqueue({ type: "error", errorText: recoveryMessage });
        }
      }
      controller.enqueue(chunk);
    },
    flush(controller) {
      if (!finished && !failed && !signal.aborted) controller.enqueue({ type: "error", errorText: recoveryMessage });
    },
  });
}
