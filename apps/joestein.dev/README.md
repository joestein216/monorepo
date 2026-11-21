# joestein.dev — Phase 1

Phase 1.5 semantic HTML prototype with Prompt Mode and Overview Mode. The prompt-first shell exposes idle/active states and structural `data-slot` hooks without CSS. The temporary receipt wireframe stylesheet has been removed. Studio keeps its independent root layout. There are no frontend CSS imports, utility classes, inline styles, custom fonts, fixed dimensions, or explicit colors.

Run from the monorepo root:

```sh
pnpm --filter joestein.dev dev
pnpm --filter joestein.dev typegen
pnpm --filter joestein.dev build
pnpm --filter joestein.dev lint
pnpm --filter joestein.dev typecheck
pnpm --filter joestein.dev test
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
pnpm --filter joestein.dev test
```

The ranked receipts iteration is covered by seven tool regression tests (including uncapped results, score bounds, sorting, duplicate selection, and authoritative metadata), plus an isolated DOM interaction check for the three-item preview and Show all/Show top 3 controls. Sanity schemas and stored content were not changed.


## Phase 1.5 topic navigation

`PortfolioContext` extends the generated Sanity query result with eight `starterTopics`. After loading published content, `getSanityContext()` uses the requested AI SDK `generateObject` API with the configured Gemini model to propose eight distinct chapters spanning career domains, technologies, and projects. Generation and Sanity reads are cached for 60 seconds; topic cache keys also include the portfolio data and model so changed content produces a new spread. Generation has a five-second deadline. Missing credentials, provider failures, timeouts, or invalid/duplicate topics resolve to deterministic topics derived from projects, roles, advisory/role preferences, and overview navigation. This enhancement never blocks ordinary form submission.

The prompt dock exposes `data-conversation-state="idle|active"`, supports Enter to submit and Shift+Enter for a newline, and retains the 2,000-character limit. Navigation uses `nav[aria-label="Portfolio topics"][data-slot="topic-bladder"]`, semantic lists, and primary/secondary bubble attributes. Clicking a primary chapter sends its prompt with an explicit user-turn ID. Only that turn's `suggestFollowUps` output can replace its button with three second-level questions. Other primary chapters remain intact; selecting a different primary restores the former one. Secondary questions submit normally and do not produce a third navigation tier. Starting a new conversation restores all primary topics.

The `suggestFollowUps` tool validates exactly three label/prompt pairs. The system prompt asks for contextual follow-ups alongside receipts and after explicit overview/download requests. Follow-up parts are consumed by the TOC rather than duplicated in the response transcript. Freeform chat remains usable with empty starter topics or absent follow-up output.

`pnpm --filter joestein.dev test` covers deterministic and invalid-generation fallbacks, exact three-question tool inputs, receipt regressions, and multi-turn DOM interactions using mocked UI-message streams. These tests run without starting a server or making model calls. The Node-compatible jsdom 28 runtime is a development dependency.

## Bounded completion of live portfolio turns

The current chat contract requires a prose summary plus a completed core renderer (`showReceipts`, or an explicitly requested downloads/overview renderer). Empty receipt arrays are valid when the portfolio contains no matching evidence. Contextual suggestions are requested alongside the core renderer, but absent or invalid suggestions never invalidate an otherwise complete answer or justify another generation step.

A healthy response uses one model step. If a clean response ends with only prose or only core tool output, the server allows exactly one completion step: tools only when prose already exists, prose only when the core result already exists. Both steps stream into one assistant message and share a 50-second deadline. There is no third generation step, cached answer, or canned substitute. Provider transport retries are disabled (`maxRetries: 0`) so quota failures advance promptly through the model fallback chain; the two-step budget counts generation steps, not HTTP attempts. Truncation and provider failures are disclosed rather than triggering completion. Exhausted incomplete output remains visible with a retry action.

This addresses a control-flow conflict: stopping immediately on a receipt result could leave the summary missing, while prohibiting all prose after tools prevented its completion. A text-only model response also ends the SDK tool loop naturally, irrespective of its stop predicate. Explicitly coordinating the two bounded steps handles both cases. Diagnostics record step/output counts and failure categories without logging visitor questions or portfolio narratives. These checks establish response completeness and deterministic metadata hydration, not proof that generated prose is factually accurate.

Request progress appears in the conversation from submission through the final stream finish, including summary generation and bounded completion steps. It does not depend on a receipt tool already being present. In Phase 2.5, both example buttons and the native picker reveal the selected question in the existing textarea, then automatically submit; reduced motion skips the reveal. Editing during the reveal cancels auto-submit. During a request the question stays visible in a disabled textarea, alongside a static, muted `Pulling Receipts...` button. Submitted text clears on completion. The button retains a stable minimum size across labels. The tray no longer adds a Stop button during requests.

