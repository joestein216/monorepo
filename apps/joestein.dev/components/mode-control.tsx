import Link from "next/link";
import { portfolioModes, type PortfolioMode, type SitePresentation } from "@/lib/site-presentation";

export type ModeControlProps = {
  placement: "header" | "footer";
  mode?: PortfolioMode;
  onModeChange?: (mode: PortfolioMode) => void;
  labels: SitePresentation["modes"];
};

// Context is supplied by the caller. No URL/DOM inspection or independent fetch.
export function ModeControl({ placement, mode, onModeChange, labels }: ModeControlProps) {
  const options = portfolioModes.filter((item) => placement !== "footer" || item.id !== mode);
  return <nav aria-label={placement === "header" ? "Portfolio mode" : "Footer mode"} data-slot="mode-control" data-placement={placement}>
    {options.map((item) => onModeChange ? <button key={item.id} type="button" data-mode={item.id}
      aria-pressed={item.id === mode} onClick={() => onModeChange(item.id)}>
      {placement === "header" ? labels[item.id].label : labels[item.id].navigationLabel}
    </button> : <Link key={item.id} href={item.href} prefetch={false} data-mode={item.id} aria-current={item.id === mode ? "page" : undefined}>
      {placement === "header" ? labels[item.id].label : labels[item.id].navigationLabel}
    </Link>)}
  </nav>;
}
