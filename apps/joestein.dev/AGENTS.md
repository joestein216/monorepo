<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Rules: Next.js App Router + Embedded Sanity Studio

## Directory Structure (No `src/` Directory)
- `app/`: Next.js App Router routes and layouts.
  - `app/(site)/layout.tsx` and `page.tsx`: Frontend root layout, styles, and home page. Render SanityLive here and VisualEditing only in Draft Mode.
  - `app/(studio)/layout.tsx`: Independent html/body wrapper without frontend CSS.
  - `app/(studio)/studio/[[...tool]]/page.tsx`: Embedded Studio at /studio with `dynamic = "force-static"`. Do not add a shared `app/layout.tsx`.
  - `app/api/draft-mode/enable/route.ts`: Validates Sanity preview secrets before enabling Draft Mode.
- `sanity/`: Sanity configuration, schemas, GROQ queries, and client helpers.
  - `sanity/schemaTypes/`: Document and object schema definitions.
  - `sanity/lib/`: Sanity client, `defineLive` / `sanityFetch`, image URL builder, and queries.
- `sanity.config.ts` & `sanity.cli.ts`: Located at this project root (`apps/<project>/`).
- `sanity/env.ts`: Validated public Sanity environment variables.
- `sanity/extract.json` and `sanity.types.ts`: Generated schema and types; commit both.

## Next.js & React Conventions
- Follow the local docs in `node_modules/next/dist/docs/` for async request APIs (`params`, `searchParams`, `cookies`, `headers`), caching directives (`use cache`), and Server Actions.
- Default to React Server Components (RSC). Only add `"use client"` when browser APIs, hooks, or Sanity Visual Editing overlays strictly require it.
- Never import `next-sanity` Studio components into frontend RSC pages.

## Sanity CMS & TypeGen Conventions
- Define all queries using `defineQuery` from `next-sanity` so TypeGen can extract them automatically.
- Always run TypeGen after modifying schemas or `defineQuery` calls:
  - `pnpm --filter joestein.dev typegen` from the monorepo root.
- TypeGen scans `./{app,components,sanity}/**/*.{ts,tsx}`, extracts to `./sanity/extract.json`, and writes `./sanity.types.ts` with client method overloads enabled.
- Give every extracted `defineQuery` a unique variable name. Use inferred query results instead of manually recreating result types.
- Never manually edit generated Sanity type files (e.g., `sanity.types.ts`).
- Use `NEXT_PUBLIC_SANITY_*` only for public configuration. Store the Viewer token in the ignored `.env.local`; import it only through the server-only `sanity/lib/token.ts`. The explicit `defineLive.browserToken` configuration shares that read-only token with authenticated Draft Mode clients.
- Disable stega for metadata and static params. Clean stega strings before using field values in comparisons or IDs.
- Keep Cache Components and partial prefetching disabled while the Studio uses `dynamic = "force-static"`.

## Verification Checklist
- Run `pnpm --filter joestein.dev typegen`, `pnpm --filter joestein.dev build`, `pnpm --filter joestein.dev lint`, and `pnpm --filter joestein.dev typecheck` from the root.


## Core UI Architecture & Accessibility Values (Phase 2+)

### 1. Separation of Structure & Presentation (`data-slot` + Semantic HTML)
- **Semantic First:** Always choose semantic HTML5 elements (`main`, `header`, `section`, `article`, `footer`, `nav`, `aside`, `fieldset`, `output`, `address`) before reaching for `div`. Use `div` only as a pure CSS layout/grid grouping wrapper where no landmark meaning applies.
- **Zero Class Soup in Domain Components:** Keep domain JSX (`ReceiptCard`, `Overview`, `PortfolioPrototype`) free of long inline Tailwind utility strings. Stamp structural boundaries with `data-slot="..."` attributes and style them through semantic CSS token layers so themes can control colors, typography, and layout geometry without altering JSX.

