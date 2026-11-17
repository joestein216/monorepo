import { z } from "zod";

export const PROMPT_CHAR_LIMIT = 12_000;
export const PROMPT_APPROACHING_LIMIT = 10_800;
export const promptInputSchema = z.string().max(PROMPT_CHAR_LIMIT)
  .refine((text) => text.trim().length > 0, "Enter a question or brief.");
export function promptLimitState(length: number) {
  return length > PROMPT_CHAR_LIMIT ? "exceeded" : length >= PROMPT_APPROACHING_LIMIT ? "approaching" : "normal";
}
