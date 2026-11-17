"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, generateId } from "ai";
import type { PortfolioContext } from "@/lib/sanity-context";
import type { PortfolioMessage } from "@/lib/portfolio-tools";
import { getPromptSuggestions, type PromptSuggestion } from "@/lib/portfolio-navigation";
import { Overview, TopicNavigation } from "./portfolio-content";
import { PortfolioResponse } from "./portfolio-response";

const transport = new DefaultChatTransport<PortfolioMessage>({ api: "/api/chat" });

export function PortfolioPrototype({ context, loadError }: { context: PortfolioContext; loadError?: boolean }) {
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const restorePromptFocus = useRef(false);
  const [mode, setMode] = useState<"prompt" | "overview">("prompt");
  const [notice, setNotice] = useState("");
  const [input, setInput] = useState("");
  const [starterTurns, setStarterTurns] = useState<Record<string, string>>({});
  const { messages, sendMessage, status, error, stop, setMessages, clearError, regenerate } = useChat<PortfolioMessage>({ transport });
  const busy = status === "submitted" || status === "streaming";
  const conversationState = messages.length === 0 ? "idle" : "active";
  const suggestions = getPromptSuggestions(context.starterTopics ?? [], messages, starterTurns);

  useEffect(() => {
    if (!busy && restorePromptFocus.current) {
      promptRef.current?.focus();
      restorePromptFocus.current = false;
    }
  }, [busy, notice]);

  function send(text: string, topic?: PromptSuggestion) {
    const prompt = text.trim();
    if (busy || !prompt || prompt.length > 2000) return;
    const turnId = generateId();
    if (topic?.tier === "starter") {
      setStarterTurns((turns) => ({ ...turns, [topic.id]: turnId }));
    }
    clearError();
    setNotice("");
    void sendMessage({ id: turnId, role: "user", parts: [{ type: "text", text: prompt }] });
    setInput("");
  }

  function resetConversation() {
    setMessages([]);
    clearError();
    setNotice("");
    setInput("");
    setStarterTurns({});
    promptRef.current?.focus();
  }

  return <main data-slot="portfolio-shell" data-conversation-state={conversationState}>
    <header data-slot="portfolio-header"><h1>Joe Stein</h1><p>Engineering portfolio</p></header>
    <fieldset data-slot="mode-switch"><legend>Portfolio mode</legend>
      <p><button type="button" aria-pressed={mode === "prompt"} onClick={() => setMode("prompt")}>Prompt Mode</button></p>
      <p><button type="button" aria-pressed={mode === "overview"} onClick={() => setMode("overview")}>Overview Mode</button></p>
    </fieldset>
    {loadError && <p role="alert">Portfolio data could not be loaded. Please refresh to try again.</p>}
    {mode === "overview" ? <Overview context={context} /> : <section aria-label="Portfolio assistant" data-slot="prompt-mode">
      <h2>Ask about Joe’s work</h2>
      <section aria-label="Ask Joe’s portfolio" data-slot="prompt-dock" data-conversation-state={conversationState}>
        <form onSubmit={(event) => { event.preventDefault(); send(input); }}>
          <fieldset disabled={busy}>
            <legend>Ask a question</legend>
            <p><label htmlFor="portfolio-prompt">Your prompt</label></p>
            <p><textarea ref={promptRef} id="portfolio-prompt" name="prompt" data-slot="prompt-input" value={input} rows={6} cols={40} required
              placeholder="What would you like to explore about Joe’s work? Ask a question or choose a topic below."
              aria-describedby="prompt-keyboard-help"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  send(input);
                }
              }} /></p>
            <p id="prompt-keyboard-help"><small>Enter to send. Shift+Enter for a new line.</small></p>
            <p><button type="submit" disabled={!input.trim()}>Submit</button></p>
          </fieldset>
        </form>
        <TopicNavigation items={suggestions} disabled={busy} onSelect={(item) => send(item.prompt, item)} />
      </section>
      <p role="status" data-slot="conversation-status">{busy ? "Joe’s portfolio assistant is responding…" : notice || (messages.length ? "Ready for another question." : "Ready for a question.")}</p>
      {busy && <p><button type="button" onClick={() => { restorePromptFocus.current = true; void stop(); setNotice("Response stopped. Try again or ask another question."); }}>Stop response</button></p>}
      {error && <p role="alert">That response didn’t quite come together. Try again or ask another question.</p>}
      {!busy && (error || notice) && messages.length > 0 && <p><button type="button" onClick={() => { restorePromptFocus.current = true; clearError(); setNotice(""); void regenerate(); }}>Try that question again</button></p>}
      <section aria-label="Responses" data-slot="conversation" aria-busy={busy}>
        <h2>Conversation</h2>
        {messages.length ? messages.map((message) => <article key={message.id} data-slot="conversation-message">
          <h3>{message.role === "user" ? "You" : "Portfolio assistant"}</h3>
          <PortfolioResponse message={message} streaming={busy && message.id === messages.at(-1)?.id} />
        </article>) : <p>Ask a question or choose a topic.</p>}
      </section>
      {messages.length > 0 && <p><button type="button" disabled={busy} onClick={resetConversation}>Start a new conversation</button></p>}
    </section>}
  </main>;
}
