<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Rules: Tasty Techno (`apps/tastytechno`)

## Domain & Product Context
- **Brand Role:** Tasty Techno began as an event-series identity, not an agreed permanent parent brand. Keep its existing identity useful without making it a mandatory umbrella for Frank, Into: Haven, or collaborators. Backstage is the preparation tool; its deployment location does not determine who organizes or presents an event.
- **Core Capabilities:**
  1. Multi-artist EPK & roster showcase (`artistPage`), event archive & upcoming listings (`event`), and curated event photography (`photo`, `photoAlbum`).
  2. Planned editor/admin publishing hub: prepare and review destination-specific event content and imagery, with copy/download controls and platform links. Resident Advisor mapping is the first evidenced destination; Posh.vip, Shotgun.live, Instagram, and Facebook are additional opportunities. Automated delivery is a separate, unproven capability, not a prerequisite for hub value.

---

## Story Execution & Plan-First Workflow
- **Review Before Coding:** For every story, inspect the relevant files and review downstream impacts on upcoming stories first. Surface any ambiguities, hidden coupling, or better architectural alternatives and **wait for explicit user confirmation** before modifying files.
- **Maintain Documentation:** Update `apps/tastytechno/README.md` alongside any architectural, setup, environment variable, or workflow changes in each story.
- **Portfolio / Case-Study Notes:** Capture architectural decisions, diagrams, and trade-offs for the `joestein.dev` Tasty Techno project doc when requested—do not publish "Making Of" pages inside the public `tastytechno` frontend.

---

## Accepted Scope and Delivery Order
- **Current direction:** Build useful publishing preparation before delivery infrastructure. The publishing-hub principles below supersede earlier unimplemented queue/worker/VPS sequencing where they conflict. Planned paths and syndication guardrails describe conditional future work, not requirements to implement now. No automatic social posting is authorized. Hub-specific image preparation may be scoped explicitly without reopening the deferred public image-component refactor.
- **First Backstage slice approved and implemented:** `/studio/backstage` is an editor/admin Studio tool with Promote / Research / Engage groups. Published events and sourced `backstageOpportunity` documents supply content; the live-edited `backstageBoard` singleton stores next-event/selected/hidden focus modes. A single shared feature choice references existing content rather than extending the event. Opportunities stay editable through Structure; snapshot preparation cards are not monitored platform states. No delivery or analytics are implemented. See README and the November 23 decision entry for scope and access boundaries.
- **Public-site cutover slice approved:** Prepare the Sanity homepage around Frank and Into: Haven, with Tasty Techno photographs and past events available for exploration. Keep the static domain deployment until the replacement and current content are reviewed. Mobile usability does not mean removing exploration or forcing all images into identical crops. This supersedes the earlier presentation deferral for this homepage slice only; the shared image-component refactor remains deferred.
- **One authoritative dataset:** Use the existing `5sak3amq` / `development` content as the forward starting point for local, preview, and eventual live deployments. Its name does not make it disposable. No required content-promotion pipeline or second dataset; a sandbox is optional when a concrete experiment needs it. This app-specific decision supersedes the two-dataset convention in root deployment documentation. Align deployment variables at cutover; do not infer a dataset from `NODE_ENV`. The user accepts rebuilding/resetting current content because originals are local, so do not invent a legacy migration project merely to preserve the earlier model. A reset is not required or performed by this decision. Check actual frontend compatibility for schema changes; sharing content does not authorize test mutations against external platforms.
- **Story 0:** Reproducible TypeGen/checks, necessary type/dependency fixes, server-only token boundaries, stega hygiene, and README. Keep existing schema/query paths and route groups. Do not refactor image components, public UI, or presentation. Do not build syndication schemas, actions, endpoints, workers, or deployment infrastructure in Story 0.
- Prove one platform end-to-end before adding more. Keep the creation webhook disabled during development; the manual Studio action and eventual webhook will use the same publishing endpoint.
- Each event is an independent document. No recurrence engine, external update synchronization, paid tickets, payments, or organizer-approval fields/workflows. Organizer coordination happens offline; all events follow the same software path. Use a $0 admission tier only where a platform requires it.
- Creation means the first publication of a complete Sanity event, not its first draft save. Finalize the durable creation/idempotency mechanism before implementing Story 1.
- On **any syndication failure**, stop that attempt and log the actual error and context (with credentials/cookies redacted) for manual review. No automatic retry, login recovery, or challenge handling. If the external submission outcome is uncertain, reconcile it manually before explicitly requesting another attempt. Manual event creation is the fallback.
- Deliberate sequential field entry, reasonable pauses, and scrolling may be used for ordinary form interaction. They are not guarantees about platform acceptance. Surface concrete account-access risks before platform tests.
- Keep public pages until working replacements exist. Revisit image contracts and presentation only after the syndicator works.

