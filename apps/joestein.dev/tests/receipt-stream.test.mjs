import assert from "node:assert/strict";
import { test } from "node:test";
import { simulateReadableStream, readUIMessageStream, validateUIMessages } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { createPortfolioTools } from "../lib/portfolio-tools.ts";
import { guardPortfolioStream } from "../lib/chat-stream.ts";

import { streamPortfolioTurn } from "../lib/portfolio-generation.ts";
import { getPromptSuggestions } from "../lib/portfolio-navigation.ts";

const context = { about: null, technologies: [], projects: [], roles: [{
  _id: "role-booker", company: "Booker", title: "Lead Engineer", dateRange: "2015–2019", technologies: [],
  achievements: [{ _key: "booking", bullet: "Built standalone booking.", deepDive: "Decoupled legacy APIs.", technologies: [] }],
}] };

test("real SDK streaming preserves hydrated receipts when optional suggestions are absent or invalid", async () => {
  for (const invalidSuggestions of [false, true]) {
    const tools = createPortfolioTools(context);
    const model = new MockLanguageModelV4({ doStream: async () => ({ stream: simulateReadableStream({ chunks: [
      { type: "text-start", id: "summary" },
      { type: "text-delta", id: "summary", delta: "Joe decoupled booking from legacy APIs." },
      { type: "text-end", id: "summary" },
      { type: "tool-call", toolCallId: "receipts", toolName: "showReceipts", input: JSON.stringify({ receipts: [{
        id: "booking", type: "role", relevanceScore: 95, tailoredNarrative: "Joe built standalone booking. He decoupled the legacy APIs.",
      }] }) },
      ...(invalidSuggestions ? [{ type: "tool-call", toolCallId: "suggestions", toolName: "suggestFollowUps", input: JSON.stringify({ suggestions: [] }) }] : []),
      { type: "finish", finishReason: { unified: "tool-calls", raw: undefined }, usage: {
        inputTokens: { total: 10, noCache: 10 }, outputTokens: { total: 20, text: 20 },
      } },
    ] }) }) });
    const stream = streamPortfolioTurn({ model, messages: [{ role: "user", content: "How does Joe modernize legacy platforms?" }], tools }, { onError: () => "Optional suggestions unavailable." });
    const chunks = await Array.fromAsync(stream
      .pipeThrough(guardPortfolioStream(new AbortController().signal)));
    assert.equal(chunks.some((chunk) => chunk.type === "error"), false);
    const receipts = chunks.find((chunk) => chunk.type === "tool-output-available" && chunk.toolCallId === "receipts").output;
    assert.equal(receipts.length, 1);
    assert.equal(receipts[0].type, "achievement");
    assert.equal(receipts[0].company, "Booker");
    assert.equal(receipts[0].matchReason, undefined);
    assert.equal(model.doStreamCalls.length, 1, "no extra model call to obtain or repair suggestions");
    assert.equal(chunks.some((chunk) => chunk.type === "tool-input-error"), invalidSuggestions);

    // Failed optional calls must also remain loadable on the next conversation turn.
    const snapshots = await Array.fromAsync(readUIMessageStream({ stream: ReadableStream.from(chunks) }));
    const messages = await validateUIMessages({ messages: [snapshots.at(-1)], tools });
    assert.ok(messages[0].parts.some((part) => part.type === "text" && part.text.includes("Joe decoupled")));
  }
});

const summaryChunks = [
  { type: "text-start", id: "summary" },
  { type: "text-delta", id: "summary", delta: "Joe decoupled booking from legacy APIs." },
  { type: "text-end", id: "summary" },
];
const receiptChunk = { type: "tool-call", toolCallId: "receipt-recovery", toolName: "showReceipts", input: JSON.stringify({ receipts: [{
  id: "booking", relevanceScore: 95, tailoredNarrative: "Joe built standalone booking. He decoupled the legacy APIs.",
}] }) };
function response(chunks, reason = "stop") {
  return { stream: simulateReadableStream({ chunks: [...chunks, {
    type: "finish", finishReason: { unified: reason, raw: undefined }, usage: {
      inputTokens: { total: 10, noCache: 10 }, outputTokens: { total: 20, text: 20 },
    },
  }] }) };
}
async function runTurn(responses) {
  const model = new MockLanguageModelV4({ doStream: responses });
  const stream = streamPortfolioTurn({ model, messages: [{ role: "user", content: "How does Joe modernize legacy platforms?" }],
    tools: createPortfolioTools(context) }, { onError: () => "Generation failed." });
  const chunks = await Array.fromAsync(stream.pipeThrough(guardPortfolioStream(new AbortController().signal)));
  const snapshots = await Array.fromAsync(readUIMessageStream({ stream: ReadableStream.from(chunks), onError: () => {} }));
  return { model, chunks, message: snapshots.at(-1) };
}

