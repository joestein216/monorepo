import assert from "node:assert/strict";
import { test } from "node:test";
import { promptInputSchema, promptLimitState } from "../lib/prompt-input.ts";

test("prompt limits preserve pasted briefs and share the same acceptance boundary", () => {
  assert.equal(promptLimitState(10_799), "normal");
  assert.equal(promptLimitState(10_800), "approaching");
  assert.equal(promptLimitState(12_000), "approaching");
  assert.equal(promptLimitState(12_001), "exceeded");
  assert.equal(promptInputSchema.safeParse("a".repeat(12_000)).success, true);
  assert.equal(promptInputSchema.safeParse("a".repeat(12_001)).success, false);
  assert.equal(promptInputSchema.safeParse("  ").success, false);
});
