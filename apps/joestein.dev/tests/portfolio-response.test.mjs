import assert from "node:assert/strict";
import { test } from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReceiptCard } from "../components/portfolio-content.tsx";
import { PortfolioResponse } from "../components/portfolio-response.tsx";

test("identical summary parts render once, preserving distinct text and first-seen order", () => {
  const first = "Joe builds grounded systems.";
  const second = "His evidence stays in Sanity.";
  const message = {
    id: "duplicate-step-text", role: "assistant",
    parts: [first, first, second, ` ${first} `, "", "  ", second].map((text) => ({ type: "text", text })),
  };
  const html = renderToStaticMarkup(React.createElement(PortfolioResponse, { message }));
  assert.equal(html.split(first).length - 1, 1);
  assert.equal(html.split(second).length - 1, 1);
  assert.match(html, new RegExp(`${first}\\n\\n${second}`));
});


test("multiple receipt tool calls share a maximum of three ranked cards", () => {
  const receipt = (id, relevanceScore) => ({ type: "project", id, relevanceScore, matchReason: "Direct evidence", tailoredNarrative: `Vignette ${id}.`, title: id, technologies: [] });
  const message = { id: "repeated-tools", role: "assistant", parts: [
    { type: "tool-showReceipts", toolCallId: "one", state: "output-available", input: { receipts: [] }, output: [receipt("one", 50), receipt("two", 60), receipt("three", 70)] },
    { type: "text", text: "Joe has relevant work." },
    { type: "tool-showReceipts", toolCallId: "two", state: "output-available", input: { receipts: [] }, output: [receipt("one", 90), receipt("four", 80)] },
  ] };
  const html = renderToStaticMarkup(React.createElement(PortfolioResponse, { message }));
  assert.equal((html.match(/data-slot="receipt-card"/g) ?? []).length, 3);
  assert.ok(html.indexOf("Joe has relevant work.") < html.indexOf('aria-label="Receipts"'));
  assert.ok(html.indexOf("Vignette one.") < html.indexOf("Vignette four."));
  assert.ok(html.indexOf("Vignette four.") < html.indexOf("Vignette three."));
  assert.equal(html.includes("Vignette two."), false);
  assert.equal(html.includes("Show all"), false);
});

test("stream cursor follows actual text state, then yields to receipt hydration status", () => {
  const message = { id: "stream", role: "assistant", parts: [
    { type: "text", text: "Joe built this system.", state: "streaming" },
    { type: "tool-showReceipts", toolCallId: "pending", state: "input-streaming" },
  ] };
  const prose = renderToStaticMarkup(React.createElement(PortfolioResponse, { message, streaming: true }));
  assert.ok(prose.includes('data-slot="stream-cursor"'));
  assert.equal(prose.includes("Pulling matching receipts"), false);
  message.parts[0].state = "done";
  const tools = renderToStaticMarkup(React.createElement(PortfolioResponse, { message, streaming: true }));
  assert.equal(tools.includes('data-slot="stream-cursor"'), false);
  assert.ok(tools.includes("Pulling matching receipts…"));
  assert.ok(tools.indexOf("Pulling matching receipts…") < tools.indexOf('data-slot="receipt-list"'));
});


test("receipts without reasons retain the score and vignette but have no explanation trigger", () => {
  const receipt = { type: "project", id: "no-reason", title: "Portfolio", relevanceScore: 91, tailoredNarrative: "Joe built grounded systems.", technologies: [] };
  const html = renderToStaticMarkup(React.createElement(ReceiptCard, { receipt }));
  assert.ok(html.includes(receipt.tailoredNarrative));
  assert.ok(html.includes('Relevance score 91 out of 100.'));
  assert.equal(html.includes('data-slot="info-trigger"'), false);
  assert.equal(html.includes("Click for reasoning"), false);
});
