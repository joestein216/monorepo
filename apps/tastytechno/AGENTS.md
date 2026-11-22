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
  2. Automated multi-platform event syndication from Sanity Studio to external ticketing/discovery platforms (**Resident Advisor**, **Posh.vip**, **Shotgun.live**) via an asynchronous queue and a decoupled, Dockerized Playwright worker.

---

## Directory Structure (No `src/` Directory)
- `app/`: Next.js App Router routes and layouts.
  - `app/(site)/layout.tsx` & `page.tsx`: Public frontend layout and pages. Keep Studio CSS completely isolated from frontend layouts.
  - `app/(studio)/layout.tsx` & `app/(studio)/studio/[[...tool]]/page.tsx`: Embedded Sanity Studio with `dynamic = "force-static"`. Do not add a shared `app/layout.tsx`.
  - `app/api/draft-mode/enable/route.ts`: Validates Sanity preview secrets before enabling Draft Mode.
  - `app/api/syndicate/orchestrate/route.ts`: Vercel serverless webhook/Studio trigger that validates, normalizes, and queues syndication jobs.
- `components/`: Semantic, white-label UI primitives (`SanityImage`, layout landmarks, media embeds).
- `sanity/`: Sanity configuration, schemas, GROQ queries, Studio actions, and client helpers.
  - `sanity/schemaTypes/`: Document and object schema definitions (`event`, `artistPage`, `photo`, `photoAlbum`, `siteSettings`, `homePage`, `portableText`, `seo`, `link`, `navigationItem`).
  - `sanity/actions/`: Custom Sanity Studio Document Actions (e.g., manual syndication trigger / retry).
  - `sanity/lib/`: Sanity client, `defineLive` / `sanityFetch`, image URL builder, token helpers, and GROQ queries.
- `lib/syndication/`: Shared, framework-agnostic TypeScript contracts (Zod schemas for `NormalizedEventPayload`, platform status types, date/timezone helpers). Must have zero Next.js or Playwright runtime imports so both Vercel and `worker/` can import it cleanly.
- `worker/`: Decoupled, Dockerized Playwright + Inngest worker service deployed externally on a VPS.
  - `worker/Dockerfile` & `worker/docker-compose.yml`: Self-contained container build for local testing and VPS deployment.
  - `worker/src/adapters/`: Isolated platform adapters (`ra.ts`, `posh.ts`, `shotgun.ts`).
  - `worker/src/browser/`: Stealth Playwright runner, human-cadence helpers, and session loader.
  - `worker/scripts/`: Local CLI scripts (e.g., `capture-auth.ts`) for exporting `storageState` cookies.
- `sanity.config.ts` & `sanity.cli.ts`: Located at `apps/tastytechno/` root.
- `sanity/extract.json` & `sanity.types.ts`: Generated schema and types; commit both.

---

## Next.js & React Conventions
- Follow the local docs in `node_modules/next/dist/docs/` for async request APIs (`params`, `searchParams`, `cookies`, `headers`), caching directives (`use cache`), and Route Handlers.
- Default to React Server Components (RSC). Only add `"use client"` when browser APIs, hooks, or Sanity Visual Editing overlays strictly require it.
- Never import `next-sanity` Studio components into frontend RSC pages.
- Keep Cache Components and partial prefetching disabled while the Studio uses `dynamic = "force-static"`.

---

## Sanity CMS, TypeGen & Image Handling Conventions
- **TypeGen Is Mandatory:** Define all GROQ queries using `defineQuery` from `next-sanity` with unique variable names. Never hand-write interfaces that duplicate Sanity document shapes; use TypeGen output (`sanity.types.ts`) exclusively.
- **Regenerate After Changes:** Always run `pnpm --filter tastytechno typegen` from the monorepo root after editing any file in `sanity/schemaTypes/` or any `defineQuery` call. Never manually edit `sanity.types.ts` or `sanity/extract.json`.
- **Tokens & Env Vars:**
  - `NEXT_PUBLIC_SANITY_*` for browser-safe project ID and dataset only.
  - Keep read tokens (`SANITY_API_READ_TOKEN`) and write/mutation tokens (`SANITY_API_WRITE_TOKEN` for syndication status callbacks) strictly server-only.
- **Stega Hygiene:** Disable stega for metadata, URLs, and static params. Clean stega strings (`stegaClean`) before comparing field values, IDs, or syndication flags.
- **Canonical Image Pipeline (Single Pattern Only):**
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

## Event Syndication Architecture & Guardrails
1. **Decoupled Worker Boundary:**
   - Vercel Next.js routes handle webhook verification, Sanity querying, Zod normalization, and Inngest event emission only. Never bundle Playwright or Chromium in the Next.js app.
   - The `worker/` service runs externally inside Docker (deployed on a VPS behind Cloudflare Tunnel) and serves `/api/inngest`.
2. **Resource & Concurrency Limits:**
   - Configure Inngest syndication functions with `concurrency: { limit: 1 }` per worker instance so Chromium browser contexts execute sequentially (`RA -> Posh -> Shotgun`) without exceeding VPS RAM limits.
   - Always close Playwright `BrowserContext` and `Page` instances inside `finally` blocks to prevent memory leaks.
3. **Session & Anti-Bot Hygiene:**
   - Never automate fresh username/password logins inside the headless worker. Load pre-authenticated `storageState` JSON files captured locally via `worker/scripts/capture-auth.ts`.
   - If a platform redirects to a login or CAPTCHA page, fail fast without retrying loops, mark that platform `failed` in Sanity with an actionable `"Session expired — refresh auth state"` message, and leave other platforms unaffected.
   - Use realistic `America/New_York` timezone/locale settings, randomized inter-field delays, natural keystroke cadence (`pressSequentially` with jitter), and smooth scrolling.
4. **Idempotency & Live-Publish Happy Path:**
   - Default target action is **live publish** (after passing strict Zod validation in the orchestrator).
   - Before submitting a new event on any target site, the adapter must scan existing organizer drafts/upcoming events for a matching title + date. If found, capture and return the existing `externalUrl` instead of creating a duplicate.
   - Every adapter execution must conclude by patching the Sanity `event` document's `syndication.platforms.<site>` object (`status`, `externalUrl`, `lastAttempt`, `errorMessage`).

---

## Trade-Off & Rule Conflict Escalation Protocol
- If a task requires violating any architectural, accessibility, token, or Sanity rule above:
  1. Pause before editing and state which rule is affected.
  2. Explain the concrete trade-off.
  3. Present **Option A (Compliant Alternative)** and **Option B (Scoped Compromise)** and wait for explicit user approval before applying Option B.

---

## Verification Checklist
Before completing any story in `apps/tastytechno`, run from the monorepo root:
- `pnpm --filter tastytechno typegen` (whenever schemas or queries change)
- `pnpm --filter tastytechno typecheck`
- `pnpm --filter tastytechno lint`
- `pnpm --filter tastytechno build`
- For `worker/` changes: verify `docker build -t tastytechno-worker ./apps/tastytechno/worker` succeeds cleanly.
