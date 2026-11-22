<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Rules: Tasty Techno (`apps/tastytechno`)

## Domain & Product Context
- **Brand Role:** Tasty Techno is the parent electronic music event-management, artist-management, and underground culture brand (distinct from single-series or individual artist sites).
- **Core Capabilities:**
  1. Multi-artist EPK & roster showcase (`artistPage`), event archive & upcoming listings (`event`), and curated event photography (`photo`, `photoAlbum`).
  2. Planned creation-only multi-platform event syndication from Sanity Studio to external ticketing/discovery platforms (**Resident Advisor**, **Posh.vip**, **Shotgun.live**) via an asynchronous queue and a decoupled, Dockerized Playwright worker.

---

## Story Execution & Plan-First Workflow
- **Review Before Coding:** For every story, inspect the relevant files and review downstream impacts on upcoming stories first. Surface any ambiguities, hidden coupling, or better architectural alternatives and **wait for explicit user confirmation** before modifying files.
- **Maintain Documentation:** Update `apps/tastytechno/README.md` alongside any architectural, setup, environment variable, or workflow changes in each story.
- **Portfolio / Case-Study Notes:** Capture architectural decisions, diagrams, and trade-offs for the `joestein.dev` Tasty Techno project doc when requested—do not publish "Making Of" pages inside the public `tastytechno` frontend.

---

## Accepted Scope and Delivery Order
- **Story 0:** Reproducible TypeGen/checks, necessary type/dependency fixes, server-only token boundaries, stega hygiene, and README. Keep existing schema/query paths and route groups. Do not refactor image components, public UI, or presentation. Do not build syndication schemas, actions, endpoints, workers, or deployment infrastructure in Story 0.
- Prove one platform end-to-end before adding more. Keep the creation webhook disabled during development; the manual Studio action and eventual webhook will use the same publishing endpoint.
- Each event is an independent document. No recurrence engine, external update synchronization, paid tickets, payments, or organizer-approval fields/workflows. Organizer coordination happens offline; all events follow the same software path. Use a $0 admission tier only where a platform requires it.
- Creation means the first publication of a complete Sanity event, not its first draft save. Finalize the durable creation/idempotency mechanism before implementing Story 1.
- On **any syndication failure**, stop that attempt and log the actual error and context (with credentials/cookies redacted) for manual review. No automatic retry, login recovery, or challenge handling. If the external submission outcome is uncertain, reconcile it manually before explicitly requesting another attempt. Manual event creation is the fallback.
- Deliberate sequential field entry, reasonable pauses, and scrolling may be used for ordinary form interaction. They are not guarantees about platform acceptance. Surface concrete account-access risks before platform tests.
- Keep public pages until working replacements exist. Revisit image contracts and presentation only after the syndicator works.

## Directory Structure (No `src/` Directory)
- `app/`: Next.js App Router routes and layouts.
  - `app/(app)/layout.tsx` & `page.tsx`: Public frontend layout and pages. Keep Studio CSS completely isolated from frontend layouts.
  - `app/(studio)/studio/[[...tool]]/{layout,page}.tsx`: Existing embedded Studio, isolated from site CSS. Preserve its current rendering setup unless a demonstrated build/runtime issue requires a change. Do not add a shared `app/layout.tsx`.
  - `app/(app)/api/draft-mode/enable/route.ts`: Validates Sanity preview secrets before enabling Draft Mode.
  - `app/api/syndicate/orchestrate/route.ts` (planned): Vercel serverless webhook/Studio trigger that validates, normalizes, and queues syndication jobs.
- `components/`: Semantic, white-label UI primitives (`SanityImage`, layout landmarks, media embeds).
- `sanity/`: Sanity configuration, schemas, GROQ queries, Studio actions, and client helpers.
  - Schemas currently live at app-root `schemaTypes/`: Document and object schema definitions (`event`, `artistPage`, `photo`, `photoAlbum`, `siteSettings`, `homePage`, `portableText`, `seo`, `link`, `navigationItem`).
  - `sanity/actions/`: Custom Sanity Studio Document Actions (e.g., manual syndication trigger / retry).
  - `sanity/lib/`: Public client, server-only published client, `defineLive` / `sanityFetch`, image URL builder, and token helper.
  - `sanity/queries/`: Existing typed frontend queries. Add future backend queries here or in `sanity/lib/`; both are included in TypeGen.
