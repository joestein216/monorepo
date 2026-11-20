import Link from "next/link";
import { ModeControl } from "./mode-control";
import { defaultSitePresentation, type PortfolioMode, type SitePresentation } from "@/lib/site-presentation";

export function PortfolioHeader({ mode, onModeChange, colophon = false, presentation = defaultSitePresentation }: {
  mode?: PortfolioMode;
  onModeChange?: (mode: PortfolioMode) => void;
  colophon?: boolean;
  presentation?: SitePresentation;
}) {
  return <header data-slot="top-cover" data-surface="cover">
    <section data-slot="top-cover-inner" aria-label="Portfolio header">
      {colophon ? <p data-slot="brand-title">{presentation.brandName}</p> : <h1 data-slot="brand-title">{presentation.brandName}</h1>}
      <section data-slot="header-actions" aria-label="Portfolio navigation">
        <Link data-slot="colophon-link" href="/colophon" prefetch={false} aria-current={colophon ? "page" : undefined}>{presentation.colophonLabel}</Link>
        <ModeControl placement="header" mode={mode} onModeChange={onModeChange} labels={presentation.modes} />
      </section>
    </section>
  </header>;
}
