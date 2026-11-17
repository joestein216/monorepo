import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import * as React from "react";

const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

test("flat prompt replacement preserves origin, order, turn isolation, reset, and freeform submission", async () => {
  const dom = new JSDOM("<!doctype html><html><body><main id='test-root'></main></body></html>", { url: "http://localhost" });
  const previous = Object.fromEntries(["window", "document", "HTMLElement", "Node", "IS_REACT_ACT_ENVIRONMENT", "fetch"].map((key) => [key, globalThis[key]]));
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, Node: dom.window.Node, IS_REACT_ACT_ENVIRONMENT: true });
  const requests = [];
  let includeSuggestions = true;
  let responseFailure = false;
  globalThis.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    if (responseFailure) return new Response("Provider failed: internal detail", { status: 503 });
    const count = requests.length;
    const suggestions = Array.from({ length: 3 }, (_, index) => ({ question: `What is turn ${count} detail ${index}?` }));
    const chunks = [
      { type: "start", messageId: `answer-${count}` },
      { type: "start-step" },
      { type: "text-start", id: `text-${count}` },
      { type: "text-delta", id: `text-${count}`, delta: "Joe has relevant experience." },
      { type: "text-end", id: `text-${count}` },
      ...(includeSuggestions ? [
        { type: "tool-input-available", toolCallId: `follow-${count}`, toolName: "suggestFollowUps", input: { suggestions } },
        { type: "tool-output-available", toolCallId: `follow-${count}`, output: suggestions },
      ] : []),
      { type: "finish-step" },
      { type: "finish", finishReason: "stop" },
    ];
    return new Response(chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "Content-Type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1" } });
  };
  const { createRoot } = await import("react-dom/client");
  const { PortfolioPrototype } = await import("../components/portfolio-prototype.tsx");
  const container = document.querySelector("#test-root");
  const root = createRoot(container);
  const context = { about: null, roles: [], projects: [], technologies: [], starterTopics: Array.from({ length: 8 }, (_, index) => ({ id: `chapter-${index}`, question: `What is chapter ${index}?` })) };
  const click = async (element) => { assert.ok(element); await React.act(async () => { element.click(); await tick(); }); };
  const findButton = (label) => [...container.querySelectorAll("button")].find((button) => button.textContent === label);
  try {
    await React.act(async () => root.render(React.createElement(PortfolioPrototype, { context })));
    assert.equal(container.querySelector('[data-slot="prompt-dock"]').getAttribute("data-conversation-state"), "idle");
    assert.equal(container.querySelectorAll('[data-slot="topic-item"][data-tier="starter"]').length, 8);
    findButton("What is chapter 0?").focus();
    await click(findButton("What is chapter 0?"));
    assert.equal(document.activeElement, findButton("What is turn 1 detail 0?"));
    assert.equal(requests.at(-1).messages.at(-1).parts[0].text, "What is chapter 0?");
    assert.equal(container.querySelector('[data-slot="prompt-dock"]').getAttribute("data-conversation-state"), "active");
    assert.equal(container.querySelectorAll('[data-slot="topic-item"][data-tier="starter"]').length, 7);
    assert.equal(container.querySelectorAll('[data-slot="topic-item"][data-tier="contextual"]').length, 3);
    const nav = container.querySelector('nav[aria-label="Portfolio topics"]');
    assert.equal(nav.querySelectorAll("ul").length, 1);
    assert.equal(nav.querySelectorAll("ul ul").length, 0);
    assert.equal(nav.querySelector("ul").children.length, 10);
    const contextual = [...nav.querySelectorAll('[data-tier="contextual"]')];
    assert.ok(contextual.every((item) => item.dataset.originId === "chapter-0"));
    assert.equal(contextual[0].querySelector("button").getAttribute("aria-label"),
      "Follow-up on What is chapter 0?: What is turn 1 detail 0?");
    assert.equal(contextual[0].querySelector("button").textContent, "What is turn 1 detail 0?");
    assert.deepEqual([...nav.querySelector("ul").children].slice(0, 4).map((item) => item.textContent), [
      "What is turn 1 detail 0?", "What is turn 1 detail 1?", "What is turn 1 detail 2?", "What is chapter 1?",
    ]);
    await click(findButton("What is turn 1 detail 0?"));
    assert.equal(requests.at(-1).messages.at(-1).parts[0].text, "What is turn 1 detail 0?");
    assert.equal(nav.querySelectorAll("ul").length, 1);
    assert.ok(findButton("What is turn 1 detail 0?"));
    assert.equal(findButton("What is turn 2 detail 0?"), undefined);
    await click(findButton("What is chapter 1?"));
    assert.equal(container.querySelectorAll('[data-slot="topic-item"][data-tier="starter"]').length, 6);
    assert.equal(container.querySelectorAll('[data-slot="topic-item"][data-tier="contextual"]').length, 6);
    assert.equal(findButton("What is chapter 0?"), undefined);
    assert.ok(findButton("What is turn 1 detail 0?"));
    assert.ok(findButton("What is turn 3 detail 0?"));
    assert.equal(nav.querySelectorAll('[data-origin-id="chapter-0"]').length, 3);
    assert.equal(nav.querySelectorAll('[data-origin-id="chapter-1"]').length, 3);
    assert.equal(nav.querySelectorAll("ul").length, 1);
    assert.equal(nav.querySelector("ul").children.length, 12);
    await click(findButton("Start a new conversation"));
    assert.equal(container.querySelector('[data-slot="prompt-dock"]').getAttribute("data-conversation-state"), "idle");
    assert.equal(container.querySelectorAll('[data-slot="topic-item"][data-tier="starter"]').length, 8);
    includeSuggestions = false;
    await click(findButton("What is chapter 2?"));
    assert.equal(container.querySelectorAll('[data-slot="topic-item"][data-tier="starter"]').length, 8);
    assert.equal(container.querySelectorAll('[data-slot="topic-item"][data-tier="contextual"]').length, 0);
    await React.act(async () => root.render(React.createElement(PortfolioPrototype, { context: { ...context, starterTopics: [] }, key: "empty-topics" })));
    assert.equal(container.querySelector('nav[aria-label="Portfolio topics"]'), null);
    const textarea = container.querySelector("textarea");
    assert.equal(textarea.maxLength, 2000);
    await React.act(async () => {
      Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, "value").set.call(textarea, "Explain Joe’s work.\nInclude trade-offs.");
      textarea.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    });
    const count = requests.length;
    const shifted = new dom.window.KeyboardEvent("keydown", { key: "Enter", shiftKey: true, bubbles: true, cancelable: true });
    await React.act(async () => textarea.dispatchEvent(shifted));
    assert.equal(shifted.defaultPrevented, false);
    assert.equal(requests.length, count);
    await React.act(async () => { textarea.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })); await tick(); });
    assert.equal(requests.length, count + 1);
    assert.equal(requests.at(-1).messages.at(-1).parts[0].text, "Explain Joe’s work.\nInclude trade-offs.");
    assert.equal(container.querySelector('[role="alert"]'), null);
    assert.equal(container.querySelector("[style], [class]"), null);
    assert.equal(container.querySelector('[data-slot="conversation"]').hasAttribute("aria-live"), false);
    assert.equal(container.querySelector('output[aria-label="Summary"]').getAttribute("aria-live"), "off");
    responseFailure = true;
    await React.act(async () => {
      Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, "value").set.call(textarea, "What about ERP?");
      textarea.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    });
    await React.act(async () => { textarea.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })); await tick(); });
    assert.match(container.querySelector('[role="alert"]').textContent, /Try again or ask another question/);
    assert.equal(container.textContent.includes("internal detail"), false);
    assert.equal(textarea.matches(":disabled"), false);
    assert.ok(container.textContent.includes("Joe has relevant experience."), "previous live answer survives later failure");
    responseFailure = false;
    const previousCount = requests.length;
    await click(findButton("Try that question again"));
    assert.equal(requests.length, previousCount + 1, "retry makes a new provider request");
    assert.equal(requests.at(-1).messages.at(-1).parts[0].text, "What about ERP?");
    assert.equal(container.querySelector('[role="alert"]'), null);
  } finally {
    await React.act(async () => root.unmount());
    Object.assign(globalThis, previous);
    dom.window.close();
  }
});
