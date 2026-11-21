"use client";

import type { RefObject } from "react";
import { defaultSitePresentation, type SitePresentation } from "@/lib/site-presentation";
import type { PromptSuggestion } from "@/lib/portfolio-navigation";
import { PROMPT_CHAR_LIMIT, promptLimitState } from "@/lib/prompt-input";
import { ExamplePromptSelect } from "./example-prompts";

export function PromptComposer({ copy = defaultSitePresentation.prompt, input, visibleInput, busy, idle, suggestions, promptRef, selectRef, onChange, onChoose, onSubmit }: {
  copy?: SitePresentation["prompt"];
  input: string; visibleInput: string; busy: boolean; idle: boolean;
  suggestions: PromptSuggestion[]; promptRef: RefObject<HTMLTextAreaElement | null>; selectRef: RefObject<HTMLSelectElement | null>;
  onChange: (value: string) => void; onChoose: (item: PromptSuggestion) => void; onSubmit: () => void;
}) {
  const limitState = promptLimitState(input.length);
  return <section data-slot="prompt-composer" aria-label="Ask Joe’s portfolio">
    {idle && <h2 data-slot="hero-headline">{copy.invitation}</h2>}
    <form data-slot="composer-card" data-limit-state={limitState} noValidate onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <label htmlFor="portfolio-prompt" data-slot="visually-hidden">Your question or brief</label>
      <header data-slot="composer-meta">
        <ExamplePromptSelect items={suggestions} disabled={busy} onChoose={onChoose} selectRef={selectRef} />
        <span id="prompt-counter" data-slot="composer-counter" data-limit-state={limitState}>
          {input.length.toLocaleString("en-US")} / {PROMPT_CHAR_LIMIT.toLocaleString("en-US")}
          {limitState === "approaching" && " · Near limit"}{limitState === "exceeded" && " · ! over limit"}
        </span>
      </header>
      <textarea ref={promptRef} id="portfolio-prompt" name="prompt" data-slot="prompt-textarea" value={visibleInput} rows={4} disabled={busy}
        aria-invalid={limitState === "exceeded" ? true : undefined}
        placeholder={copy.placeholder}
        aria-describedby="prompt-counter prompt-limit-status"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); onSubmit(); }
        }} />
      <p id="prompt-limit-status" data-slot="prompt-limit-status" role="status" aria-live="polite" hidden={limitState !== "exceeded"}>
        {limitState === "exceeded" ? "Your prompt is over the 12,000-character limit. Shorten it before sending; your full text has been preserved." : ""}
      </p>
      <footer data-slot="composer-actions">
        <button type="submit" data-slot="submit-button" disabled={busy || !input.trim() || limitState === "exceeded"}
          aria-busy={busy} data-pending={busy}>
          {busy ? copy.pendingLabel : copy.submitLabel}
        </button>
      </footer>
    </form>
  </section>;
}
