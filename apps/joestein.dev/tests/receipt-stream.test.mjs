import assert from "node:assert/strict";
import { test } from "node:test";
import { streamText, simulateReadableStream, readUIMessageStream, validateUIMessages } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { createPortfolioTools } from "../lib/portfolio-tools.ts";
import { guardPortfolioStream, portfolioTurnComplete } from "../lib/chat-stream.ts";

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
    const result = streamText({ model, prompt: "How does Joe modernize legacy platforms?", tools, stopWhen: portfolioTurnComplete });
    const chunks = await Array.fromAsync(result.toUIMessageStream({ sendReasoning: false, onError: () => "Optional suggestions unavailable." })
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
