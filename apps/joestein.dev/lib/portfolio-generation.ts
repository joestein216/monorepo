import { createUIMessageStream, isStepCount, streamText, type ModelMessage } from "ai";
import type { createPortfolioTools, PortfolioMessage } from "./portfolio-tools";
import { hasCoreResult, hasSummary } from "./chat-stream";

type Tools = ReturnType<typeof createPortfolioTools>;
type Options = Omit<Parameters<typeof streamText<Tools>>[0], "prompt" | "messages" | "stopWhen" | "prepareStep"> & { messages: ModelMessage[] };

// Healthy turns take one model step. A clean but incomplete turn gets exactly
// one completion step, sharing the request's deadline and already streamed output.
export function streamPortfolioTurn(options: Options, { onError }: { onError: (error: unknown) => string }) {
  return createUIMessageStream<PortfolioMessage>({
    onError,
    execute: async ({ writer }) => {
      const first = streamText({ ...options, stopWhen: isStepCount(1) });
      for await (const chunk of first.toUIMessageStream<PortfolioMessage>({ sendReasoning: false, sendFinish: false, onError })) {
        writer.write(chunk);
      }
      const steps = [...await first.steps];
      let finishReason = await first.finishReason;
      let recovered = false;
      const summary = hasSummary(steps);
      const core = hasCoreResult(steps);
      const clean = steps.every((step) => step.toolCalls.every((call) => !call.invalid || call.toolName === "suggestFollowUps"));

      if ((!summary || !core) && clean && !options.abortSignal?.aborted &&
          (finishReason === "stop" || finishReason === "tool-calls")) {
        recovered = true;
        const completion = summary
          ? "The summary has already been delivered. Call the missing core rendering tool now using the portfolio evidence. Do not write any more prose or call suggestFollowUps."
          : core
            ? "The core tool results have already been delivered. Write only the missing concise third-person summary answering the current question. Do not repeat or call tools."
            : "Complete this response with a concise third-person summary and the appropriate core rendering tool. Do not call suggestFollowUps.";
        const recovery = streamText({
          ...options,
          messages: [...options.messages, ...(await first.response).messages, { role: "user", content: completion }],
          activeTools: ["showReceipts", "showDownloads", "showOverview"],
          toolChoice: core ? "none" : summary ? "required" : "auto",
          stopWhen: isStepCount(1),
        });
        for await (const chunk of recovery.toUIMessageStream<PortfolioMessage>({ sendReasoning: false, sendStart: false, sendFinish: false, onError })) {
          writer.write(chunk);
        }
        steps.push(...await recovery.steps);
        finishReason = await recovery.finishReason;
      }

      const results = steps.flatMap((step) => step.toolResults);
      console.info("[Portfolio Turn]:", {
        steps: steps.length, recovered, hasSummary: hasSummary(steps), finishReason,
        receiptCount: results.reduce((count, result) => count + (result.toolName === "showReceipts" && Array.isArray(result.output) ? result.output.length : 0), 0),
        suggestionCount: results.reduce((count, result) => count + (result.toolName === "suggestFollowUps" && Array.isArray(result.output) ? result.output.length : 0), 0),
        coreTools: results.map((result) => result.toolName).filter((name) => name !== "suggestFollowUps"),
      });
      writer.write({ type: "finish", finishReason });
    },
  });
}