Page auto-follow uses measured question, content, header, tray, and visual-viewport bounds. It follows content growth only until the latest question reaches the usable viewport’s top edge. Wheel, touch, pointer, click, or keyboard interaction immediately cancels motion and relinquishes that turn; a new question or explicit retry can rearm it. Reduced motion uses immediate positioning, including when the preference changes during a response. Observers and animation frames are cleaned up when leaving the conversation. The document remains the only reading scroll surface; native scroll anchoring is disabled for the conversation so it cannot compete with the bounded follow behavior.

Submitting a question or explicitly retrying moves focus once to the current question heading with `preventScroll: true`. Its `tabIndex={-1}` supports programmatic focus without adding a permanent Tab stop. Focus and bounded scrolling are independent: streaming and completion do not move focus or reopen a mobile keyboard. Suggested prompts reveal text without focusing the textarea, then use the same submission path. Choosing “Start a new conversation” still explicitly focuses the composer as a new writing task.

## Quota model fallback

Each chat request uses a deduplicated model chain: the configured `GEMINI_MODEL` (default `gemini-3.5-flash-lite`), then `gemini-3.1-flash-lite`, `gemini-3.8-flash`, and `gemini-3.6-flash`. The provider middleware buffers initial bookkeeping and switches only on 429/quota/rate-limit failures before any answer or tool chunks start. Once output starts, even a later completion step cannot switch models and mix an answer. SDK retries are zero; all attempts share the turn’s 50-second deadline. Non-quota errors retain normal recovery behavior. Only exhaustion of the entire quota fallback chain produces the capacity-specific retry banner.

Diagnostics report the selected model, fallback transitions, and counts rather than visitor prompts or provider request bodies. The account/model compatibility results and remaining capacity limitation are recorded in [tests/model-access-check.md](tests/model-access-check.md). Fallback does not guarantee independent quotas or model availability.

## Colophon: published architecture notes

`/colophon` reads the published `page` document with slug `colophon` using fresh, non-CDN Sanity fetches. Studio provides a direct “Making of joestein.dev” editor for `page-colophon`, alongside About and the reusable Other pages list. The shared bookend header links to the colophon and returns to either `/?mode=prompt` or `/?mode=overview`.

The body is Portable Text with semantic headings, lists, marks, links, `codeBlock`, and block-level `mermaidDiagram` objects. Mermaid is dynamically imported only for diagrams. Rendering uses strict security, disallows document-supplied configuration directives, sanitizes SVG, and removes generated styles so semantic CSS tokens own presentation. Every diagram retains an SSR-rendered source disclosure if JavaScript or diagram rendering fails. Diagram layout tests use simulated SVG text measurements; they are not a claim of browser visual verification.

`colophonSummary` is part of the same published portfolio projection used by chat. It includes `pt::text(body)` plus technical block source, because Portable Text’s plain-text projection omits custom objects. `getPortfolioPromptData()` forwards this editorial context to Gemini without adding selectable receipt IDs or changing hydration. Content is data, including diagram/code source, rather than executable instructions.

The reviewed initial import snapshot is [content/making-of-joestein-dev.md](content/making-of-joestein-dev.md). After ingestion, Sanity is the runtime/editorial source of truth; editing that Markdown file alone does not update the site. The import utility creates structured JSON for MCP ingestion and does not write to Sanity itself. The supplied source contained two Mermaid blocks and no tables; the utility preserves any future imported table values as labeled list rows rather than silently dropping them.

Corrections from the supplied draft include fresh reads rather than a 60-second TTL, independent conversation/request state, current published project names, removal of frozen content/test counts and unsupported zero-cost/zero-CLS claims, and an explicit distinction between authoritative metadata hydration and unverified generated narrative. The workflow section describes documented iteration and handoffs rather than claiming independent agents aligned without shared context.

## Phase 2.5: independently adaptive prompt widgets

The composer and companion example prompts keep a fixed DOM order and remain mounted across idle/active transitions. Named inline-size containers (`prompt-dock`, `composer`, `examples`) control their own geometry and density. Outer height rules hide the optional companion first and compact secondary decorations in short windows. The active tray is light translucent glass over the paper canvas; both widgets have opaque token-based surfaces. Browsers without backdrop-filter, reduced-transparency preferences, and forced colors receive an opaque tray.

A labeled native `Example prompts` select stays above the textarea, including when the companion is hidden. Both presentations derive from the same flat starter/contextual suggestion collection. Both controls use the same reveal-and-auto-submit path; the native picker help text announces this behavior and its label resets on blur. Companion buttons preview four examples, with explicit more/fewer controls and a bounded expanded list. Sending an unchanged starter records its provenance; editing during the reveal cancels submission and turns it into a freeform draft. Empty suggestions never block typing or submission.

The document remains the conversation reading surface. No viewport-height app lock, conversation scroll panel, mobile clone, or controls side rail was introduced. `interactiveWidget: resizes-content` requests browser keyboard resizing; a small VisualViewport bridge supplies measured bottom occlusion where only the visual viewport changes. It does not infer a keyboard from focus and ignores pinch-zoom occlusion. If the controls cannot fit the available height, the tray returns to normal document flow. The header itself scrolls normally; auto-follow reserves no stale header space. A reusable, quiet monospace footer sits below the prompt widgets in their sticky tray, or in normal flow on Overview and Colophon. Auto-follow recognizes that fallback, keeps its question boundary, honors reduced motion, and relinquishes control on reader interaction. Simulated viewport tests cover geometry and cleanup; real phone keyboards still require device testing.

