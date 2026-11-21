"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, generateId } from "ai";
import type { PortfolioContext } from "@/lib/sanity-context";
import type { PortfolioMessage } from "@/lib/portfolio-tools";
import { getPromptSuggestions, type PromptSuggestion } from "@/lib/portfolio-navigation";
import { promptInputSchema } from "@/lib/prompt-input";
import { followConversation } from "@/lib/conversation-follow";
import { rateLimitMessage, recoveryMessage } from "@/lib/chat-stream";
import { Overview } from "./portfolio-content";
import { PortfolioResponse, ResponseProgress } from "./portfolio-response";
import { PortfolioHeader } from "./portfolio-header";
import { PortfolioFooter } from "./portfolio-footer";
import { PromptComposer } from "./prompt-composer";
import { ExamplePrompts } from "./example-prompts";
import { observePromptViewport } from "@/lib/prompt-viewport";
import { getSitePresentation, type PortfolioMode } from "@/lib/site-presentation";

const transport = new DefaultChatTransport<PortfolioMessage>({ api: "/api/chat" });
export function PortfolioPrototype({ context, loadError, initialMode = "prompt" }: { context: PortfolioContext; loadError?: boolean; initialMode?: PortfolioMode }) {
  const shellRef = useRef<HTMLElement>(null);
  const releasedAttempt = useRef<string | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  const focusQuestionId = useRef<string | null>(null);
  const [mode, setMode] = useState<PortfolioMode>(initialMode);
  const [input, setInput] = useState("");
  const [suggestionTyping, setSuggestionTyping] = useState(false);
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [starterTurns, setStarterTurns] = useState<Record<string, string>>({});
  const [retryAttempt, setRetryAttempt] = useState(0);
  const { messages, sendMessage, status, error, setMessages, clearError, regenerate } = useChat<PortfolioMessage>({ transport });
  const busy = status === "submitted" || status === "streaming";
  const pending = status === "submitted";
  const conversationState = messages.length === 0 ? "idle" : "active";
  const presentation = getSitePresentation(context.siteSettings);
  const suggestions = getPromptSuggestions(context.starterTopics ?? [], messages, starterTurns);
  const questionId = messages.findLast((message) => message.role === "user")?.id;

  useEffect(() => {
    if (mode === "prompt" && shellRef.current) return observePromptViewport(shellRef.current);
  }, [mode]);

  // A submission starts a reading task. Focus it once without competing with
  // bounded page scrolling; streaming/completion must never reopen the keyboard.
  useEffect(() => {
    if (mode !== "prompt" || !questionId || focusQuestionId.current !== questionId) return;
    const questions = shellRef.current?.querySelectorAll<HTMLElement>('[data-slot="user-query"]');
    const question = questions?.[questions.length - 1];
    if (question) {
      focusQuestionId.current = null;
      question.focus({ preventScroll: true });
    }
  }, [questionId, retryAttempt, mode]);

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

  const submitRevealedSuggestion = useEffectEvent(() => send(input));
  // Both suggestion controls reveal then submit through the same path. Editing,
  // switching modes, or unmounting cancels the pending reveal/submission.
  useEffect(() => {
    if (!suggestionTyping) return;
    let started: number | undefined;
    let frame: number;
    function reveal(now: number) {
      started ??= now;
      const progress = Math.min(1, (now - started) / 550);
      setVisibleCharacters(Math.ceil(input.length * progress));
      if (progress < 1) frame = requestAnimationFrame(reveal);
      else { setSuggestionTyping(false); submitRevealedSuggestion(); }
    }
    frame = requestAnimationFrame(reveal);
    return () => cancelAnimationFrame(frame);
  }, [suggestionTyping, input, selectedSuggestionId]);

  function choose(item: PromptSuggestion) {
    if (busy) return;
    setSelectedSuggestionId(item.id);
    setInput(item.prompt);
    setVisibleCharacters(0);
    const animate = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setSuggestionTyping(animate);
    if (!animate) send(item.prompt, item);
  }

  function send(text: string, selectedTopic?: PromptSuggestion) {
    if (busy || !promptInputSchema.safeParse(text).success) return;
    const topic = selectedTopic ?? suggestions.find((item) => item.id === selectedSuggestionId && item.prompt === text);
    const turnId = generateId();
    focusQuestionId.current = turnId;
    if (topic?.tier === "starter") setStarterTurns((turns) => ({ ...turns, [topic.id]: turnId }));
    clearError();
    setInput(text);
    setSelectedSuggestionId(null);
    setSuggestionTyping(false);
    void sendMessage({ id: turnId, role: "user", parts: [{ type: "text", text: text.trim() }] }).finally(() => {
      setSuggestionTyping(false);
      setInput((current) => current === text ? "" : current);
    });
  }
  function retry() {
    focusQuestionId.current = questionId ?? null;
    setRetryAttempt((attempt) => attempt + 1); clearError();
    const text = messages.findLast((message) => message.role === "user")?.parts.filter((part) => part.type === "text").map((part) => part.text).join("\n") ?? "";
    setInput(text);
    void regenerate().finally(() => setInput((current) => current === text ? "" : current));
  }
  function changeMode(next: PortfolioMode) { focusQuestionId.current = null; setSuggestionTyping(false); setSelectedSuggestionId(null); setMode(next); }
  function resetConversation() {
    focusQuestionId.current = null;
    setMessages([]); clearError(); setInput(""); setSuggestionTyping(false); setSelectedSuggestionId(null); setStarterTurns({}); promptRef.current?.focus();
  }

  return <main ref={shellRef} data-slot="portfolio-shell" data-conversation-state={conversationState} data-request-state={pending ? "pending" : status}>
    <PortfolioHeader presentation={presentation} mode={mode} onModeChange={changeMode} />
    {loadError && <p data-slot="error-banner" role="alert">Portfolio data could not be loaded. Please refresh to try again.</p>}
    {mode === "overview" ? <><section data-slot="overview-canvas" aria-label="Portfolio overview"><Overview context={context} /></section><PortfolioFooter presentation={presentation} mode={mode} onModeChange={changeMode} /></> : <section aria-label="Portfolio assistant" data-slot="prompt-mode">
      <section aria-label="Responses" data-slot="conversation-canvas">
        <h2 data-slot="visually-hidden">Conversation</h2>
        <section data-slot="turn-list" aria-label="Conversation turns">
          {messages.map((message) => <article key={message.id} data-slot={message.role === "user" ? "user-turn" : "assistant-turn"}
            aria-busy={message.role === "assistant" ? busy && message.id === messages.at(-1)?.id : undefined}>
            <PortfolioResponse message={message} streaming={busy && message.id === messages.at(-1)?.id} />
          </article>)}
          {busy && messages.at(-1)?.role !== "assistant" && <ResponseProgress />}
        </section>
        {error && <section data-slot="error-banner" role="alert"><p>{error.message === rateLimitMessage ? rateLimitMessage : recoveryMessage}</p>
          <button type="button" disabled={busy} onClick={retry}>Try that question again</button></section>}
        {messages.length > 0 && <footer data-slot="conversation-actions"><button type="button" disabled={busy} onClick={resetConversation}>Start a new conversation</button></footer>}
      </section>
      <section aria-label="Prompt composer and example prompts" data-slot="prompt-dock" data-surface="paper" data-conversation-state={conversationState}>
        <section data-slot="prompt-dock-inner" aria-label="Conversation controls">
          <PromptComposer copy={presentation.prompt} input={input} visibleInput={suggestionTyping ? input.slice(0, visibleCharacters) : input}
            busy={busy} idle={conversationState === "idle"}
            suggestions={suggestions} promptRef={promptRef} selectRef={selectRef}
            onChange={(value) => { setSuggestionTyping(false); setSelectedSuggestionId(null); setInput(value); }}
            onChoose={choose} onSubmit={() => send(input)} />
          <ExamplePrompts items={suggestions} disabled={busy} selectRef={selectRef} onChoose={choose} />
        </section>
        <PortfolioFooter presentation={presentation} mode={mode} onModeChange={changeMode} />
      </section>
    </section>}
  </main>;
}
