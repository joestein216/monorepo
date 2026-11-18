import assert from "node:assert/strict";
import { test } from "node:test";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { portfolioModelIds, isRateLimitError, ModelsRateLimitedError, rateLimitFallbackModel } from "../lib/model-fallback.ts";
import { streamPortfolioTurn } from "../lib/portfolio-generation.ts";
import { createPortfolioTools } from "../lib/portfolio-tools.ts";
import { guardPortfolioStream, rateLimitMessage } from "../lib/chat-stream.ts";

const params = { prompt: [] };
const limited = () => Object.assign(new Error("Quota exceeded"), { statusCode: 429 });
const finish = { type: "finish", finishReason: { unified: "stop", raw: undefined }, usage: {
  inputTokens: { total: 1, noCache: 1 }, outputTokens: { total: 1, text: 1 },
} };
function candidate(id, output) {
  const model = new MockLanguageModelV4({ modelId: id, doStream: async options => {
    if (typeof output === "function") return output(options);
    return { stream: simulateReadableStream({ chunks: output }) };
  } });
  return { id, model };
}
const text = [ { type: "text-start", id: "summary" }, { type: "text-delta", id: "summary", delta: "Joe builds grounded systems." }, { type: "text-end", id: "summary" }, finish ];
const read = async model => Array.fromAsync((await model.doStream(params)).stream);

test("requested fallback order is stable and primary model is never tried twice", () => {
  assert.deepEqual(portfolioModelIds(), ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-3.6-flash"]);
  assert.deepEqual(portfolioModelIds("gemini-3.8-flash"), ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-3.6-flash"]);
});

test("classifies numeric, structured, and wrapped quota errors without treating other failures as quotas", () => {
  for (const error of [limited(), new Error("RESOURCE_EXHAUSTED"), new Error("Rate limit reached"),
    { responseBody: JSON.stringify({ error: { status: "RESOURCE_EXHAUSTED" } }) }, { cause: limited() }, { errors: [limited()] }]) assert.equal(isRateLimitError(error), true);
  for (const error of [new Error("Network failure"), { statusCode: 503, message: "High demand" }, { statusCode: 401 }, null]) assert.equal(isRateLimitError(error), false);
});

test("thrown quota and pre-output error chunks advance in order without leaking failed chunks", async () => {
  const first = candidate("primary", () => { throw limited(); });
  const second = candidate("secondary", [{ type: "stream-start", warnings: [] }, { type: "error", error: limited() }]);
  const third = candidate("third", text);
  const fallback = rateLimitFallbackModel([first, second, third]);
  assert.deepEqual(await read(fallback.model), text);
  assert.equal(fallback.getModelId(), "third");
  for (const item of [first, second, third]) assert.equal(item.model.doStreamCalls.length, 1);
});

test("successful primary makes no fallback calls; non-quota errors fail immediately", async () => {
  const unused = candidate("unused", text);
  const successful = rateLimitFallbackModel([candidate("primary", text), unused]);
  assert.deepEqual(await read(successful.model), text);
  const outage = Object.assign(new Error("High demand"), { statusCode: 503 });
  const broken = rateLimitFallbackModel([candidate("primary", () => { throw outage; }), unused]);
  await assert.rejects(() => read(broken.model), error => error === outage);
  assert.equal(unused.model.doStreamCalls.length, 0);
});

test("quota after text starts never restarts the answer or switches a completion step", async () => {
  const primary = candidate("primary", [text[0], text[1], { type: "error", error: limited() }]);
  const unused = candidate("unused", text);
  const fallback = rateLimitFallbackModel([primary, unused]);
  const chunks = await read(fallback.model);
  assert.equal(chunks.at(-1).type, "error");
  assert.equal(unused.model.doStreamCalls.length, 0);
  // Even before new chunks, a completion call cannot switch the model once a
  // previous step has already exposed text or tools in this same turn.
  primary.model.doStream = async () => { throw limited(); };
  await assert.rejects(() => read(fallback.model), isRateLimitError);
  assert.equal(unused.model.doStreamCalls.length, 0);
});

test("all-model exhaustion produces exactly one capacity error in the real UI stream", async () => {
  const candidates = portfolioModelIds().map(id => candidate(id, () => { throw limited(); }));
  const fallback = rateLimitFallbackModel(candidates);
  const stream = streamPortfolioTurn({ model: fallback.model, messages: [{ role: "user", content: "Test portfolio rendering." }],
    tools: createPortfolioTools({ about: null, roles: [], projects: [], technologies: [] }), maxRetries: 0, onError: () => {},
  }, { getModelId: fallback.getModelId, onError: error => error instanceof ModelsRateLimitedError ? rateLimitMessage : "Unexpected error" });
  const chunks = await Array.fromAsync(stream.pipeThrough(guardPortfolioStream(new AbortController().signal)));
  assert.deepEqual(chunks.filter(chunk => chunk.type === "error").map(chunk => chunk.errorText), [rateLimitMessage]);
  for (const item of candidates) assert.equal(item.model.doStreamCalls.length, 1);
});

test("successful fallback streams one summary and executes its receipt renderer exactly once", async () => {
  const primary = candidate("primary", () => { throw limited(); });
  const secondary = candidate("secondary", [...text.slice(0, -1), {
    type: "tool-call", toolCallId: "receipts", toolName: "showReceipts", input: JSON.stringify({ receipts: [] }),
  }, { ...finish, finishReason: { unified: "tool-calls", raw: undefined } }]);
  const fallback = rateLimitFallbackModel([primary, secondary]);
  const tools = createPortfolioTools({ about: null, roles: [], projects: [], technologies: [] });
  let executions = 0;
  const execute = tools.showReceipts.execute;
  tools.showReceipts.execute = async (...args) => { executions++; return execute(...args); };
  const stream = streamPortfolioTurn({ model: fallback.model, messages: [{ role: "user", content: "Show Joe’s engineering work." }],
    tools, maxRetries: 0, onError: () => {},
  }, { getModelId: fallback.getModelId, onError: () => "Unexpected error" });
  const chunks = await Array.fromAsync(stream.pipeThrough(guardPortfolioStream(new AbortController().signal)));
  assert.equal(chunks.filter(chunk => chunk.type === "text-delta").length, 1);
  assert.equal(chunks.filter(chunk => chunk.type === "tool-output-available").length, 1);
  assert.equal(chunks.filter(chunk => chunk.type === "start").length, 1);
  assert.equal(chunks.filter(chunk => chunk.type === "finish").length, 1);
  assert.equal(chunks.some(chunk => chunk.type === "error"), false);
  assert.equal(executions, 1);
  assert.equal(fallback.getModelId(), "secondary");
});

test("shared cancellation prevents additional model attempts", async () => {
  const controller = new AbortController();
  const unused = candidate("unused", text);
  const primary = candidate("primary", () => { controller.abort(); throw limited(); });
  const fallback = rateLimitFallbackModel([primary, unused]);
  await assert.rejects(() => fallback.model.doStream({ ...params, abortSignal: controller.signal }));
  assert.equal(unused.model.doStreamCalls.length, 0);
});