### 2. White-Label Design Token Contract
- **No Raw Values in JSX or Component CSS:** Never hardcode hex/rgb colors (`#0B0D11`, `bg-zinc-900`), arbitrary pixel widths (`w-[640px]`), or hardcoded font weights inside components.
- **Semantic Tokens Only:** All visual properties must map to semantic CSS custom properties (`--color-surface`, `--color-surface-elevated`, `--color-foreground`, `--color-muted`, `--color-border`, `--color-accent`, `--color-focus-ring`, `--space-*`, `--radius-*`) so re-theming (`data-theme="..."`) requires zero markup changes.

### 3. WCAG A+ Accessibility & Agent-Readability
- **Accessibility Tree = Agent Interface:** Every interactive element must be keyboard-operable, screen-reader friendly, and cleanly exposed in the accessibility tree with unique, descriptive `aria-label` landmarks and sequential heading levels.
- **Headless Primitives (`Base UI`):** Use Base UI–backed primitives for interactive controls (tabs, tooltips, disclosures) via the `render` prop—never build custom `div` click handlers or hover-only tooltips that hide content from keyboard/agent users.
- **Contrast & Focus Rings:** Primary text must meet WCAG AAA (`7:1+`) and secondary metadata must meet WCAG AA (`4.5:1+`). Never remove `:focus-visible` outlines without replacing them with a visible `--color-focus-ring` indicator.

---

## Trade-Off & Rule Conflict Escalation Protocol
- **Never Silently Violate Core Values:** If a user request, quick fix, or third-party integration requires breaking any rule above (for example, adding a fixed pixel width, an inline color override, a presentational DOM wrapper, or hiding content behind hover-only interaction):
  1. **Pause before editing** (or isolate the proposal) and explicitly call out which core rule is affected.
  2. **Explain the concrete trade-off** (e.g., white-label theme portability, DOM cleanliness, or keyboard/screen-reader accessibility impact).
  3. **Offer two clear paths:**
     - **Option A (Compliant Alternative):** How to achieve the goal within the design token / `data-slot` / accessibility rules.
     - **Option B (Scoped Compromise):** Proceed with the requested exception, isolated cleanly with a brief inline comment explaining why the compromise was approved.
  4. **Wait for explicit user confirmation** before applying Option B.

## Application Architecture Principles

### Expose State Without Prescribing Presentation
- Represent application facts through explicit state and structural attributes.
- Prefer names such as `idle`, `active`, or `pending` over layout-specific
  names such as `centered`, `collapsed-tray`, or `sidebar-mode`.
- Keep independent concerns separate: conversation state, request status,
  selection, and presentation should not become one overloaded state machine.

### Model Relationships According to Their Meaning
- Distinguish identity, origin, grouping, and hierarchy.
- Do not introduce parent/child structures merely because one item was
  generated from another.
- Preserve provenance explicitly when it matters, using stable identifiers
  rather than display text or array positions.

### Store Authoritative State; Derive Its Representations
- Avoid independently maintaining multiple copies of the same information.
- Derive rendered collections from authoritative content and interaction state
  where practical.
- Keep editorial content, application behavior, and theme configuration
  independently understandable.

### Keep Functional Accessibility in the Core
- Core components own semantics, keyboard behavior, focus management,
  status announcements, and recovery controls.
- Themes control presentation while preserving those behaviors and a coherent
  reading and focus order.
- Essential information and actions must remain available without custom styling.

### Establish Deterministic Boundaries Around Generative Systems
- Treat model output as proposed input to application code.
- Validate tool arguments and resolve authoritative identifiers server-side.
- Retrieve authoritative metadata from its source rather than asking the model
  to reproduce it.
- Define what happens when output is missing, invalid, or ambiguous.
- Do not describe structural validation as proof of narrative accuracy.

### Scale Assurance to Consequences
- Choose validation, approval, recovery, and evaluation requirements according
  to the consequences of an incorrect result.
