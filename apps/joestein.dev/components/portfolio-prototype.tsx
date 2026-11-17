"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, generateId } from "ai";
import type { PortfolioContext } from "@/lib/sanity-context";
import type { PortfolioMessage } from "@/lib/portfolio-tools";
import type { StarterTopic } from "@/lib/portfolio-topics";
import { getTurnFollowUps } from "@/lib/portfolio-navigation";
import { Overview, TopicNavigation } from "./portfolio-content";
import { PortfolioResponse } from "./portfolio-response";

const transport = new DefaultChatTransport<PortfolioMessage>({ api: "/api/chat" });

export function PortfolioPrototype({ context, loadError }: { context: PortfolioContext; loadError?: boolean }) {
  const [mode, setMode] = useState<"prompt" | "overview">("prompt");
  const [input, setInput] = useState("");
  const [poppedTopicId, setPoppedTopicId] = useState<string | null>(null);
  const [poppedTurnId, setPoppedTurnId] = useState<string | null>(null);
  const { messages, sendMessage, status, error, stop, setMessages, clearError } = useChat<PortfolioMessage>({ transport });
  const busy = status === "submitted" || status === "streaming";
  const conversationState = messages.length === 0 ? "idle" : "active";
  const suggestions = getTurnFollowUps(messages, poppedTurnId);

  function send(text: string, topic?: StarterTopic) {
    const prompt = text.trim();
    if (busy || !prompt || prompt.length > 2000) return;
    const turnId = generateId();
    if (topic) {
      setPoppedTopicId(topic.id);
      setPoppedTurnId(turnId);
    }
    clearError();
    void sendMessage({ id: turnId, role: "user", parts: [{ type: "text", text: prompt }] });
    setInput("");
  }

  function resetConversation() {
    setMessages([]);
    clearError();
    setInput("");
    setPoppedTopicId(null);
    setPoppedTurnId(null);
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
            <p><textarea id="portfolio-prompt" name="prompt" data-slot="prompt-input" value={input} maxLength={2000} required
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
        <TopicNavigation topics={context.starterTopics ?? []} poppedTopicId={poppedTopicId} suggestions={suggestions} disabled={busy}
          onTopic={(topic) => send(topic.prompt, topic)} onFollowUp={(suggestion) => send(suggestion.prompt)} />
      </section>
      <p role="status" data-slot="conversation-status">{busy ? "Joe’s portfolio assistant is responding…" : "Ready for a question."}</p>
      {busy && <p><button type="button" onClick={() => void stop()}>Stop response</button></p>}
      {error && <p role="alert">{error.message} You can also switch to Overview Mode.</p>}
      <section aria-label="Responses" data-slot="conversation" aria-live="polite" aria-busy={busy}>
        <h2>Conversation</h2>
        {messages.length ? messages.map((message) => <article key={message.id} data-slot="conversation-message">
          <h3>{message.role === "user" ? "You" : "Portfolio assistant"}</h3>
          <PortfolioResponse message={message} />
        </article>) : <output>Ask a question or choose a topic.</output>}
      </section>
      {messages.length > 0 && <p><button type="button" disabled={busy} onClick={resetConversation}>Start a new conversation</button></p>}
    </section>}
  </main>;
}
