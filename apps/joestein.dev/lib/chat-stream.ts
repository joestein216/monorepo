import type { UIMessageChunk } from "ai";

export const recoveryMessage = "That response didn’t quite come together. Try again or ask another question.";
export const rateLimitMessage = "The portfolio assistant is at capacity across its available models. Please wait a moment, then try again.";
const primaryTools = new Set(["showReceipts", "showDownloads", "showOverview"]);

type PortfolioStep = { text?: string; toolResults: readonly { toolName: string }[] };
export function hasCoreResult(steps: readonly PortfolioStep[]) {
  return steps.some((step) => step.toolResults.some((result) => primaryTools.has(result.toolName)));
}
export function hasSummary(steps: readonly PortfolioStep[]) {
  return steps.some((step) => Boolean(step.text?.trim()));
}

export type PortfolioStreamDiagnostic = {
  reason: string;
  hasSummary: boolean;
  tools: string[];
  completedTools: string[];
  finishReason?: string;
};

// Preserve every live chunk and partial answer. Surface silent provider aborts,
// truncated core output, empty streams, and incomplete evidence as honest failures.
// Optional suggestions can fail independently without replacing a valid answer.
export function guardPortfolioStream(signal: AbortSignal, onFailure?: (diagnostic: PortfolioStreamDiagnostic) => void) {
  const calls = new Map<string, string>();
  const completed = new Set<string>();
  let hasText = false;
  let failed = false;
  let finished = false;
  function report(reason: string, finishReason?: string) {
    onFailure?.({ reason, hasSummary: hasText, tools: [...calls.values()],
      completedTools: [...completed].map((id) => calls.get(id) ?? "unknown"), finishReason });
  }
  function incomplete() {
    return !hasText || ![...completed].some((id) => primaryTools.has(calls.get(id) ?? "")) || [...calls].some(([id, name]) => primaryTools.has(name) && !completed.has(id));
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
          if (!failed) { report("core-tool-error"); controller.enqueue({ type: "error", errorText: recoveryMessage }); }
          failed = true;
        }
        return;
      }
      if (chunk.type === "abort" && !signal.aborted) {
        if (onlyOptionalWorkRemains()) return;
        failed = true;
        report("provider-abort");
        controller.enqueue({ type: "error", errorText: recoveryMessage });
        return;
      }
      if (chunk.type === "finish") {
        finished = true;
        if (!failed && !signal.aborted && (incomplete() || (["error", "content-filter", "interrupted"].includes(chunk.finishReason ?? "") || (chunk.finishReason === "length" && !onlyOptionalWorkRemains())))) {
          failed = true;
          report(!hasText ? "missing-summary" : incomplete() ? "incomplete-evidence" : "generation-incomplete", chunk.finishReason);
          controller.enqueue({ type: "error", errorText: recoveryMessage });
        }
      }
      controller.enqueue(chunk);
    },
    flush(controller) {
      if (!finished && !failed && !signal.aborted && !onlyOptionalWorkRemains()) {
        report("unexpected-stream-end");
        controller.enqueue({ type: "error", errorText: recoveryMessage });
      }
    },
  });
}
