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