- `lib/syndication/` (planned): Shared, framework-agnostic TypeScript contracts (Zod schemas for `NormalizedEventPayload`, platform status types, date/timezone helpers). Must have zero Next.js or Playwright runtime imports so both Vercel and `worker/` can import it cleanly.
- `worker/` (planned): Decoupled Dockerized worker; prove locally first, then validate deployment separately on the VPS. It needs its own dependency/TypeScript boundary and a Docker build context containing shared contracts.
  - `worker/Dockerfile` & `worker/docker-compose.yml`: Self-contained container build for local testing and VPS deployment.
  - `worker/src/adapters/`: Isolated platform adapters (`ra.ts`, `posh.ts`, `shotgun.ts`).
  - `worker/src/browser/`: Browser runner, deliberate interaction pacing, and session loader.
  - `worker/scripts/`: Local CLI scripts (e.g., `capture-auth.ts`) for exporting `storageState` cookies.
- `sanity.config.ts` & `sanity.cli.ts`: Located at `apps/tastytechno/` root.
- `schema.json` & `sanity.types.ts`: Existing generated schema and types; commit both. Keep these paths until there is a functional reason to migrate them.

---

## Next.js & React Conventions
- Follow the local docs in `node_modules/next/dist/docs/` for async request APIs (`params`, `searchParams`, `cookies`, `headers`), caching directives (`use cache`), and Route Handlers.
- Default to React Server Components (RSC). Only add `"use client"` when browser APIs, hooks, or Sanity Visual Editing overlays strictly require it.
- Never import `next-sanity` Studio components into frontend RSC pages. Studio client modules stay in the Studio route group.
- Keep Cache Components and partial prefetching disabled in this baseline.

---

## Sanity CMS, TypeGen & Image Handling Conventions
- **TypeGen Is Mandatory:** Define all GROQ queries using `defineQuery` from `next-sanity` with unique variable names. Never hand-write interfaces that duplicate Sanity document shapes; use TypeGen output (`sanity.types.ts`) exclusively.
- **Regenerate After Changes:** Always run `pnpm --filter @repo/tastytechno typegen` from the monorepo root after editing any schema file in `schemaTypes/` or any `defineQuery` call. Never manually edit `sanity.types.ts` or `schema.json`.
- **Tokens & Env Vars:**
  - `NEXT_PUBLIC_SANITY_*` for browser-safe project ID and dataset only.
  - Keep read tokens (`SANITY_API_READ_TOKEN`) and future write/mutation tokens (`SANITY_API_WRITE_TOKEN`) strictly server-only. Import read credentials through `sanity/lib/token.ts`; never import it in Studio or public client components. Do not create or require write credentials before the story that needs mutations.
  - `sanity/lib/server-client.ts` is the clean, uncached, published-perspective read boundary for backend work/static params. Backend jobs must not import `sanityFetch` or depend on Draft Mode cookies.
  - `defineLive` uses `browserToken: false`. Published content remains live; draft edits require a refresh. A live-draft relay is deferred until needed.
- **Stega Hygiene:** Disable stega for metadata, URLs, and static params. Clean stega strings (`stegaClean`) before comparing field values, IDs, or syndication flags.
- **Image Pipeline — Existing Implementation Frozen Until After Syndication:**
  - Do not refactor components or their contracts in Story 0. Existing legacy types/layout rules are deferred; the conventions below guide future replacements.
  - Use one shared `SanityImage` component built on `@sanity/image-url` + `next/image`.
  - Always respect Sanity `hotspot` and `crop` data when generating `urlFor(source)` URLs.
  - Require explicit `alt` text (enforced in schema; fallback to empty string `""` only for explicitly decorative assets).
  - Use asset metadata (`lqip`) for blur placeholders when available, and pass explicit `sizes` attributes on responsive images. Do not mix legacy `<img>` tags or ad-hoc URL builders across pages.

