import assert from "node:assert/strict";
import { test } from "node:test";
import { getStarterTopics } from "../lib/portfolio-topics.ts";
import { getTurnFollowUps, getPromptSuggestions } from "../lib/portfolio-navigation.ts";
import { createPortfolioTools } from "../lib/portfolio-tools.ts";

const empty = () => ({ siteSettings: null, about: null, projects: [], roles: [], technologies: [] });
const suggestions = (prefix) => Array.from({ length: 3 }, (_, i) => ({ question: `What can Joe explain about ${prefix} detail ${i}?` }));
const assistant = (items) => ({ id: "reply", role: "assistant", parts: [{ type: "tool-suggestFollowUps", toolCallId: "follow", state: "output-available", output: items }] });

test("starter questions preserve the editor’s wording, order, and stable keys", () => {
  const context = { ...empty(), siteSettings: { promptExperience: { starterQuestions: [
    { _key: "payments", question: "How does Joe build reliable payment systems?" },
    { _key: "ai", question: "How does Joe build grounded AI systems?" },
  ] } } };
  assert.deepEqual(getStarterTopics(context), [
    { id: "payments", question: "How does Joe build reliable payment systems?" },
    { id: "ai", question: "How does Joe build grounded AI systems?" },
  ]);
  context.siteSettings.promptExperience.starterQuestions.reverse();
  assert.equal(getStarterTopics(context)[0].id, "ai");
});

test("absent or empty editorial questions never synthesize a replacement menu", () => {
  for (const siteSettings of [null, {}, { promptExperience: { starterQuestions: [] } }]) {
    assert.deepEqual(getStarterTopics({ ...empty(), siteSettings, about: { starterQuestions: [{ _key: "legacy", question: "Old menu" }] } }), []);
  }
});

test("invalid editorial entries are skipped without hiding valid questions", () => {
  const context = { ...empty(), siteSettings: { promptExperience: { starterQuestions: [
    { _key: "blank", question: " " }, { _key: "missing", question: null },
    { _key: "long", question: "A".repeat(66) },
    { _key: "valid", question: "How does Joe work with coding agents?" },
  ] } } };
  assert.deepEqual(getStarterTopics(context), [{ id: "valid", question: "How does Joe work with coding agents?" }]);
});

test("suggestFollowUps validates exactly three questions and returns their contents", async () => {
  const tool = createPortfolioTools(empty()).suggestFollowUps;
  const input = await tool.inputSchema.parseAsync({ suggestions: suggestions("Systems") });
  assert.deepEqual(await tool.execute(input, { toolCallId: "test", messages: [] }), input.suggestions);
  for (const count of [0, 2, 4]) assert.equal(tool.inputSchema.safeParse({ suggestions: Array.from({ length: count }, () => suggestions("Test")[0]) }).success, false);
});

test("contextual suggestions are scoped to their starter turn, not other conversation turns", () => {
  const messages = [
    { id: "old", role: "user", parts: [] }, assistant(suggestions("Old")),
    { id: "primary", role: "user", parts: [] }, assistant(suggestions("Primary")),
    { id: "secondary", role: "user", parts: [] }, assistant(suggestions("Secondary")),
    { id: "next-primary", role: "user", parts: [] },
  ];
  assert.deepEqual(getTurnFollowUps(messages, "primary"), suggestions("Primary"));
  assert.deepEqual(getTurnFollowUps(messages, "next-primary"), []);
  assert.deepEqual(getTurnFollowUps(messages, "missing"), []);
  assert.deepEqual(getTurnFollowUps(messages, null), []);
  assert.deepEqual(getTurnFollowUps([{ id: "primary", role: "user", parts: [] }, assistant([])], "primary"), []);
});


test("flat prompt suggestions retain stable lineage across independent starter replacements", () => {
  const starters = [{ id: "ai", question: "How does Joe use coding agents?" }, { id: "payments", question: "How does Joe handle payments?" }];
  const messages = [
    { id: "agents-turn", role: "user", parts: [{ type: "text", text: starters[0].question }] }, assistant(suggestions("Agents")),
    { id: "payments-turn", role: "user", parts: [] }, assistant(suggestions("Payments")),
  ];
  const items = getPromptSuggestions(starters, messages, { ai: "agents-turn", payments: "payments-turn" });
  assert.equal(items.length, 6);
  assert.equal(new Set(items.map((item) => item.id)).size, 6);
  assert.ok(items.every((item) => item.tier === "contextual"));
  assert.ok(items.slice(0, 3).every((item) => item.originTopicId === "ai" && item.originLabel === starters[0].question));
  assert.ok(items.slice(3).every((item) => item.originTopicId === "payments" && item.originLabel === starters[1].question));
  assert.deepEqual(getPromptSuggestions(starters, messages, {}), starters.map(({ id, question }) => ({ id, prompt: question, tier: "starter" })));
  assert.deepEqual(getPromptSuggestions([], messages, {}), []);
  const editedStarters = [{ ...starters[0], question: "How does Joe collaborate with Codex?" }];
  assert.equal(getPromptSuggestions(editedStarters, messages, { ai: "agents-turn" })[0].originLabel, starters[0].question);
});
