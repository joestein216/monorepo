import assert from "node:assert/strict";
import { test } from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { getSitePresentation, defaultSitePresentation } from "../lib/site-presentation.ts";
import { ModeControl } from "../components/mode-control.tsx";
import { PortfolioHeader } from "../components/portfolio-header.tsx";
import { PortfolioFooter } from "../components/portfolio-footer.tsx";
import { PortfolioPrototype } from "../components/portfolio-prototype.tsx";

const settings = {
  identity: { brandName: "A Different Portfolio" },
  modes: {
    prompt: { label: "Ask me", navigationLabel: "Start a conversation" },
    overview: { label: "Career index", navigationLabel: "Browse the evidence" },
    unknown: { label: "Invent a capability", href: "https://example.com" },
  },
  navigation: { colophonLabel: "Behind the build" },
  promptExperience: { invitation: "What would you like to explore?", placeholder: "Describe your challenge", submitLabel: "Ask", pendingLabel: "Finding evidence…" },
};
const markup = (Component, props) => new JSDOM(renderToStaticMarkup(React.createElement(Component, props)));

test("editorial wording changes do not change supported mode identity or routes", () => {
  const presentation = getSitePresentation(settings);
  assert.deepEqual(Object.keys(presentation.modes), ["prompt", "overview"]);
  const dom = markup(PortfolioHeader, { colophon: true, presentation });
  try {
    const doc = dom.window.document;
    assert.equal(doc.querySelector('[data-slot="brand-title"]').textContent, settings.identity.brandName);
    assert.equal(doc.querySelector("h1"), null, "an editorial page retains its own page heading");
    const modes = [...doc.querySelectorAll('[data-slot="mode-control"] a')];
    assert.deepEqual(modes.map(link => [link.dataset.mode, link.textContent, link.getAttribute("href")]), [
      ["prompt", "Ask me", "/?mode=prompt"], ["overview", "Career index", "/?mode=overview"],
    ]);
    assert.equal(doc.querySelector('[aria-current="page"]').textContent, "Behind the build");
    assert.equal(doc.querySelector('[data-slot="mode-control"]').dataset.placement, "header");
  } finally { dom.window.close(); }
});

test("placement changes the representation without inferring a page's current mode", () => {
  const labels = getSitePresentation(settings).modes;
  for (const [placement, expected] of [["header", ["prompt", "overview"]], ["footer", ["overview"]]]) {
    const dom = markup(ModeControl, { placement, mode: "prompt", labels, onModeChange() {} });
    try {
      const buttons = [...dom.window.document.querySelectorAll("button")];
      assert.deepEqual(buttons.map(button => button.dataset.mode), expected);
      assert.equal(buttons.filter(button => button.getAttribute("aria-pressed") === "true").length, placement === "header" ? 1 : 0);
      if (placement === "footer") assert.equal(buttons[0].textContent, "Browse the evidence");
    } finally { dom.window.close(); }
  }
  const dom = markup(PortfolioFooter, { colophon: true, presentation: getSitePresentation(settings) });
  try {
    assert.equal(dom.window.document.querySelectorAll('[data-slot="mode-control"] a').length, 2);
    assert.equal(dom.window.document.querySelector('[data-slot="mode-control"] [aria-current]'), null);
    assert.equal(dom.window.document.querySelector("nav nav"), null);
  } finally { dom.window.close(); }
});

test("missing or blank copy has deterministic UI defaults and the home shell uses supplied settings", () => {
  assert.deepEqual(getSitePresentation(null), defaultSitePresentation);
  assert.equal(getSitePresentation({ identity: { brandName: "  " }, modes: { prompt: { label: "" } } }).modes.prompt.label, "Prompt");
  const dom = markup(PortfolioPrototype, { context: { siteSettings: settings, about: null, projects: [], roles: [], technologies: [], starterTopics: [] } });
  try {
    const doc = dom.window.document;
    assert.equal(doc.querySelector('[data-slot="hero-headline"]').textContent, settings.promptExperience.invitation);
    assert.equal(doc.querySelector("textarea").placeholder, settings.promptExperience.placeholder);
    assert.equal(doc.querySelector('[data-slot="submit-button"]').textContent, "Ask");
    assert.ok([...doc.querySelectorAll('[data-slot="brand-title"], [data-slot="portfolio-footer"] small')].every(item => item.textContent === settings.identity.brandName));
  } finally { dom.window.close(); }
});
