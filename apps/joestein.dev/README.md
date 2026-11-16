# joestein.dev — Phase 1

Semantic HTML prototype with Prompt Mode and Overview Mode. A disposable `app/wireframe.css` supplies only receipt-list spacing and dashed card boundaries through semantic/ARIA selectors. It is imported by the existing `app/(site)/layout.tsx`; Studio keeps its independent root layout. There are no utility classes, inline styles, custom fonts, fixed dimensions, or explicit colors.

Run from the monorepo root:

```sh
pnpm --filter joestein.dev dev
pnpm --filter joestein.dev typegen
pnpm --filter joestein.dev build
pnpm --filter joestein.dev lint
pnpm --filter joestein.dev typecheck
```

Website: http://localhost:3006. Studio: http://localhost:3006/studio.

Copy `.env.example` to `.env.local` for another checkout. Supply a Sanity Viewer token and `GOOGLE_GENERATIVE_AI_API_KEY` from Google AI Studio. Keys stay server-side and must not be committed. Sanity project: `lt4yrzne`; dataset: `production`.

## Data and editing

Studio registers `technology`, `project`, `role`, and the `about` singleton (document ID `about`). About is removed from generic creation templates; singleton duplication, deletion, and unpublishing are disabled. Add the three live projects through Studio when ready. No projects were fabricated.

The published content was imported through the Sanity MCP integration from four Dropbox files in `/Resumes`, inspected through the Dropbox MCP integration:

- `Joseph_Stein_Full_Stack_Software_Engineer_Base.md`
- `Joseph_Stein_Full_Stack_Software_Engineer_CMS.md`
- `Joseph_Stein_Full_Stack_Engineer_Integrations.md`
- `Joseph_Stein_Product_Engineer.md`

Four roles merge overlapping resume bullets into 16 distinct achievements. Default Overview includes 4/4/3/4 achievements, newest role first; the additional Booker delivery achievement is available through experience deep dives. Technology references on roles and achievements use evidence from the relevant role paragraphs, without assigning globally listed skills to employers by guesswork. The catalog contains 48 canonical technologies/protocols/tools. Base UI and Google Gemini were requested by Joe and were not mentioned in these resumes; they are catalog entries without historical role claims. Markdown originals are stored as four Sanity file assets and linked in About downloads.

Career history, summary, education, and contacts derive from those resumes. Next-role preferences and advisory details are explicitly labelled `Placeholder`, inferred with Joe's permission, and should be refined in Studio.

## Data and chat flow

`sanity/lib/queries.ts` defines the uniquely named TypeGen query. `lib/sanity-context.ts` loads only published documents, dereferences technology relationships and download assets, disables stega, deduplicates per render with React cache, and caches fetches for 60 seconds. Drafts never enter the public page or AI context. Published edits become visible after cache revalidation and a fresh page request; this Phase 1 loader does not provide an instantaneous draft preview.

`app/api/chat/route.ts` validates conversation input and streams `google(process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite')` through AI SDK 7. The `system` prompt includes the serialized Sanity context and requests a concise third-person summary before one `showReceipts` call with ALL genuinely relevant evidence, without padding or a fixed item cap. `showReceipts` accepts exact achievement `_key` or project `_id` values plus a required 1–100 `relevanceScore`, concise `matchReason`, and a question-specific 2–4 sentence `tailoredNarrative` combining outcome and engineering implementation; all role metadata, technology tags, links, and engineering details are resolved from server-side Sanity data. Unknown IDs and ambiguous achievement keys are discarded. Duplicate IDs retain the highest-scoring entry. The full hydrated result is sorted descending by relevanceScore, without an item cap. The model output budget is 2,000 tokens; very large sets of vignettes may still exceed that budget. `showDownloads` and `showOverview` remain available for explicit download/full-site requests. Client-supplied tool results are excluded from model history. The assistant must acknowledge missing information and placeholders.

The frontend is `app/(site)/page.tsx`, following the app's existing route groups and separate Studio root layout; there is intentionally no shared `app/layout.tsx`. `components/portfolio-prototype.tsx` owns mode/chat state. Shared semantic renderers display overview data and tool results. `components/portfolio-response.tsx` places all streamed summary text in a leading `<output>` regardless of tool-part order, followed by a `Receipts` section. Receipt articles contain the complete narrative first, then a technology list, then a footer with source metadata and the temporary score/match-reason stamp. There are no collapsed receipt details. Receipts appear in `<ul aria-label="Receipts">` with the top three visible initially; a “Show all {count} receipts” button exposes every returned match, and “Show top 3 receipts” restores the preview. Articles and sections sit alongside `<output>` to preserve valid HTML content models. Empty, loading, stop, reset, and failure states are handled.

TypeGen generates `sanity/extract.json` and `sanity.types.ts`; commit both and never edit them manually. The extraction script uses `--force` so it can regenerate an existing output file. Cache Components remain disabled for Studio's `force-static` route. SanityLive and authenticated Visual Editing remain in the site layout for the existing Studio integration.

## Verification

TypeGen, production build, ESLint, and TypeScript checks were run from the root with the app filter. A runtime check against published Sanity data verified role order, all four tool selectors, default-versus-deep-dive achievement counts, empty project results, and all four downloadable resume assets (HTTP 200 with expected content). Rendering the overview to HTML confirmed the contact links and absence of style/class/dimension attributes. The home page returned HTTP 200 without a stylesheet link, and invalid chat input returned HTTP 400.

Google rejected the originally requested Gemini 2.5 Flash model for this API account. Joe approved `gemini-3.8-flash`; the model listing confirmed it supports generation, and Google's model documentation confirms function calling. Live generation checks encountered temporary high-demand responses/timeouts, so successful model-selected tool streaming could not be confirmed during this session. The route applies low reasoning effort, a 50-second timeout, and a recoverable error directing visitors to Overview Mode. Browser interaction verification was unavailable because the computer-use browser host could not connect.

Receipt lookup regression checks (no Sanity writes or model calls):

```sh
pnpm --filter joestein.dev exec node --experimental-strip-types --test tests/portfolio-tools.test.mjs
```

The ranked receipts iteration is covered by seven tool regression tests (including uncapped results, score bounds, sorting, duplicate selection, and authoritative metadata), plus an isolated DOM interaction check for the three-item preview and Show all/Show top 3 controls. Sanity schemas and stored content were not changed.