- Document the guarantees provided and the uncertainty intentionally accepted.
- Make failures visible and recoverable rather than disguising them as success.

### Verify Architectural Contracts
- Test important behavior across content, state, API, and rendering boundaries.
- Include identity, provenance, ordering, accessibility behavior, and failure
  recovery where relevant.
- Keep behavioral verification independent of a particular visual theme.

## Phase 2.0 Visual & Interaction Invariants

### 1. Zero Hover-Only Interactions ("No Hovers Ever")
- **Click/Tap Disclosures Only:** Never gate content, tooltips, or controls behind `:hover` or pointer-hover triggers. Every secondary disclosure (such as the `(i)` relevance breakdown and mobile `Topics` expansion) must open on explicit click, tap, or keyboard activation (`Enter` / `Space`) and close cleanly on `Escape` or outside click.
- **Base UI Configuration:** When using Base UI `<Popover.Root>` or `<Tooltip.Trigger>`, explicitly disable hover activation (`openOnHover={false}`) so touchscreens, keyboards, and browser agents share 100% interaction parity.

### 2. Inline Streaming & Progressive Status Cues
- **No Blocking Loaders:** Never render modal spinners or full-screen overlays during generation. Show progress inline at the exact point of activity:
  1. **Button (`submitted`):** Run the horizontal `Pulling receipts...` stock-ticker scroll inside the disabled submit button (`prefers-reduced-motion` falls back to static text).
  2. **Prose Tail (`streaming` text):** Render an inline blinking block cursor (`data-slot="stream-cursor"`) at the end of the active summary paragraph until text streaming finishes.
  3. **Receipts Transition (`tool-showReceipts` in flight):** Show a quiet inline status line (`Pulling matching receipts…`) directly above the receipts region until `output-available`.
- **Screen-Reader & Agent Readiness (`aria-busy`):** Set `aria-busy={isTurnStreaming}` on the active assistant turn container and maintain a polite `aria-live="polite"` status region so assistive tech and browser agents wait until streaming settles before reading the final turn.

### 3. Accessible Input & Character Limit (`12,000` Chars)
- **No Hard Truncation (`maxLength` Forbidden):** Do not put a hard `maxLength` attribute on the prompt `<textarea>` so pasted job descriptions are never silently clipped. Validate in React/Zod and render an upper-right tabular monospace counter (`0 / 12,000`) using color **plus** non-color text/icon indicators (`approaching` and `exceeded` states + `aria-invalid="true"`).
- **Mobile Auto-Zoom Prevention:** Keep `<textarea>` font size at `>= 1rem` (`16px`) on mobile viewports (`< 1024px`).

### 4. Titleless Quote Receipts & CSS Masonry
- **Story First, No Synthetic Titles:** Never render a `"Receipt:"` heading on receipt cards. Present the `tailoredNarrative` directly as an editorial quote excerpt, expanding vertically in place via a click-triggered `more...` button when truncated.
- **Distinct Monospace Hierarchy & `1:1` Gauge:** Style `ul[data-slot="tech-list"]` as a quiet piped footnote (`--color-ink-tech`) distinct from the bottom role/company stamp (`--color-ink-stamp`), with a compact `1:1` monochrome radial score gauge + click-only `(i)` disclosure in the lower right.

### 5. Active Bottom Tray & Unbounded Topic Bladder
- **No Visible Bladder Label:** Rely on `aria-label="Portfolio topics"` on `<nav>` and shape differentiation (`data-tier="starter"` rectangles vs. `data-tier="contextual"` outlined pills)—never render a visible heading above the bubbles.
- **Responsive Geometry:** Render a 50/50 split (`prompt-composer` left, fluid unbounded `topic-bladder` right) on desktop (`>= 1024px`), and a single horizontal swipe row of active contextual follow-ups + click-triggered `Topics +` expansion on mobile (`< 1024px`).
