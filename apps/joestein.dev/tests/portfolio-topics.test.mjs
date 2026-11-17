import assert from "node:assert/strict";
import { test } from "node:test";
import { fallbackStarterTopics, resolveStarterTopics, starterTopicsSchema } from "../lib/portfolio-topics.ts";
import { getTurnFollowUps } from "../lib/portfolio-navigation.ts";
import { createPortfolioTools } from "../lib/portfolio-tools.ts";

const empty = () => ({ about: null, projects: [], roles: [], technologies: [] });
const suggestions = (prefix) => Array.from({ length: 3 }, (_, i) => ({ label: `${prefix} detail ${i}`, prompt: `What can Joe explain about ${prefix} detail ${i}?` }));
const assistant = (items) => ({ id: "reply", role: "assistant", parts: [{ type: "tool-suggestFollowUps", toolCallId: "follow", state: "output-available", output: items }] });

test("fallback always supplies eight distinct usable topics, even for empty context", () => {
  const topics = fallbackStarterTopics(empty());
  assert.equal(topics.length, 8);
  assert.equal(starterTopicsSchema.safeParse({ starterTopics: topics }).success, true);
  assert.deepEqual(topics, fallbackStarterTopics(empty()));
});

test("fallback is derived from current projects and spans oldest and newest roles", () => {
  const context = empty();
  context.projects = [{ _id: "new-domain", title: "Warehouse operations" }];
  context.roles = [{ _id: "newest", company: "Current systems" }, { _id: "middle", company: "Payments" }, { _id: "oldest", company: "Supplier ERP" }];
  const topics = fallbackStarterTopics(context);
  assert.equal(topics.length, 8);
  for (const phrase of ["Warehouse operations", "Current systems", "Supplier ERP"]) assert.ok(topics.some((topic) => topic.prompt.includes(phrase)));
});

test("generation failure, duplicate topics, and malformed results resolve to deterministic fallback", async () => {
  const context = empty();
  const fallback = fallbackStarterTopics(context);
  assert.deepEqual(await resolveStarterTopics(context), fallback);
  assert.deepEqual(await resolveStarterTopics(context, async () => { throw new Error("Provider failed"); }), fallback);
  assert.deepEqual(await resolveStarterTopics(context, async () => ({ starterTopics: Array(8).fill(fallback[0]) })), fallback);
  assert.deepEqual(await resolveStarterTopics(context, async () => ({ starterTopics: [] })), fallback);
  const generated = fallback.map((topic) => ({ ...topic, label: `Explore ${topic.label}` }));
  assert.deepEqual(await resolveStarterTopics(context, async () => ({ starterTopics: generated })), generated);
});

test("suggestFollowUps validates exactly three questions and returns their contents", async () => {
  const tool = createPortfolioTools(empty()).suggestFollowUps;
  const input = await tool.inputSchema.parseAsync({ suggestions: suggestions("Systems") });
  assert.deepEqual(await tool.execute(input, { toolCallId: "test", messages: [] }), input.suggestions);
  for (const count of [0, 2, 4]) assert.equal(tool.inputSchema.safeParse({ suggestions: Array.from({ length: count }, () => suggestions("Test")[0]) }).success, false);
});

test("follow-ups are scoped to the popped primary turn, not older or secondary turns", () => {
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
