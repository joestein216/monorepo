import type { SITE_SETTINGS_QUERY_RESULT } from "@/sanity.types";

// Supported behavior and routes are code-owned; editorial labels never select them.
export const portfolioModes = [
  { id: "prompt", href: "/?mode=prompt" },
  { id: "overview", href: "/?mode=overview" },
] as const;
export type PortfolioMode = (typeof portfolioModes)[number]["id"];

export const defaultSitePresentation = {
  brandName: "JOESTEIN.DEV",
  modes: {
    prompt: { label: "Prompt", navigationLabel: "prompt mode" },
    overview: { label: "Overview", navigationLabel: "overview mode" },
  },
  colophonLabel: "Making of joestein.dev",
  prompt: {
    invitation: "Ask anything about Joe’s engineering work.",
    placeholder: "Ask about a problem like yours, gauge depth in a tech stack, or paste a job/project brief…",
    submitLabel: "Pull the receipts", pendingLabel: "Pulling Receipts...",
  },
};

const copy = (value: string | null | undefined, fallback: string) => value?.trim() || fallback;
export function getSitePresentation(settings?: SITE_SETTINGS_QUERY_RESULT) {
  const defaults = defaultSitePresentation;
  return {
    brandName: copy(settings?.identity?.brandName, defaults.brandName),
    modes: {
      prompt: { label: copy(settings?.modes?.prompt?.label, defaults.modes.prompt.label), navigationLabel: copy(settings?.modes?.prompt?.navigationLabel, defaults.modes.prompt.navigationLabel) },
      overview: { label: copy(settings?.modes?.overview?.label, defaults.modes.overview.label), navigationLabel: copy(settings?.modes?.overview?.navigationLabel, defaults.modes.overview.navigationLabel) },
    },
    colophonLabel: copy(settings?.navigation?.colophonLabel, defaults.colophonLabel),
    prompt: {
      invitation: copy(settings?.promptExperience?.invitation, defaults.prompt.invitation),
      placeholder: copy(settings?.promptExperience?.placeholder, defaults.prompt.placeholder),
      submitLabel: copy(settings?.promptExperience?.submitLabel, defaults.prompt.submitLabel),
      pendingLabel: copy(settings?.promptExperience?.pendingLabel, defaults.prompt.pendingLabel),
    },
  };
}
export type SitePresentation = ReturnType<typeof getSitePresentation>;