## Publishing Hub: Content Boundaries and Deliberate Evolution
- **Guiding principle:** Centralize shared event facts; keep destination-specific editorial choices in publishing editions that reference the event, and mechanical translation in typed adapters. Adding a destination should normally extend its edition/adapter, not expand the core event. This is a default boundary, not a frozen event schema.
- **Core event evolution:** Add or change core fields when they describe the event itself or meet a demonstrated shared content need. A second consumer is supporting evidence, not a prerequisite. Do not duplicate facts or force awkward workarounds merely to avoid a justified core change.
- **Document the reason before implementation:** For changes to these boundaries, core event semantics, or new shared abstractions, add a short dated entry to `docs/publishing-decisions.md`: concrete need, current evidence/constraints, chosen ownership, alternatives/trade-offs, compatibility or migration impact, user agreement, and conditions for reconsideration. Propose the decision during normal story review; record approval when actually given. No separate approval ceremony is needed when the existing request already explicitly authorizes the documented change. Preserve past rationale and append superseding decisions rather than rewriting history as if the outcome were always obvious.
- **Inherit; do not synchronize copies:** Resolve untouched edition content from the event. Persist deliberate overrides, with explicit inherit/custom/omit semantics where applicable. Never infer those modes from truthiness or an ambiguous empty value. Provide a way to return to inheritance. Source changes update inherited previews; preserve customized work and indicate when relevant source changes warrant review. Do not build general merge/synchronization machinery in advance of a demonstrated need.
- **Stable identity and imagery:** Put reusable external identities with the artist, venue, or promoter they identify when those entities are modeled. Keep temporary per-edition mappings explicit until a reusable entity is justified; never silently match by display name. Reuse image assets, allowing independent edition crop/hotspot/alt choices and an explicit return to the shared image. Do not duplicate uploads just to obtain another crop.
- **Strict destination contracts:** Use named, typed fields and adapters with explicit input/output and validation. Do not use arbitrary JSON/options bags, schema-driven workflow engines, or a lowest-common-denominator universal platform payload. A destination-specific requirement should block that destination's readiness, not saving a valid core event or preparing another destination. Distinguish missing source data from unsupported platform capabilities.
- **Product value and evidence:** Make reviewing a real event useful without a tour: contextual editing, previews, copy/download, and links can stand alone. Label approximate previews and unverified platform rules. Copying, downloading, or opening a platform must not imply submission or publication. Source edits do not authorize external updates. Add delivery, scheduling, analytics, ingestion pipelines, or new infrastructure only for a concrete agreed use case; future opportunities are not current scope.
- **Manual upkeep is a valid evaluation method:** Backstage initially serves one DJ we work closely with. Manually researching opportunities, maintaining sourced cards, and curating priorities is an acceptable inexpensive way to test usefulness and intuitiveness. Make each feed item's intent and next action clear; use Frank's actual interactions and conversations to guide iteration. Do not treat manual maintenance as a defect or make automation a prerequisite. Automate a specific repeated burden only after its value is demonstrated and the scope is agreed; do not add usage tracking merely to evaluate this small pilot.
- **Access and data boundaries:** Restrict the hub to authorized editors/admins; hiding navigation alone is not authorization. Enforce authorization at any privileged server operation too. The Sanity dataset's public content boundary remains relevant: a private UI does not make stored documents private. Do not put credentials, raw HARs, session data, or sensitive operational notes into public content documents.

The initial rationale and future decision entries live in `docs/publishing-decisions.md`. These are guiding constraints for incremental implementation, not authorization to build every mechanism described here in the next story.

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
