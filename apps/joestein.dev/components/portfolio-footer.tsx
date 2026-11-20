import Link from "next/link";
import { ModeControl } from "./mode-control";
import { defaultSitePresentation, type PortfolioMode, type SitePresentation } from "@/lib/site-presentation";

export function PortfolioFooter({ mode, onModeChange, colophon = false, presentation = defaultSitePresentation }: {
  mode?: PortfolioMode;
  onModeChange?: (mode: PortfolioMode) => void;
  colophon?: boolean;
  presentation?: SitePresentation;
}) {
  return <footer data-slot="portfolio-footer">
    <small>{presentation.brandName}</small>
    <section data-slot="footer-links" aria-label="Footer navigation">
      <Link data-slot="colophon-link" href="/colophon" prefetch={false} aria-current={colophon ? "page" : undefined}>{presentation.colophonLabel}</Link>
      <ModeControl placement="footer" mode={mode} onModeChange={onModeChange} labels={presentation.modes} />
    </section>
  </footer>;
}
