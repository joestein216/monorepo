"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { PortfolioContext } from "@/lib/sanity-context";
import type { PortfolioMessage } from "@/lib/portfolio-tools";
import { Overview } from "./portfolio-content";
import { PortfolioResponse } from "./portfolio-response";

const transport = new DefaultChatTransport<PortfolioMessage>({ api: "/api/chat" });
const samples = ["Show Joe’s projects", "Show Joe’s experience with payments and POS", "Show resume downloads", "Show full overview"];

export function PortfolioPrototype({ context, loadError }: { context: PortfolioContext; loadError?: boolean }) {
  const [mode, setMode] = useState<"prompt" | "overview">("prompt");
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error, stop, setMessages, clearError } = useChat<PortfolioMessage>({ transport });
  const busy = status === "submitted" || status === "streaming";

  function send(text: string) {
    if (busy || !text.trim()) return;
    clearError();
    void sendMessage({ text: text.trim() });
    setInput("");
  }

  return <main>
    <header><h1>Joe Stein</h1><p>Engineering portfolio</p></header>
    <fieldset><legend>Portfolio mode</legend>
      <p><button type="button" aria-pressed={mode === "prompt"} onClick={() => setMode("prompt")}>Prompt Mode</button></p>
      <p><button type="button" aria-pressed={mode === "overview"} onClick={() => setMode("overview")}>Overview Mode</button></p>
    </fieldset>
    {loadError && <p role="alert">Portfolio data could not be loaded. Please refresh to try again.</p>}
    {mode === "overview" ? <Overview context={context} /> : <section aria-label="Portfolio assistant">
      <h2>Ask about Joe’s work</h2>
      <form onSubmit={(event) => { event.preventDefault(); send(input); }}>
        <fieldset disabled={busy}>
          <legend>Ask a question</legend>
          <p><label htmlFor="portfolio-prompt">Your prompt</label></p>
          <p><input id="portfolio-prompt" name="prompt" value={input} maxLength={2000} required onChange={(event) => setInput(event.target.value)} /></p>
          <p><button type="submit" disabled={!input.trim()}>Submit</button></p>
        </fieldset>
      </form>
      <fieldset disabled={busy}><legend>Sample prompts</legend>
        {samples.map((sample) => <p key={sample}><button type="button" onClick={() => send(sample)}>{sample}</button></p>)}
      </fieldset>
      <p role="status">{busy ? "Joe’s portfolio assistant is responding…" : "Ready for a question."}</p>
      {busy && <p><button type="button" onClick={() => void stop()}>Stop response</button></p>}
      {error && <p role="alert">{error.message} You can also switch to Overview Mode.</p>}
      <section aria-label="Responses" aria-live="polite" aria-busy={busy}>
        <h2>Conversation</h2>
        {messages.length ? messages.map((message) => <article key={message.id}>
          <h3>{message.role === "user" ? "You" : "Portfolio assistant"}</h3>
          <PortfolioResponse message={message} />
        </article>) : <output>Ask a question or choose a sample prompt.</output>}
      </section>
      {messages.length > 0 && <p><button type="button" disabled={busy} onClick={() => { setMessages([]); clearError(); }}>Start a new conversation</button></p>}
    </section>}
  </main>;
}
