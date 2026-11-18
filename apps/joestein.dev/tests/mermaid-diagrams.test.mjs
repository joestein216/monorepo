import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { buildColophonDocument } from "../scripts/markdown-to-portable-text.mjs";
import { renderPortfolioDiagram } from "../lib/mermaid-renderer.ts";

test("both editorial diagrams parse and render sanitized, fluid SVG with inspectable source", async () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true });
  const keys = ["window", "document", "Element", "HTMLElement", "SVGElement", "CSSStyleSheet", "getComputedStyle"];
  const previous = Object.fromEntries(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const key of keys) Object.defineProperty(globalThis, key, { configurable: true, writable: true,
    value: key === "window" ? dom.window : key === "getComputedStyle" ? dom.window.getComputedStyle.bind(dom.window) : dom.window[key] });
  // jsdom has no SVG layout engine. Supply text geometry for parser/render and
  // sanitization coverage; this does not claim browser visual verification.
  dom.window.SVGElement.prototype.getBBox = function () { return { x: 0, y: 0, width: Math.max(100, (this.textContent?.length ?? 0) * 7), height: 20 }; };
  dom.window.SVGElement.prototype.getComputedTextLength = function () { return (this.textContent?.length ?? 0) * 7; };
  try {
    const document = buildColophonDocument(readFileSync(new URL("../content/making-of-joestein-dev.md", import.meta.url), "utf8"));
    for (const [index, diagram] of document.body.filter(block => block._type === "mermaidDiagram").entries()) {
      const svg = await renderPortfolioDiagram(`test-diagram-${index}`, diagram.code);
      assert.equal(svg.localName, "svg");
      assert.ok(svg.getAttribute("viewBox"));
      assert.equal(svg.hasAttribute("width"), false);
      assert.equal(svg.hasAttribute("height"), false);
      assert.equal(svg.querySelector("style, script, foreignObject, [style]"), null);
      assert.equal(svg.getAttribute("aria-hidden"), "true");
      assert.ok(svg.textContent.length > 30);
    }
    await assert.rejects(() => renderPortfolioDiagram("bad-config", '%%{init: {"securityLevel":"loose"}}%%\nflowchart TD\nA-->B'), /configuration directives/);
    await assert.rejects(() => renderPortfolioDiagram("bad-source", "This is not a diagram"));
  } finally {
    dom.window.close();
    for (const key of keys) { if (previous[key]) Object.defineProperty(globalThis, key, previous[key]); else delete globalThis[key]; }
  }
});