---

## Core UI Architecture, White-Label & Accessibility Rules
- **Separation of Structure & Presentation (`data-slot` + Semantic HTML):**
  - Use semantic HTML5 landmarks (`main`, `header`, `section`, `article`, `footer`, `nav`, `aside`, `fieldset`, `time`, `address`) before `div`.
  - Keep domain JSX free of long inline Tailwind utility strings. Stamp structural boundaries with `data-slot="..."` attributes and style via semantic CSS custom properties.
- **White-Label Design Token Contract:**
  - Never hardcode hex/rgb colors, arbitrary pixel dimensions, or font families in JSX or component CSS. Map all visual properties to semantic CSS tokens (`--color-surface`, `--color-surface-elevated`, `--color-foreground`, `--color-muted`, `--color-border`, `--color-accent`, `--color-focus-ring`, `--space-*`, `--radius-*`).
- **WCAG A+ Accessibility & Zero Hover-Only Interactions:**
  - Every interactive control must be keyboard-operable with visible `:focus-visible` rings (`--color-focus-ring`) and clear ARIA semantics.
  - Never gate content, tooltips, or disclosures behind `:hover`. Use click/tap/keyboard activation (`openOnHover={false}` on Base UI primitives).
  - Primary text must meet WCAG AAA (`7:1+`) and secondary metadata WCAG AA (`4.5:1+`).

---

## Event Syndication Architecture & Guardrails (Future Stories)
1. **Boundary:** Next.js routes validate caller authorization, fetch published/stega-free content, normalize it, and dispatch work. Never bundle Playwright/Chromium into Next.js. Shared contracts must have no Next.js/Playwright runtime imports. Keep worker files out of the Next.js TypeScript project and public TypeGen scan.
2. **Execution:** Begin with one platform, one browser execution at a time, and no automatic retries. Per-function concurrency does not create a shared worker-wide limit; configure capacity explicitly when adding adapters. Platforms have no ordering dependency. Close browser resources in `finally` blocks.
3. **Sessions:** Capture authenticated state through local, human-operated login; keep it out of Git, container images, and logs. Never automate fresh logins or recover automatically from login redirects/CAPTCHAs. Log what actually happened rather than assuming session expiration.
4. **Creation-only/idempotency:** Persist external platform identity against the Sanity event occurrence. Reconcile existing listings before creation; title/date matching is a reconciliation aid, not a durable identity. Do not automatically update successful external listings after Sanity edits. Distinguish submitted/pending review from confirmed public visibility. Record outcomes without overwriting unrelated platform state or triggering another syndication job.
5. **Rollout:** Keep webhook delivery disabled until manual-path verification passes. Validate the hosted deployment separately from adding another adapter. Document platform/account constraints and any uncertain submission outcome for manual review.

---

## Trade-Off & Rule Conflict Escalation Protocol
- If a task requires violating any architectural, accessibility, token, or Sanity rule above:
  1. Pause before editing and state which rule is affected.
  2. Explain the concrete trade-off.
  3. Present **Option A (Compliant Alternative)** and **Option B (Scoped Compromise)** and wait for explicit user approval before applying Option B.

---

## Verification Checklist

Before completing any story in apps/tastytechno, run from the monorepo root:
- pnpm --filter @repo/tastytechno typegen (whenever schemas or queries change)
- pnpm --filter @repo/tastytechno typecheck
- pnpm --filter @repo/tastytechno lint
- pnpm --filter @repo/tastytechno build
- Verify apps/tastytechno/README.md reflects any setup, schema, or workflow changes made in the story.
- For worker/ changes: verify docker build -t tastytechno-worker ./apps/tastytechno/worker succeeds cleanly.
