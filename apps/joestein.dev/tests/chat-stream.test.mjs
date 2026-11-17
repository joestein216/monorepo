import assert from "node:assert/strict";
import { test } from "node:test";
import { guardPortfolioStream, portfolioTurnComplete, recoveryMessage } from "../lib/chat-stream.ts";

const step = (...names) => ({ toolResults: names.map((toolName) => ({ toolName })) });
const text = { type: "text-delta", id: "text", delta: "Joe built a grounded system." };
const call = (name) => [
  { type: "tool-input-available", toolName: name, toolCallId: name, input: {} },
  { type: "tool-output-available", toolCallId: name, output: [] },
];
async function guarded(chunks, signal = new AbortController().signal) {
  const stream = new ReadableStream({ start(controller) { chunks.forEach((chunk) => controller.enqueue(chunk)); controller.close(); } });
  return Array.fromAsync(stream.pipeThrough(guardPortfolioStream(signal)));
}

test("core tool results stop immediately without generating another step for suggestions", () => {
  for (const name of ["showReceipts", "showDownloads", "showOverview"]) {
    assert.equal(portfolioTurnComplete({ steps: [step(name, "suggestFollowUps")] }), true);
    assert.equal(portfolioTurnComplete({ steps: [step(name)] }), true);
    assert.equal(portfolioTurnComplete({ steps: [step(name), step("suggestFollowUps")] }), true);
  }
  assert.equal(portfolioTurnComplete({ steps: [step(), step()] }), true);
});

test("successful live text and tool results pass through unchanged, including empty evidence", async () => {
  const chunks = [text, ...call("showReceipts"), ...call("suggestFollowUps"), { type: "finish", finishReason: "tool-calls" }];
  assert.deepEqual(await guarded(chunks), chunks);
  assert.deepEqual(await guarded([text, { type: "finish", finishReason: "stop" }]), [text, { type: "finish", finishReason: "stop" }]);
});

test("core truncation, empty streams, pending evidence, and timeout aborts disclose failure", async () => {
  for (const chunks of [
    [], [{ type: "finish", finishReason: "stop" }],
    [text, { type: "finish", finishReason: "length" }],
    [text, { type: "tool-input-start", toolName: "showReceipts", toolCallId: "pending" }, { type: "finish" }],
    [text, { type: "abort" }],
    [text],
  ]) {
    const output = await guarded(chunks);
    assert.equal(output.filter((chunk) => chunk.type === "error").length, 1);
    assert.equal(output.find((chunk) => chunk.type === "error").errorText, recoveryMessage);
    if (chunks.includes(text)) assert.ok(output.includes(text), "partial generated text is preserved");
  }
});

test("intentional visitor cancellation stays cancellation; existing errors are not duplicated", async () => {
  const controller = new AbortController(); controller.abort();
  assert.deepEqual(await guarded([text, { type: "abort" }], controller.signal), [text, { type: "abort" }]);
  const chunks = [text, { type: "error", errorText: recoveryMessage }, { type: "finish" }];
  assert.deepEqual(await guarded(chunks), chunks);
});


test("missing, failed, or unfinished optional suggestions never spoil complete core output", async () => {
  const core = [text, ...call("showReceipts")];
  const optionalStart = { type: "tool-input-start", toolName: "suggestFollowUps", toolCallId: "follow" };
  for (const optional of [
    [], [optionalStart],
    [optionalStart, { type: "tool-output-error", toolCallId: "follow", errorText: "unavailable" }],
    [{ type: "tool-input-error", toolCallId: "follow", toolName: "suggestFollowUps", input: {}, errorText: "invalid" }],
  ]) {
    const chunks = [...core, ...optional, { type: "finish", finishReason: "tool-calls" }];
    assert.deepEqual(await guarded(chunks), chunks);
  }
  const truncatedSuggestions = [...core, optionalStart, { type: "finish", finishReason: "length" }];
  assert.deepEqual(await guarded(truncatedSuggestions), truncatedSuggestions);
  const timeout = await guarded([...core, optionalStart, { type: "abort" }]);
  assert.equal(timeout.some((chunk) => chunk.type === "error"), false);
});

test("an optional tool failure cannot mask an incomplete core receipt call", async () => {
  const chunks = [text,
    { type: "tool-input-start", toolName: "showReceipts", toolCallId: "receipts" },
    { type: "tool-input-error", toolName: "suggestFollowUps", toolCallId: "follow", input: {}, errorText: "invalid" },
    { type: "finish" },
  ];
  const result = await guarded(chunks);
  assert.equal(result.filter((chunk) => chunk.type === "error").length, 1);
});
