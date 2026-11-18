import { wrapLanguageModel } from "ai";

type Model = ReturnType<typeof wrapLanguageModel>;
type StreamPart = Awaited<ReturnType<Model["doStream"]>>["stream"] extends ReadableStream<infer Part> ? Part : never;
type Candidate = { id: string; model: Model };

export function portfolioModelIds(primary = "gemini-3.5-flash-lite") {
  return [...new Set([primary, "gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-3.6-flash"])];
}

export function isRateLimitError(error: unknown): boolean {
  const seen = new Set<unknown>();
  function inspect(value: unknown): boolean {
    if (!value || typeof value !== "object" || seen.has(value)) return false;
    seen.add(value);
    const item = value as Record<string, unknown>;
    if (item.statusCode === 429 || item.status === 429 || item.code === 429 || item.status === "RESOURCE_EXHAUSTED" || item.code === "RESOURCE_EXHAUSTED") return true;
    if (typeof item.message === "string" && /RESOURCE_EXHAUSTED|rate[\s_-]*limit|too many requests|\bquota\b/i.test(item.message)) return true;
    if (typeof item.responseBody === "string") {
      try { if (inspect(JSON.parse(item.responseBody))) return true; } catch { /* Not every provider response is JSON. */ }
    }
    return inspect(item.error) || inspect(item.cause) || inspect(item.lastError) ||
      (Array.isArray(item.errors) && item.errors.some(inspect));
  }
  return inspect(error);
}

export class ModelsRateLimitedError extends Error {
  constructor() {
    super("All configured portfolio models are rate limited.");
    this.name = "ModelsRateLimitedError";
  }
}

// One request-scoped wrapper is shared by the initial and completion steps.
// Buffer only provider bookkeeping. Once answer/tool chunks escape, switching
// models is unsafe and the existing partial-answer recovery UI takes over.
export function rateLimitFallbackModel(candidates: Candidate[]) {
  if (!candidates.length) throw new Error("At least one portfolio model is required.");
  let selected = 0;
  let committed = false;
  const model = wrapLanguageModel({
    model: candidates[0].model,
    middleware: {
      wrapStream: async ({ params }) => {
        for (; selected < candidates.length; selected++) {
          params.abortSignal?.throwIfAborted();
          const candidate = candidates[selected];
          let reader: ReadableStreamDefaultReader<StreamPart> | undefined;
          try {
            const result = await candidate.model.doStream(params);
            reader = result.stream.getReader();
            const prefix: StreamPart[] = [];
            while (true) {
              const chunk = await reader.read();
              if (chunk.done) break;
              if (chunk.value.type === "error") throw chunk.value.error;
              prefix.push(chunk.value);
              if (chunk.value.type !== "stream-start" && chunk.value.type !== "response-metadata") break;
            }
            committed = true;
            const source = reader;
            return { ...result, stream: new ReadableStream({
              start(controller) { for (const chunk of prefix) controller.enqueue(chunk); },
              async pull(controller) {
                const chunk = await source.read();
                if (chunk.done) { source.releaseLock(); controller.close(); }
                else controller.enqueue(chunk.value);
              },
              async cancel(reason) { await source.cancel(reason); source.releaseLock(); },
            }) };
          } catch (error) {
            await reader?.cancel().catch(() => {});
            reader?.releaseLock();
            if (params.abortSignal?.aborted || committed || !isRateLimitError(error)) throw error;
            console.warn("[Portfolio Model Fallback]:", { model: candidate.id, nextModel: candidates[selected + 1]?.id ?? null, reason: "rate-limit" });
            if (selected === candidates.length - 1) throw new ModelsRateLimitedError();
          }
        }
        throw new ModelsRateLimitedError();
      },
    },
  });
  return { model, getModelId: () => candidates[selected]?.id };
}
