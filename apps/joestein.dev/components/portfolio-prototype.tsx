"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, generateId } from "ai";
import type { PortfolioContext } from "@/lib/sanity-context";
import type { PortfolioMessage } from "@/lib/portfolio-tools";
import { getPromptSuggestions, type PromptSuggestion } from "@/lib/portfolio-navigation";
import { PROMPT_CHAR_LIMIT, promptInputSchema, promptLimitState } from "@/lib/prompt-input";
import { followConversation } from "@/lib/conversation-follow";
import { Overview, TopicNavigation } from "./portfolio-content";
import { PortfolioResponse, ResponseProgress } from "./portfolio-response";

const transport = new DefaultChatTransport<PortfolioMessage>({ api: "/api/chat" });
const mobileQuery = "(max-width: 1023px)";
function subscribeViewport(callback: () => void) {
  const media = window.matchMedia?.(mobileQuery);
  media?.addEventListener("change", callback);
  return () => media?.removeEventListener("change", callback);
}
function mobileSnapshot() { return window.matchMedia?.(mobileQuery).matches ?? false; }
const serverSnapshot = () => false;

export function PortfolioPrototype({ context, loadError }: { context: PortfolioContext; loadError?: boolean }) {
  const shellRef = useRef<HTMLElement>(null);
  const releasedAttempt = useRef<string | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const restorePromptFocus = useRef(false);
  const [mode, setMode] = useState<"prompt" | "overview">("prompt");
  const [input, setInput] = useState("");
  const [suggestionTyping, setSuggestionTyping] = useState(false);
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [starterTurns, setStarterTurns] = useState<Record<string, string>>({});
  const [retryAttempt, setRetryAttempt] = useState(0);
  const { messages, sendMessage, status, error, setMessages, clearError, regenerate } = useChat<PortfolioMessage>({ transport });
  const mobile = useSyncExternalStore(subscribeViewport, mobileSnapshot, serverSnapshot);
  const busy = status === "submitted" || status === "streaming";
  const pending = status === "submitted";
  const conversationState = messages.length === 0 ? "idle" : "active";
  const limitState = promptLimitState(input.length);
  const suggestions = getPromptSuggestions(context.starterTopics ?? [], messages, starterTurns);
  const questionId = messages.findLast((message) => message.role === "user")?.id;

  useEffect(() => {
    if (!questionId || mode !== "prompt") return;
    const attempt = `${questionId}:${retryAttempt}`;
    if (releasedAttempt.current === attempt) return;
    const shell = shellRef.current;
    const questions = shell?.querySelectorAll<HTMLElement>('[data-slot="user-query"]');
    const question = questions?.[questions.length - 1];
    const content = shell?.querySelector<HTMLElement>('[data-slot="turn-list"]');
    const header = shell?.querySelector<HTMLElement>('[data-slot="top-cover"]');
    const dock = shell?.querySelector<HTMLElement>('[data-slot="prompt-dock"]');
    if (question && content && header && dock) {
      return followConversation({ question, content, header, dock,
        onRelease: () => { releasedAttempt.current = attempt; },
      });
    }
  }, [questionId, retryAttempt, mode]);

  // Reveal the submitted suggestion without delaying its request. Editing the
  // composer cancels playback; a new draft is never cleared by that request.
  useEffect(() => {
    if (!suggestionTyping) return;
    let started: number | undefined;
    let frame: number;
    function reveal(now: number) {
      started ??= now;
      const progress = Math.min(1, (now - started) / 550);
      setVisibleCharacters(Math.ceil(input.length * progress));
      if (progress < 1) frame = requestAnimationFrame(reveal);
      else setSuggestionTyping(false);
    }
    frame = requestAnimationFrame(reveal);
    return () => cancelAnimationFrame(frame);
  }, [suggestionTyping, input]);

  useEffect(() => {
    if (restorePromptFocus.current) {
      if (document.activeElement === document.body || document.activeElement === promptRef.current) promptRef.current?.focus();
      restorePromptFocus.current = false;
    }
  }, [busy, mobile]);

  function send(text: string, topic?: PromptSuggestion) {
    if (busy || !promptInputSchema.safeParse(text).success) return;
    restorePromptFocus.current = Boolean(document.activeElement?.closest('[data-slot="composer-card"]'));
    const turnId = generateId();
    if (topic?.tier === "starter") setStarterTurns((turns) => ({ ...turns, [topic.id]: turnId }));
    clearError();
    setInput(text);
    setVisibleCharacters(0);
    setSuggestionTyping(Boolean(topic) && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    void sendMessage({ id: turnId, role: "user", parts: [{ type: "text", text: text.trim() }] }).finally(() => {
      setSuggestionTyping(false);
      setInput((current) => current === text ? "" : current);
    });
  }
  function retry() { restorePromptFocus.current = true; setRetryAttempt((attempt) => attempt + 1); clearError(); void regenerate(); }
  function resetConversation() {
    setMessages([]); clearError(); setInput(""); setSuggestionTyping(false); setStarterTurns({}); promptRef.current?.focus();
  }

  const composer = <section key="composer" data-slot="prompt-composer" aria-label="Ask Joe’s portfolio">
    {conversationState === "idle" && <h2 data-slot="hero-headline">Ask anything about Joe’s engineering work.</h2>}
    <form data-slot="composer-card" data-limit-state={limitState} noValidate
      onSubmit={(event) => { event.preventDefault(); send(input); }}>
      <header data-slot="composer-meta">
        <label htmlFor="portfolio-prompt">Your question or brief</label>
        <span id="prompt-counter" data-slot="composer-counter" data-limit-state={limitState}>
          {input.length.toLocaleString("en-US")} / {PROMPT_CHAR_LIMIT.toLocaleString("en-US")}
          {limitState === "approaching" && " · Near limit"}{limitState === "exceeded" && " · ! over limit"}
        </span>
      </header>
      <textarea ref={promptRef} id="portfolio-prompt" name="prompt" data-slot="prompt-textarea" value={suggestionTyping ? input.slice(0, visibleCharacters) : input} rows={3}
        aria-invalid={limitState === "exceeded" ? true : undefined}
        placeholder="Ask about a problem like yours, gauge depth in a tech stack, or paste a job/project brief…"
        aria-describedby="prompt-counter prompt-limit-status prompt-keyboard-help"
        onChange={(event) => { setSuggestionTyping(false); setInput(event.target.value); }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(input); }
        }} />
      <p id="prompt-limit-status" data-slot="visually-hidden" role="status" aria-live="polite">
        {limitState === "exceeded" ? "Your prompt is over the 12,000-character limit. Shorten it before sending; your full text has been preserved." : ""}
      </p>
      <footer data-slot="composer-actions">
        <small id="prompt-keyboard-help" data-slot="composer-hint">Enter to send · Shift+Enter for newline</small>
        <button type="submit" data-slot="submit-button" disabled={busy || !input.trim() || limitState === "exceeded"}
          aria-busy={busy} data-pending={busy} aria-label={busy ? "Pulling receipts…" : undefined}>
          <span data-slot="submit-label" aria-hidden={busy}>Pull the receipts</span>
          {busy && <span data-slot="ticker-track" aria-hidden="true"><span>Pulling receipts... · </span><span>Pulling receipts... · </span></span>}
        </button>
      </footer>
    </form>
  </section>;
  const navigation = <TopicNavigation key="topics" items={suggestions} disabled={busy} active={conversationState === "active"}
    onSelect={(item) => send(item.prompt, item)} />;

  return <main ref={shellRef} data-slot="portfolio-shell" data-conversation-state={conversationState} data-request-state={pending ? "pending" : status}>
    <header data-slot="top-cover" data-surface="cover">
      <section data-slot="top-cover-inner" aria-label="Portfolio header">
        <h1 data-slot="brand-title">Joe Stein</h1>
        <nav aria-label="Portfolio mode" data-slot="mode-switch">
          <button type="button" aria-pressed={mode === "prompt"} onClick={() => setMode("prompt")}>Prompt</button>
          <button type="button" aria-pressed={mode === "overview"} onClick={() => setMode("overview")}>Overview</button>
        </nav>
      </section>
    </header>
    {loadError && <p data-slot="error-banner" role="alert">Portfolio data could not be loaded. Please refresh to try again.</p>}
    {mode === "overview" ? <section data-slot="overview-canvas" aria-label="Portfolio overview"><Overview context={context} /></section> : <section aria-label="Portfolio assistant" data-slot="prompt-mode">
      <section aria-label="Responses" data-slot="conversation-canvas">
        <h2 data-slot="visually-hidden">Conversation</h2>
        <section data-slot="turn-list" aria-label="Conversation turns">
          {messages.map((message) => <article key={message.id} data-slot={message.role === "user" ? "user-turn" : "assistant-turn"}
            aria-busy={message.role === "assistant" ? busy && message.id === messages.at(-1)?.id : undefined}>
            <PortfolioResponse message={message} streaming={busy && message.id === messages.at(-1)?.id} />
          </article>)}
          {busy && messages.at(-1)?.role !== "assistant" && <ResponseProgress />}
        </section>
        {error && <section data-slot="error-banner" role="alert"><p>That response didn’t quite come together. Try again or ask another question.</p>
          <button type="button" disabled={busy} onClick={retry}>Try that question again</button></section>}
        {messages.length > 0 && <footer data-slot="conversation-actions"><button type="button" disabled={busy} onClick={resetConversation}>Start a new conversation</button></footer>}
      </section>
      <section aria-label="Prompt composer and topics" data-slot="prompt-dock" data-surface={conversationState === "active" ? "cover" : "paper"} data-conversation-state={conversationState}>
        <section data-slot="prompt-dock-inner" aria-label="Conversation controls">
          {/* Stable keys preserve the textarea node while DOM order follows the mobile reading order. */}
          {mobile && conversationState === "active" ? [navigation, composer] : [composer, navigation]}
        </section>
        <footer data-slot="dock-status">
          <p role="status" aria-live="polite" data-slot="conversation-status">{busy ? "Joe’s portfolio assistant is responding…" : (messages.length ? "Ready for another question." : "Ready for a question.")}</p>
        </footer>
      </section>
    </section>}
  </main>;
}
