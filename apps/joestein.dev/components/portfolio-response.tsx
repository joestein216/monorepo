"use client";

import type { PortfolioMessage, PortfolioReceipt } from "@/lib/portfolio-tools";
import { DownloadsSection, Overview, ReceiptCard } from "./portfolio-content";

export function PortfolioResponse({ message, streaming = false }: { message: PortfolioMessage; streaming?: boolean }) {
  const textParts = message.parts.filter((part) => part.type === "text");
  const proseStreaming = streaming && textParts.some((part) => part.state === "streaming");
  const summary = [...new Set(message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text.trim())
    .filter(Boolean))]
    .join("\n\n");
  const receiptCalls = message.parts.filter((part) => part.type === "tool-showReceipts");
  const receiptsById = new Map<string, PortfolioReceipt>();

  // Keep text above the cards regardless of the order of streamed tool parts.
  // Enforce the shared three-receipt budget even across repeated tool calls.
  for (const part of receiptCalls) {
    if (part.state !== "output-available") continue;
    for (const receipt of part.output) {
      const identity = `${receipt.type}:${receipt.id}`;
      const existing = receiptsById.get(identity);
      if (!existing || receipt.relevanceScore > existing.relevanceScore) {
        receiptsById.set(identity, receipt);
      }
    }
  }
  const receipts = [...receiptsById.values()].sort((a, b) => b.relevanceScore - a.relevanceScore);
  const visibleReceipts = receipts.slice(0, 3);

  const pending = receiptCalls.some((part) => part.state === "input-streaming" || part.state === "input-available");
  const failed = receiptCalls.some((part) => part.state === "output-error" || part.state === "output-denied");

  return <>
    {message.role === "user" ? <h2 data-slot="user-query">{summary}</h2> : <p data-slot="summary-block" aria-label="Summary">{summary}{proseStreaming && <span data-slot="stream-cursor" aria-hidden="true" />}</p>}
    {receiptCalls.length > 0 && <section aria-label="Receipts">
      <h3 data-slot="visually-hidden">Supporting receipts</h3>
      {pending && streaming && !proseStreaming && <p data-slot="receipts-status" role="status">Pulling matching receipts…</p>}
      <ul aria-label="Receipts" data-slot="receipt-list" role="list">
        {visibleReceipts.map((receipt) => <li key={`${receipt.type}:${receipt.id}`}>
          <ReceiptCard receipt={receipt} />
        </li>)}
      </ul>
      {pending && !streaming && <p>The supporting work was not completed. Try again or ask another question.</p>}
      {failed && <p>The supporting work could not be loaded. Please try again.</p>}
      {!pending && !failed && receipts.length === 0 && <p>No matching supporting work was found.</p>}
    </section>}
    {message.parts.map((part) => {
      if (part.type !== "tool-showDownloads" && part.type !== "tool-showOverview") return null;
      if (part.state === "output-error" || part.state === "output-denied") {
        return <p key={part.toolCallId}>The requested portfolio section could not be loaded.</p>;
      }
      if (part.state !== "output-available") return <p key={part.toolCallId}>{streaming ? "Loading portfolio section…" : "The requested section was not completed. Try again or ask another question."}</p>;
      return part.type === "tool-showDownloads"
        ? <DownloadsSection key={part.toolCallId} downloads={part.output} />
        : <Overview key={part.toolCallId} context={part.output} />;
    })}
  </>;
}
