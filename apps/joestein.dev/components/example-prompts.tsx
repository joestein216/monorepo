"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { Collapsible } from "@base-ui-components/react/collapsible";
import type { PromptSuggestion } from "@/lib/portfolio-navigation";

type Props = { items: PromptSuggestion[]; disabled: boolean; onChoose: (item: PromptSuggestion) => void };
const previewCount = 4;

export function ExamplePromptSelect({ items, disabled, onChoose, selectRef }: Props & { selectRef: RefObject<HTMLSelectElement | null> }) {
  const id = useId();
  const [value, setValue] = useState("");
  return <span data-slot="example-picker">
    <label htmlFor={id} data-slot="visually-hidden">Example prompts</label>
    <select ref={selectRef} id={id} data-slot="example-select" disabled={disabled || !items.length}
      value={items.some((item) => item.id === value) ? value : ""} aria-describedby={`${id}-help`}
      onBlur={() => setValue("")} onChange={(event) => {
        setValue(event.target.value);
        const item = items.find((item) => item.id === event.target.value);
        if (item) onChoose(item);
      }}>
      <option value="">Example prompts</option>
      {items.map((item) => <option key={item.id} value={item.id} data-tier={item.tier} data-origin-id={item.originTopicId}>{item.prompt}</option>)}
    </select>
    <span data-slot="example-picker-icon" aria-hidden="true">▾</span>
    <span id={`${id}-help`} data-slot="visually-hidden">Optional. Choosing an example types it into the question box and sends it automatically.</span>
  </span>;
}

export function ExamplePrompts({ items, disabled, onChoose, selectRef }: Props & { selectRef: RefObject<HTMLSelectElement | null> }) {
  const region = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const focusWasInside = useRef(false);
  const listId = useId();
  const [expanded, setExpanded] = useState(false);
  // CSS owns visibility. Recover focus only if a layout change hides the
  // focused companion; never move focus away from a reader elsewhere.
  useEffect(() => {
    const element = region.current;
    if (!element || !window.ResizeObserver) return;
    const observer = new window.ResizeObserver(() => {
      if (focusWasInside.current && !element.getClientRects().length &&
          (document.activeElement === document.body || element.contains(document.activeElement))) {
        selectRef.current?.focus({ preventScroll: true });
        focusWasInside.current = false;
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [selectRef]);
  if (!items.length) return null;
  return <section data-slot="example-prompts" aria-label="Example prompt suggestions">
    <Collapsible.Root open={expanded} onOpenChange={setExpanded} render={<nav ref={region}
      aria-label="Example prompts" data-slot="topic-bladder" data-expanded={expanded}
      onFocusCapture={() => { focusWasInside.current = true; }}
      onBlurCapture={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) focusWasInside.current = false; }}
      onKeyDown={(event) => { if (event.key === "Escape" && expanded) { setExpanded(false); trigger.current?.focus(); } }} />}>
      <ul id={listId} data-slot="topic-list" role="list" tabIndex={expanded ? 0 : undefined} aria-label="Example prompts">
        {items.map((item, index) => <li key={item.id} data-slot="topic-item" data-topic-id={item.id}
          data-tier={item.tier} data-origin-id={item.originTopicId} hidden={!expanded && index >= previewCount}>
          <button type="button" disabled={disabled}
            aria-label={item.tier === "contextual" ? `Follow-up on ${item.originLabel}: ${item.prompt}` : undefined}
            onClick={() => onChoose(item)}>{item.prompt}</button>
        </li>)}
      </ul>
      {items.length > previewCount && <Collapsible.Trigger ref={trigger} data-slot="examples-toggle" aria-controls={listId}>
        {expanded ? "Show fewer example prompts" : `Show ${items.length - previewCount} more example prompts`}
      </Collapsible.Trigger>}
      {expanded && items.length > previewCount && <small data-slot="example-scroll-hint">Scroll to browse all example prompts.</small>}
    </Collapsible.Root>
  </section>;
}
