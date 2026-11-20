import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { followConversation } from "../lib/conversation-follow.ts";

function setup(reducedMotion = true, dockPosition = "sticky", headerPosition = "sticky") {
  const dom = new JSDOM("<header></header><section><h2>Question</h2></section><footer></footer>");
  const view = dom.window;
  const previous = globalThis.window;
  globalThis.window = view;
  const geometry = { questionTop: 500, contentBottom: 900, headerBottom: 80, dockTop: 700 };
  const calls = [];
  const frames = new Map();
  let frameId = 0;
  let notify;
  const media = new view.EventTarget();
  media.matches = reducedMotion;
  view.matchMedia = () => media;
  Object.defineProperty(view, "innerHeight", { value: 900 });
  view.requestAnimationFrame = callback => { frames.set(++frameId, callback); return frameId; };
  view.cancelAnimationFrame = id => frames.delete(id);
  view.ResizeObserver = class {
    constructor(callback) { notify = callback; }
    observe() {}
    disconnect() {}
  };
  view.scrollTo = options => {
    calls.push(options);
    if (options.behavior === "instant") {
      view.scrollY = options.top;
      view.dispatchEvent(new view.Event("scroll"));
    }
  };
  const elements = { question: view.document.querySelector("h2"), content: view.document.querySelector("section"),
    header: view.document.querySelector("header"), dock: view.document.querySelector("footer") };
  elements.question.getBoundingClientRect = () => ({ top: geometry.questionTop - view.scrollY });
  elements.content.getBoundingClientRect = () => ({ bottom: geometry.contentBottom - view.scrollY });
  elements.header.getBoundingClientRect = () => ({ bottom: geometry.headerBottom });
  elements.dock.getBoundingClientRect = () => ({ top: geometry.dockTop });
  elements.dock.style.position = dockPosition;
  elements.header.style.position = headerPosition;
  const cleanup = followConversation(elements);
  return { geometry, calls, view, media,
    resize: () => notify(),
    frame: () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); },
    dispose: () => { cleanup(); dom.window.close(); globalThis.window = previous; },
  };
}

test("follows growth above the tray, stops at the question/header boundary, and never scrolls upward", () => {
  const s = setup();
  try {
    s.frame();
    assert.equal(s.view.scrollY, 200);
    assert.equal(s.calls[0].behavior, "instant", "reduced motion overrides smooth page scrolling");
    s.geometry.contentBottom = 1100;
    s.resize(); s.resize(); s.frame();
    assert.equal(s.view.scrollY, 400);
    s.geometry.contentBottom = 950;
    s.resize(); s.frame();
    assert.equal(s.view.scrollY, 400, "content shrink does not pull the reader upward");
    s.geometry.contentBottom = 2000;
    s.resize(); s.frame();
    assert.equal(s.view.scrollY, 420, "the question stays directly below the header");
    const count = s.calls.length;
    s.geometry.contentBottom = 3000;
    s.resize(); s.frame();
    assert.equal(s.calls.length, count, "later receipts cannot push the question offscreen");
  } finally { s.dispose(); }
});

test("a normal-flow tray does not count as a viewport obstruction", () => {
  const s = setup(true, "static");
  try {
    s.frame();
    assert.equal(s.calls.length, 0, "content already fits the visible page");
    s.geometry.contentBottom = 1000;
    s.resize(); s.frame();
    assert.equal(s.view.scrollY, 100, "follow uses the viewport bottom rather than the inline tray top");
  } finally { s.dispose(); }
});

test("an inline header does not reserve space after scrolling out of view", () => {
  const s = setup(true, "sticky", "static");
  try {
    s.geometry.contentBottom = 2000;
    s.frame();
    assert.equal(s.view.scrollY, 500, "the latest question may reach the viewport top");
  } finally { s.dispose(); }
});

test("wheel, touch, pointer, and keyboard intent cancel motion and relinquish the entire turn", () => {
  for (const type of ["wheel", "touchstart", "pointerdown", "keydown"]) {
    const s = setup(false);
    try {
      s.frame();
      assert.equal(s.calls[0].behavior, "smooth");
      const input = new s.view.Event(type, { cancelable: true });
      s.view.dispatchEvent(input);
      assert.equal(input.defaultPrevented, false);
      assert.equal(s.calls.at(-1).behavior, "instant", "an in-flight smooth scroll stops immediately");
      const count = s.calls.length;
      s.geometry.contentBottom = 2500;
      s.resize(); s.frame();
      assert.equal(s.calls.length, count);
    } finally { s.dispose(); }
  }
});

test("live reduced-motion changes cancel animation and use the current tray geometry", () => {
  const s = setup(false);
  try {
    s.frame();
    s.media.matches = true;
    s.geometry.dockTop = 600;
    s.media.dispatchEvent(new s.view.Event("change"));
    s.frame();
    assert.equal(s.calls.at(-1).behavior, "instant");
    assert.equal(s.view.scrollY, 300);
  } finally { s.dispose(); }
});

test("cleanup cancels queued work; a fresh turn can follow after a previous turn relinquished control", () => {
  const first = setup();
  first.view.dispatchEvent(new first.view.Event("pointerdown"));
  first.frame();
  assert.equal(first.calls.length, 0);
  first.dispose();
  const next = setup();
  try { next.frame(); assert.equal(next.view.scrollY, 200); }
  finally { next.dispose(); }
});