## Phase 2.6: shared mode navigation and editorial site configuration

The header and footer evolved independently through user testing. Their layouts still have different purposes, but both had begun owning the same mode identities, labels, routes, and button-versus-link decisions. `ModeControl` now owns that shared behavior. Its caller supplies the current mode, optional local-state transition callback, editorial labels, and structural `placement`. It performs no DOM inspection, routing lookup, or content fetch. `data-slot="mode-control"` plus `data-placement="header|footer"` let themes style each representation independently. Placement describes structural context; `idle|active` continues to describe conversation state. Neither dictates the other.

The application registry owns the supported `prompt` and `overview` IDs and their destinations. Header controls show the available choices; footer controls show alternatives to the supplied current mode instead of calculating a binary “next mode.” On editorial pages with no selected portfolio mode, both controls expose ordinary links to both modes. Mode selection remains exclusive. More modes would still be single selection, while a project landing page or an MCP interface is not automatically another mode. This iteration adds neither extra modes nor a configurable routing engine.

Sanity's `siteSettings` singleton (`site-settings`, edited through **Site Settings** in Studio) owns the visible brand name, short mode names, alternative-mode action labels, Making of link label, and prompt invitation/placeholder/submit/pending copy. Header, footer, and composer receive a normalized presentation object through props. Missing or blank settings fall back to centralized operational UI copy, never a canned AI answer or fabricated starter menu. Identity does not change when copy changes: renaming “Prompt” to “Ask Joe” still selects `prompt`. UI settings are not injected as LLM instructions. Model/provider secrets, supported behavior, routes, and theme geometry stay outside the editorial document.

Starter questions move from About to **Site Settings → Prompt Experience**. The initial copy preserves every original `_key`, question string, and array position so prompt lineage survives. The new query reads only Site Settings; an intentionally empty question list stays empty. The About field remains hidden, read-only, and deprecated with its original stored data intact. This supports the still-deployed 2.5 application and rollback without maintaining two active editorial sources. Publish the seeded Site Settings before deploying 2.6. Later edits belong exclusively in Site Settings; rolling back to 2.5 would show its retained older copy unless deliberately migrated back. The legacy field can be removed in a later, separately verified cleanup.

The architectural decision is to share behavior and identity while supplying context explicitly, keep editable language independent from capabilities, and organize content by responsibility. These are white-label foundations rather than an attempt to build a generic site builder. Regression coverage checks renamed labels against unchanged mode IDs/routes, header/footer representations, callback-based switching, standalone page links, copy fallbacks, and starter order/identity without an About fallback.

The initial `site-settings` document is seeded and published in `lt4yrzne/production`. Sanity MCP verified all eight original question keys, strings, and positions, plus the unchanged About revision. The local Studio schema was registered through the CLI so MCP could validate the new document type; website deployment remains separate. The published colophon also includes the Phase 2.6 decision notes, which enter the existing grounded AI context. Production-build HTTP checks verified Prompt, Overview, and Colophon against that published content; interaction regressions use simulated UI streams rather than paid model calls.

## Technology-list integrity: intentionally scoped Studio validation

Project `techStack`, role `technologies`, and achievement `technologies` use Sanity's built-in `rule.unique()` with an editorial error: “Each technology can only be listed once.” The rule compares array values while ignoring their `_key`, so separately added references to the same technology are flagged and block normal Studio publishing. A technology may still appear on multiple projects, roles, or achievements. These lists contain ordinary references; if reference metadata later varies, validation by `_ref` would express the identity constraint more precisely. See [Sanity array validation](https://www.sanity.io/docs/studio/array-type).

This is a deliberate assurance level for a personal portfolio with a small editorial workflow. It helps Joe avoid accidental duplicate tags at the source, without silently deduplicating frontend output or adding enforcement infrastructure. It does not repair existing published content, merge Technology documents, or enforce a Content Lake database constraint. Direct API, MCP, and import writes can bypass Studio validation. Existing chat receipts also retain the data returned when their turn was generated.

For a mission-critical system, we would enforce technology identity by `_ref` at every supported write boundary, including APIs, imports, and agent/MCP ingestion. We would restrict write credentials to those controlled paths, use revision-checked mutations or appropriate transactions for concurrent read/modify/write operations, and use database uniqueness constraints where the chosen datastore supports them. We would also validate data before critical downstream use, define explicit rejection/recovery behavior, and add ingestion regression checks plus automated audits for existing or externally written violations. Audits detect violations; they do not substitute for write-time enforcement. These layers are candidates for a later portfolio iteration as its ingestion paths or consequences grow; they are intentionally outside this change. The Studio rule is an editorial guardrail, not a claim of end-to-end data integrity or LLM narrative accuracy.
