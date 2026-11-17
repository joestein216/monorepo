import assert from "node:assert/strict";
import { test } from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
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