test("receipts-first turns complete their missing summary without repeating tools", async () => {
  const { model, chunks, message } = await runTurn([response([receiptChunk], "tool-calls"), response(summaryChunks)]);
  assert.equal(model.doStreamCalls.length, 2);
  assert.deepEqual(model.doStreamCalls[1].toolChoice, { type: "none" });
  assert.equal(chunks.filter(chunk => chunk.type === "tool-output-available").length, 1);
  assert.equal(chunks.filter(chunk => chunk.type === "start").length, 1);
  assert.equal(chunks.filter(chunk => chunk.type === "finish").length, 1);
  assert.equal(chunks.some(chunk => chunk.type === "error"), false);
  assert.equal(message.parts.filter(part => part.type === "text").map(part => part.text).join(""), summaryChunks[1].delta);
});

test("prose-only turns get one forced core call, preserving summary and single message identity", async () => {
  const { model, chunks, message } = await runTurn([response(summaryChunks), response([receiptChunk], "tool-calls")]);
  assert.equal(model.doStreamCalls.length, 2);
  assert.deepEqual(model.doStreamCalls[1].toolChoice, { type: "required" });
  assert.equal(model.doStreamCalls[1].tools.some(tool => tool.name === "suggestFollowUps"), false);
  assert.equal(chunks.filter(chunk => chunk.type === "start").length, 1);
  assert.equal(chunks.filter(chunk => chunk.type === "finish").length, 1);
  assert.equal(chunks.some(chunk => chunk.type === "error"), false);
  assert.equal(message.parts.filter(part => part.type === "text").length, 1);
  assert.equal(message.parts.find(part => part.type === "tool-showReceipts").output[0].company, "Booker");
});

test("a still-incomplete recovery stops at two calls and exposes failure", async () => {
  const { model, chunks } = await runTurn([response(summaryChunks), response([])]);
  assert.equal(model.doStreamCalls.length, 2);
  assert.equal(chunks.filter(chunk => chunk.type === "error").length, 1);
});

test("truncation is disclosed without spending a recovery call", async () => {
  const { model, chunks } = await runTurn([response(summaryChunks, "length")]);
  assert.equal(model.doStreamCalls.length, 1);
  assert.equal(chunks.filter(chunk => chunk.type === "error").length, 1);
});

test("live tool parts replace only their originating starter with three contextual prompts", async () => {
  const questions = ["How does Joe decouple booking?", "How does Joe modernize legacy APIs?", "How does Joe isolate platform changes?"];
  const { model, chunks, message } = await runTurn([response([...summaryChunks, receiptChunk, {
    type: "tool-call", toolCallId: "follow-ups", toolName: "suggestFollowUps",
    input: JSON.stringify({ suggestions: questions.map(question => ({ question })) }),
  }], "tool-calls")]);
  const suggestions = getPromptSuggestions([
    { id: "legacy", question: "How does Joe modernize legacy platforms?" },
    { id: "payments", question: "How does Joe build payment systems?" },
  ], [{ id: "starter-turn", role: "user", parts: [{ type: "text", text: "How does Joe modernize legacy platforms?" }] }, message], { legacy: "starter-turn" });
  assert.equal(model.doStreamCalls.length, 1);
  assert.equal(chunks.some(chunk => chunk.type === "error"), false);
  assert.deepEqual(suggestions.map(item => item.prompt), [...questions, "How does Joe build payment systems?"]);
  assert.deepEqual(suggestions.map(item => item.tier), ["contextual", "contextual", "contextual", "starter"]);
});

test("invalid optional suggestions do not block completion of a missing summary", async () => {
  const { model, chunks } = await runTurn([response([receiptChunk, {
    type: "tool-call", toolCallId: "bad-suggestions", toolName: "suggestFollowUps", input: JSON.stringify({ suggestions: [] }),
  }], "tool-calls"), response(summaryChunks)]);
  assert.equal(model.doStreamCalls.length, 2);
  assert.equal(chunks.some(chunk => chunk.type === "error"), false);
});
