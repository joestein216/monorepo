import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import * as React from "react";

const tick = () => new Promise((resolve) => setTimeout(resolve, 30));

test("mobile composer, pending/streaming stages, limits, and click-only disclosures work together", async () => {
  const dom = new JSDOM("<!doctype html><html><body><main id='root'></main></body></html>", { url: "http://localhost", pretendToBeVisual: true });
  const keys = ["window", "self", "document", "HTMLElement", "Element", "Node", "ShadowRoot", "MutationObserver", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "ResizeObserver", "IS_REACT_ACT_ENVIRONMENT", "fetch"];
  const previous = Object.fromEntries(keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  let mobile = true;
  const viewportListeners = new Set();
  dom.window.matchMedia = (query) => ({ matches: query.includes("max-width") ? mobile : false, addEventListener: (_event, callback) => viewportListeners.add(callback), removeEventListener: (_event, callback) => viewportListeners.delete(callback) });
  const globals = {
    window: dom.window, self: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, Element: dom.window.Element,
    Node: dom.window.Node, ShadowRoot: dom.window.ShadowRoot, MutationObserver: dom.window.MutationObserver,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window), requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window), ResizeObserver: class { observe() {} unobserve() {} disconnect() {} }, IS_REACT_ACT_ENVIRONMENT: true,
  };
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  let respond;
  let failNext = false;
  let requestCount = 0;
  globalThis.fetch = async () => {
    requestCount++;
    if (failNext) return new Response("Provider unavailable", { status: 503 });
    return new Promise((resolve) => { respond = resolve; });
  };
  const { createRoot } = await import("react-dom/client");
  const { PortfolioPrototype } = await import("../components/portfolio-prototype.tsx");
  const root = createRoot(document.querySelector("#root"));
  const context = { about: null, projects: [], roles: [], technologies: [], starterTopics: [
    { id: "agents", question: "How does Joe work with coding agents?" },
    { id: "payments", question: "How does Joe build payment systems?" },
  ] };
  const narrative = "Joe built a grounded portfolio over normalized content records. " + "He validates record pointers and hydrates metadata from Sanity before presenting the evidence. ".repeat(4);
  const receipt = { type: "project", id: "portfolio", title: "joestein.dev", subtitle: "Grounded portfolio", tailoredNarrative: narrative,
    relevanceScore: 94, matchReason: "Direct evidence of grounded AI architecture.", liveUrl: "https://joestein.dev", technologies: [{ _id: "ts", name: "TypeScript" }] };
  const button = (text) => [...document.querySelectorAll("button")].find((item) => item.textContent.trim() === text);
  const act = async (action) => React.act(async () => { await action(); await tick(); });
  const fill = async (textarea, text) => act(() => {
    Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, "value").set.call(textarea, text);
    textarea.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  });
  try {
    await act(() => root.render(React.createElement(PortfolioPrototype, { context })));
    const textarea = document.querySelector("textarea");
    assert.equal(textarea.hasAttribute("maxlength"), false);
    await act(() => button(context.starterTopics[0].question).click());
    assert.equal(requestCount, 0, "the typing reveal precedes submission");
    assert.ok(context.starterTopics[0].question.startsWith(textarea.value));
    assert.ok(textarea.value.length < context.starterTopics[0].question.length);
    await fill(textarea, "An edited draft");
    await React.act(async () => { await new Promise(resolve => setTimeout(resolve, 650)); });
    assert.equal(requestCount, 0, "editing cancels a pending suggestion submission");
    assert.equal(textarea.value, "An edited draft");
    await act(() => button(context.starterTopics[0].question).click());
    await React.act(async () => { await new Promise(resolve => setTimeout(resolve, 650)); });
    assert.equal(textarea.value, context.starterTopics[0].question);
    assert.equal(requestCount, 1, "the example automatically submits after its reveal");
    assert.equal(document.querySelector('[data-slot="submit-button"]').dataset.pending, "true");
    assert.equal(document.querySelector('[data-slot="submit-button"]').getAttribute("aria-busy"), "true");
    assert.equal(document.querySelector('[data-slot="ticker-track"]'), null);
    assert.equal(document.querySelector('[data-slot="submit-button"]').textContent, "Pulling Receipts...");
    assert.equal(textarea.disabled, true);
    assert.equal(document.querySelector('[data-slot="composer-hint"]'), null);
    assert.equal(document.querySelector('[data-slot="conversation-status"]'), null);
    assert.match(document.querySelector('[data-slot="receipts-status"]').textContent, /Pulling receipts/);
    assert.equal(document.querySelector('[data-slot="stop-button"]'), null);
    assert.equal(document.querySelector("textarea"), textarea);
    assert.equal(document.querySelector('[data-slot="prompt-dock-inner"]').firstElementChild.dataset.slot, "prompt-composer");

    assert.equal(textarea.value, context.starterTopics[0].question, "the question stays visible while processing");

    let controller;
    const encoder = new TextEncoder();
    const emit = (chunk) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
    await act(() => {
      const stream = new ReadableStream({ start(value) { controller = value; } });
      respond(new Response(stream, { headers: { "Content-Type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1" } }));
      emit({ type: "start", messageId: "answer" }); emit({ type: "start-step" }); emit({ type: "text-start", id: "summary" });
      emit({ type: "text-delta", id: "summary", delta: "Joe uses coding agents with clear guardrails." });
    });
    assert.ok(document.querySelector('[data-slot="stream-cursor"]'));
    assert.ok(document.querySelector('[data-slot="receipts-status"]'));
    assert.equal(document.querySelector('[data-slot="submit-button"]').dataset.pending, "true");
    assert.equal(document.querySelector('[data-slot="assistant-turn"]').getAttribute("aria-busy"), "true");
    await act(() => {
      emit({ type: "text-end", id: "summary" });
      emit({ type: "tool-input-available", toolCallId: "receipts", toolName: "showReceipts", input: { receipts: [] } });
    });
    assert.equal(document.querySelector('[data-slot="stream-cursor"]'), null);
    assert.match(document.querySelector('[data-slot="receipts-status"]').textContent, /Pulling receipts/);
    await act(() => {
      emit({ type: "tool-output-available", toolCallId: "receipts", output: [receipt] });
      emit({ type: "finish-step" });
    });
    assert.ok(document.querySelector('[data-slot="receipts-status"]'), "progress remains through the recovery gap after core output");
    await act(() => {
      emit({ type: "start-step" });
      const suggestions = [{ question: "How does Joe scope work for Codex?" }, { question: "How does Joe review generated code?" }, { question: "How does AGENTS.md guide Joe’s work?" }];
      emit({ type: "tool-input-available", toolCallId: "follow", toolName: "suggestFollowUps", input: { suggestions } });
      emit({ type: "tool-output-available", toolCallId: "follow", output: suggestions });
      emit({ type: "finish-step" }); emit({ type: "finish", finishReason: "tool-calls" }); controller.close();
    });
    assert.equal(document.querySelector('[data-slot="assistant-turn"]').getAttribute("aria-busy"), "false");
    assert.equal(document.querySelector('[data-slot="receipts-status"]'), null);
    assert.equal(document.querySelector("textarea"), textarea);
    assert.equal(document.querySelector('nav[aria-label="Example prompts"]').querySelectorAll("ul").length, 1);
    assert.equal(textarea.value, "");
    assert.equal(textarea.disabled, false);
    const card = document.querySelector('[data-slot="receipt-card"]');
    assert.equal(card.textContent.includes(narrative), false);
    await act(() => button("more...").click());
    assert.ok(card.textContent.includes(narrative));
    assert.equal(button("less").getAttribute("aria-expanded"), "true");
    await act(() => button("less").click());
    assert.equal(card.textContent.includes(narrative), false);

    const info = document.querySelector('[data-slot="info-trigger"]');
    await act(() => info.dispatchEvent(new dom.window.MouseEvent("pointerenter", { bubbles: true })));
    assert.equal(info.getAttribute("aria-expanded"), "false");
    await act(() => info.click());
    assert.equal(info.getAttribute("aria-expanded"), "true");
    assert.equal(document.querySelector('[data-slot="relevance-popover"] p').textContent, receipt.matchReason);
    await act(() => document.activeElement.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    assert.equal(info.getAttribute("aria-expanded"), "false");
    await act(() => info.click());
    await act(() => {
      document.body.dispatchEvent(new dom.window.PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" }));
      document.body.dispatchEvent(new dom.window.PointerEvent("pointerup", { bubbles: true, pointerType: "mouse" }));
      document.body.click();
    });
    assert.equal(info.getAttribute("aria-expanded"), "false");

    await fill(textarea, "a".repeat(10_800));
    assert.match(document.querySelector('[data-slot="composer-counter"]').textContent, /Near limit/);
    await fill(textarea, "a".repeat(12_001));
    assert.equal(textarea.value.length, 12_001);
    assert.equal(textarea.getAttribute("aria-invalid"), "true");
    assert.match(document.querySelector("#prompt-limit-status").textContent, /preserved/);
    assert.equal(document.querySelector('[data-slot="submit-button"]').disabled, true);
    const count = requestCount;
    await act(() => textarea.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
    assert.equal(requestCount, count);
    await fill(textarea, "a".repeat(12_000));
    assert.equal(document.querySelector('[data-slot="submit-button"]').disabled, false);

    await act(() => { mobile = false; viewportListeners.forEach((callback) => callback()); });
    assert.equal(document.querySelector("textarea"), textarea);
    assert.equal(document.querySelector('[data-slot="prompt-dock-inner"]').firstElementChild.dataset.slot, "prompt-composer");
    failNext = true;
    const picker = document.querySelector('[data-slot="example-select"]');
    const beforeSelection = requestCount;
    await act(() => {
      picker.focus(); picker.value = "payments";
      picker.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    });
    assert.equal(requestCount, beforeSelection);
    assert.ok(context.starterTopics[1].question.startsWith(textarea.value));
    await React.act(async () => { await new Promise(resolve => setTimeout(resolve, 650)); });
    assert.equal(requestCount, beforeSelection + 1, "native selection also reveals then auto-submits");
    assert.ok(document.querySelector('[data-slot="error-banner"][role="alert"]'));
    assert.ok(button("Try that question again"));
    failNext = false;
    await act(() => button("Try that question again").click());
    assert.ok(document.querySelector('[data-slot="receipts-status"]'), "manual retries show progress before any response arrives");
    assert.equal(document.querySelector('[data-slot="submit-button"]').dataset.pending, "true");
    assert.equal(document.querySelector('[data-slot="stop-button"]'), null);
    assert.equal(textarea.disabled, true);
    assert.equal(textarea.value, context.starterTopics[1].question, "retry restores the submitted question while loading");
    await act(() => {
      const chunks = [
        { type: "start", messageId: "retried-answer" }, { type: "start-step" },
        { type: "text-start", id: "retried-summary" },
        { type: "text-delta", id: "retried-summary", delta: "Joe builds payment systems." },
        { type: "text-end", id: "retried-summary" },
        { type: "tool-input-available", toolName: "showReceipts", toolCallId: "retried-receipts", input: { receipts: [] } },
        { type: "tool-output-available", toolCallId: "retried-receipts", output: [] },
        { type: "finish-step" }, { type: "finish", finishReason: "tool-calls" },
      ];
      respond(new Response(chunks.map(chunk => `data: ${JSON.stringify(chunk)}\n\n`).join("") + "data: [DONE]\n\n",
        { headers: { "Content-Type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1" } }));
    });
    assert.equal(document.querySelector('[data-slot="receipts-status"]'), null);
    assert.equal(document.querySelector('[data-slot="submit-button"]').dataset.pending, "false");
    await act(() => button("Switch to overview").click());
    assert.ok(document.querySelector('[data-slot="overview-canvas"]'));
    assert.equal(document.querySelectorAll('[data-slot="portfolio-footer"]').length, 1);
    await act(() => button("Switch to prompt").click());
    assert.ok(document.querySelector('[data-slot="prompt-dock"] [data-slot="portfolio-footer"]'));
    assert.ok(document.querySelector('[data-slot="top-cover"][data-surface="cover"]'));
  } finally {
    await act(() => root.unmount());
    dom.window.close();
    for (const key of keys) {
      if (previous[key]) Object.defineProperty(globalThis, key, previous[key]); else delete globalThis[key];
    }
  }
});
