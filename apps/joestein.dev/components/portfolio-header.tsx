import Link from "next/link";

type Mode = "prompt" | "overview";

export function PortfolioHeader({ mode, onModeChange, colophon = false }: {
  mode?: Mode;
  onModeChange?: (mode: Mode) => void;
  colophon?: boolean;
}) {
  return <header data-slot="top-cover" data-surface="cover">
    <section data-slot="top-cover-inner" aria-label="Portfolio header">
      {colophon ? <p data-slot="brand-title">Joe Stein</p> : <h1 data-slot="brand-title">Joe Stein</h1>}
      <section data-slot="header-actions" aria-label="Portfolio navigation">
        <Link data-slot="colophon-link" href="/colophon" prefetch={false} aria-current={colophon ? "page" : undefined}>Making of joestein.dev</Link>
        <nav aria-label="Portfolio mode" data-slot="mode-switch">
          {onModeChange ? <>
            <button type="button" aria-pressed={mode === "prompt"} onClick={() => onModeChange("prompt")}>Prompt</button>
            <button type="button" aria-pressed={mode === "overview"} onClick={() => onModeChange("overview")}>Overview</button>
          </> : <>
            <Link href="/?mode=prompt" prefetch={false}>Prompt</Link>
            <Link href="/?mode=overview" prefetch={false}>Overview</Link>
          </>}
        </nav>
      </section>
    </section>
  </header>;
}
