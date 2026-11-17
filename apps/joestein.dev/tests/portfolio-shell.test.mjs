import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import * as React from "react";

const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

test("topic popping, turn isolation, reset, and freeform keyboard submission work without a third tier", async () => {
  const dom = new JSDOM("<!doctype html><html><body><main id='test-root'></main></body></html>", { url: "http://localhost" });
  const previous = Object.fromEntries(["window", "document", "HTMLElement", "Node", "IS_REACT_ACT_ENVIRONMENT", "fetch"].map((key) => [key, globalThis[key]]));
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, Node: dom.window.Node, IS_REACT_ACT_ENVIRONMENT: true });
  const requests = [];
  let includeSuggestions = true;
  globalThis.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    const count = requests.length;
    const suggestions = Array.from({ length: 3 }, (_, index) => ({ label: `Turn ${count} detail ${index}`, prompt: `Explore turn ${count} detail ${index}.` }));
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
  const context = { about: null, roles: [], projects: [], technologies: [], starterTopics: Array.from({ length: 8 }, (_, index) => ({ id: `chapter-${index}`, label: `Chapter ${index}`, prompt: `Explore chapter ${index}.` })) };
  const click = async (element) => { assert.ok(element); await React.act(async () => { element.click(); await tick(); }); };
  const findButton = (label) => [...container.querySelectorAll("button")].find((button) => button.textContent === label);
  try {
    await React.act(async () => root.render(React.createElement(PortfolioPrototype, { context })));
    assert.equal(container.querySelector('[data-slot="prompt-dock"]').getAttribute("data-conversation-state"), "idle");
    assert.equal(container.querySelectorAll('[data-bubble-tier="primary"]').length, 8);
    await click(findButton("Chapter 0"));
    assert.equal(requests.at(-1).messages.at(-1).parts[0].text, "Explore chapter 0.");
    assert.equal(container.querySelector('[data-slot="prompt-dock"]').getAttribute("data-conversation-state"), "active");
    assert.equal(container.querySelectorAll('[data-bubble-tier="primary"]').length, 7);
    assert.equal(container.querySelectorAll('[data-bubble-tier="secondary"]').length, 3);
    const firstTopic = container.querySelector('[data-topic-id="chapter-0"]');
    assert.equal(firstTopic.querySelector('[data-slot="toc-subtopics"]').children.length, 3);
    await click(findButton("Turn 1 detail 0"));
    assert.equal(requests.at(-1).messages.at(-1).parts[0].text, "Explore turn 1 detail 0.");
    assert.equal(container.querySelectorAll('[data-slot="toc-subtopics"]').length, 1);
    assert.ok(findButton("Turn 1 detail 0"));
    assert.equal(findButton("Turn 2 detail 0"), undefined);
    await click(findButton("Chapter 1"));
    assert.equal(container.querySelectorAll('[data-bubble-tier="primary"]').length, 7);
    assert.ok(findButton("Chapter 0"));
    assert.ok(container.querySelector('[data-topic-id="chapter-1"] [data-slot="toc-subtopics"]'));
    assert.ok(findButton("Turn 3 detail 0"));
    await click(findButton("Start a new conversation"));
    assert.equal(container.querySelector('[data-slot="prompt-dock"]').getAttribute("data-conversation-state"), "idle");
    assert.equal(container.querySelectorAll('[data-bubble-tier="primary"]').length, 8);
    includeSuggestions = false;
    await click(findButton("Chapter 2"));
    assert.equal(container.querySelectorAll('[data-bubble-tier="primary"]').length, 8);
    assert.equal(container.querySelectorAll('[data-slot="toc-subtopics"]').length, 0);
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
  } finally {
    await React.act(async () => root.unmount());
    Object.assign(globalThis, previous);
    dom.window.close();
  }
});
