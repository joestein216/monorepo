import Link from "next/link";

export function PortfolioFooter({ mode, onModeChange, colophon = false }: {
  mode?: "prompt" | "overview";
  onModeChange?: (mode: "prompt" | "overview") => void;
  colophon?: boolean;
}) {
  const nextMode = mode === "prompt" ? "overview" : "prompt";
  return <footer data-slot="portfolio-footer">
    <small>JOESTEIN.DEV</small>
    <nav aria-label="Footer navigation">
      <Link href="/colophon" prefetch={false} aria-current={colophon ? "page" : undefined}>making of joestein.dev</Link>
      {onModeChange ? <button type="button" onClick={() => onModeChange(nextMode)}>{nextMode} mode</button>
        : <Link href={`/?mode=${nextMode}`} prefetch={false}>Switch to {nextMode}</Link>}
    </nav>
  </footer>;
}
