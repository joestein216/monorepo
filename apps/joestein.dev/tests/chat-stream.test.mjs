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

test("complete bundles stop immediately; missing companion tools get at most one additional step", () => {
  for (const name of ["showReceipts", "showDownloads", "showOverview"]) {
    assert.equal(portfolioTurnComplete({ steps: [step(name, "suggestFollowUps")] }), true);
    assert.equal(portfolioTurnComplete({ steps: [step(name)] }), false);
    assert.equal(portfolioTurnComplete({ steps: [step(name), step("suggestFollowUps")] }), true);
  }
  assert.equal(portfolioTurnComplete({ steps: [step(), step()] }), true);
});

test("successful live text and tool results pass through unchanged, including empty evidence", async () => {
  const chunks = [text, ...call("showReceipts"), ...call("suggestFollowUps"), { type: "finish", finishReason: "tool-calls" }];
  assert.deepEqual(await guarded(chunks), chunks);
  assert.deepEqual(await guarded([text, { type: "finish", finishReason: "stop" }]), [text, { type: "finish", finishReason: "stop" }]);
});

test("truncation, empty streams, pending tools, missing companions, and timeout aborts disclose failure", async () => {
  for (const chunks of [
    [], [{ type: "finish", finishReason: "stop" }],
    [text, { type: "finish", finishReason: "length" }],
    [text, ...call("showReceipts"), { type: "finish" }],
    [text, ...call("suggestFollowUps"), { type: "finish" }],
    [text, { type: "tool-input-start", toolName: "showReceipts", toolCallId: "pending" }, { type: "finish" }],
    [text, { type: "abort" }],
    [text, { type: "tool-output-error", toolCallId: "suggestFollowUps", errorText: "failed" }, { type: "finish" }],
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
