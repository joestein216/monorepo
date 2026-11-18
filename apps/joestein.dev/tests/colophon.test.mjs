import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markdownToPortableText, buildColophonDocument } from "../scripts/markdown-to-portable-text.mjs";
import { ColophonContent, editorialHref } from "../components/colophon-content.tsx";
import { PortfolioHeader } from "../components/portfolio-header.tsx";
import { PortfolioPrototype } from "../components/portfolio-prototype.tsx";
import { getPortfolioPromptData } from "../lib/receipt-catalog.ts";

const markdown = readFileSync(new URL("../content/making-of-joestein-dev.md", import.meta.url), "utf8");
const document = buildColophonDocument(markdown);

test("reviewed import retains both diagrams, unique keys, semantic headings and editorial marks", () => {
  assert.equal(document._id, "page-colophon");
  assert.equal(document.slug.current, "colophon");
  assert.equal(document.body.filter(block => block._type === "mermaidDiagram").length, 2);
  assert.equal(new Set(document.body.map(block => block._key)).size, document.body.length);
  assert.equal(document.body.some(block => block.style === "h1"), false);
  const text = document.body.filter(block => block._type === "block").flatMap(block => block.children).map(span => span.text).join(" ");
  assert.ok(text.includes('cache: "no-store"'));
  assert.ok(text.includes("not proof of narrative accuracy"));
  assert.equal(text.includes("60s TTL"), false);
  assert.equal(text.includes("Zero-Coordination Alignment"), false);
});

test("Markdown conversion preserves links, code, quotes, nested lists, and table values", () => {
  const body = markdownToPortableText('## Heading\n\nA **bold** and *italic* paragraph with `code` and [link](/colophon).\n\n> A quote\n\n1. First\n   - Nested\n2. Second\n\n```ts\nconst raw = "<script>";\n```\n\n| Name | Value |\n| --- | --- |\n| Counter | 12000 |');
  assert.ok(body.some(block => block.style === "h2"));
  assert.ok(body.some(block => block.style === "blockquote"));
  assert.ok(body.some(block => block.listItem === "number"));
  assert.ok(body.some(block => block.listItem === "bullet" && block.level === 2));
  assert.equal(body.find(block => block._type === "codeBlock").code, 'const raw = "<script>";');
  assert.ok(body.some(block => block.children?.some(span => span.marks.includes("strong"))));
  assert.ok(body.some(block => block.children?.some(span => span.marks.includes("em"))));
  assert.ok(body.some(block => block.markDefs?.some(mark => mark.href === "/colophon")));
  assert.ok(body.some(block => block.children?.some(span => span.text.includes("12000"))));
});

test("colophon renders semantic content and inspectable diagrams without inline presentation", () => {
  const html = renderToStaticMarkup(React.createElement(ColophonContent, { page: document }));
  assert.equal((html.match(/<h1 /g) ?? []).length, 1);
  assert.equal((html.match(/data-slot="diagram-source"/g) ?? []).length, 2);
  assert.equal((html.match(/role="img"/g) ?? []).length, 2);
  assert.ok(html.includes("flowchart TD"));
  assert.ok(html.includes("stateDiagram-v2"));
  assert.ok(html.includes('data-slot="colophon-list"'));
  assert.equal(/style=|class=|width=/.test(html), false);
  assert.ok(html.includes("/?mode=prompt"));
});

test("shared header links return to the actual prompt/overview mode and the colophon has one page heading", () => {
  const html = renderToStaticMarkup(React.createElement(PortfolioHeader, { colophon: true }));
  assert.ok(html.includes('href="/?mode=overview"'));
  assert.ok(html.includes('href="/?mode=prompt"'));
  assert.ok(html.includes('aria-current="page"'));
  assert.equal(html.includes("<h1"), false);
  const context = { about: null, projects: [], roles: [], technologies: [], colophonSummary: null, starterTopics: [] };
  const overview = renderToStaticMarkup(React.createElement(PortfolioPrototype, { context, initialMode: "overview" }));
  assert.ok(overview.includes('data-slot="overview-canvas"'));
  assert.ok(overview.includes('href="/colophon"'));
});

test("colophon prose and technical blocks reach Gemini without entering the selectable receipt catalog", () => {
  const colophonSummary = { title: document.title, subtitle: document.subtitle, plainText: "Server hydration resolves exact IDs.",
    technicalBlocks: document.body.filter(block => block._type === "mermaidDiagram") };
  const data = getPortfolioPromptData({ about: null, projects: [], roles: [], technologies: [], colophonSummary });
  assert.deepEqual(data.colophonSummary, colophonSummary);
  assert.deepEqual(data.receiptCatalog, []);
});

test("editorial links retain safe internal and external URLs and reject active content", () => {
  for (const url of ["/colophon", "#architecture", "https://example.com", "mailto:joe@example.com"]) assert.equal(editorialHref(url), url);
  for (const url of ["javascript:alert(1)", "data:text/html,<script>", "//evil.example", "/\\evil.example", "/\nevil.example"]) assert.equal(editorialHref(url), undefined);
});
