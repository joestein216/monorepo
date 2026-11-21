<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Rules: `apps/freakyfrank` (Next.js App Router + Embedded Sanity Studio)

## 1. Workspace Boundaries, Identity & Approval Guardrails
- **Workspace Scope (`apps/freakyfrank` ONLY):** All code, schema, asset, and configuration edits must remain strictly inside `apps/freakyfrank`. Never modify root `package.json`, `pnpm-lock.yaml`, `packages/*`, or sibling apps in `apps/*`.
- **Protected Route Group (`app/(epk)/`):** **DO NOT TOUCH** the `(epk)` route group, its layouts, styles, or components. It shares the underlying Sanity dataset and content types with `(site)`, so any schema updates must remain backwards-compatible with existing EPK queries.
- **Root Entry Behavior:** Ensure `/` (`app/(site)/page.tsx`) renders the main Freaky Frank homepage directly. Remove or keep disabled any legacy middleware or page-level auto-redirects that route `/` to `/epk`.
- **Operator & Content Governance (`fclementi69@gmail.com`):**
  - **Content Updates (No Approval Required):** When operating on behalf of Frank (`fclementi69@gmail.com`) via Sanity Studio or Sanity MCP, creating, editing, reordering, or publishing CMS content (events, mixes, videos, record store items, homepage copy, hero/logo selections) is pre-approved and requires no confirmation gate.
  - **Code & Schema Changes (Guardrail):** Keep Frank's edits confined to Sanity documents and pre-approved `apps/freakyfrank` pageBuilder modules. Never alter authentication configs, environment secrets, or cross-workspace files.

## 2. Directory & Route Structure (No `src/` Directory)
Isolate Studio, EPK, and the main public site using Next.js Route Groups so global styles and parallax scripts never collide:
- `app/(studio)/studio/[[...tool]]/page.tsx`: Embedded Sanity Studio route.
- `app/(epk)/...`: **LOCKED / DO NOT MODIFY.** Shares Sanity content types.
- `app/(site)/layout.tsx`: Main site shell (minimal top nav, persistent bottom audio dock, global JSON-LD structured data).
- `app/(site)/page.tsx`: **Homepage** — Carl Cox–style shadow-lit hero + Jauz-style 3D parallax crowd/warehouse windows alternating with solid pitch-black (`#050505`) content bands:
  1. **Hero Band:** Existing Sanity hero portrait of Frank (high-contrast shadow blend), Sanity wordmark/logo, statement quote, and primary CTAs.
  2. **Featured Transmission (Parallax Window):** Highlighted live session/video floating over slow-scrolling crowd depth layer.
  3. **Events Band (Solid Black):** All **upcoming** events sorted **ascending** (`dateTime >= now()`), plus a dedicated expandable/separated section for **all past events** (`dateTime < now()`, sorted descending).
  4. **Music Band (Parallax Window / Solid):** Displays **all mixes** synced from Sanity (with inline playback into the persistent bottom audio dock).
  5. **Record Store Spotlight (Parallax Window):** Visual feature banner introducing the Record Store with direct CTA to `/record-store`.
  6. **From The Floor / Family & Videos:** Latest videos, flyers, and community updates.
- **Dedicated Sub-Pages under `app/(site)/`:**
  - `app/(site)/events/page.tsx`: Full Events archive — all upcoming events (ascending) cleanly separated from all past events (descending).
  - `app/(site)/mixes/page.tsx`: Dedicated Mixes catalog showing all DJ mixes and live sets.
  - `app/(site)/videos/page.tsx`: Dedicated Videos page for live club sets, recaps, and visual transmissions.
  - `app/(site)/record-store/page.tsx`: Dedicated Record Store page featuring its own Sanity-managed **hero image**, **store story/description**, and curated vinyl/merchandise catalog.
  - `app/(site)/contact/page.tsx`: Dedicated Contact & Booking page (management, press, booking inquiries, and EPK quick-link).

## 3. Visual & Motion Architecture (Carl Cox + Jauz Parallax System)
- **Aesthetic Rules:** Pitch-black (`#050505`) solid bands, metallic gold (`#d4af37`) accents, crisp white/silver typography, zero boxed "wedding DJ" card clutter. Use existing Sanity logo and hero portrait assets rather than hardcoded placeholders.
- **3D Scroll Parallax Guardrail:**
  - Implement parallax depth (`translate3d` on `requestAnimationFrame` or CSS scroll-driven timelines) inside reusable Client Component wrappers (e.g., `components/parallax/ParallaxWindow.tsx`) that accept server-fetched Sanity image URLs and children.
  - Keep data fetching strictly in React Server Components (`page.tsx`); pass plain serializable props down to parallax and audio player client boundaries.
  - Respect `prefers-reduced-motion: reduce` by disabling vertical offset transforms.

## 4. Next.js, React & Sanity TypeGen Conventions
- **Package Manager:** Use `pnpm` exclusively via root filters (`pnpm --filter freakyfrank <cmd>`).
- **Local Docs First:** Check `apps/freakyfrank/node_modules/next/dist/docs/` for async `params`/`searchParams`, caching (`use cache`), and Metadata API conventions before editing routes.
- **RSC by Default:** Only add `"use client"` to interactive leaf components (`ParallaxWindow`, `AudioDock`, `VideoModal`, interactive filters). Never import `next-sanity` Studio modules into `app/(site)/`.
- **GROQ & TypeGen (`sanity/`):**
  - Reuse existing Sanity content types (`artist`, `event`, `mix`, `video`, `merch` / `product`, `siteSettings`) so `(epk)` remains intact. Extend schemas additively (optional fields only) when adding Record Store hero/description or homepage settings.
  - Define every GROQ query using `defineQuery` from `next-sanity` in `sanity/lib/queries.ts`.
  - Always sort upcoming events ascending (`order(date asc)`) and past events descending (`order(date desc)`) in GROQ.
  - Run `pnpm --filter freakyfrank typegen` after any schema or `defineQuery` change. Never edit `sanity.types.ts` manually.
  - Keep `NEXT_PUBLIC_SANITY_*` browser-safe; keep API write/read tokens server-only.

## 5. SEO & Generative Engine Optimization (AI Search Ranking)
Every route under `app/(site)/` must implement technical SEO and structured entity signals so search engines and AI answer engines (ChatGPT, Perplexity, Google AI Overviews) rank `freakyfrank.com` as the canonical source:
- **Dynamic Metadata (`generateMetadata`):** Unique `<title>`, meta `<description>`, canonical URL (`https://freakyfrank.com...`), Open Graph tags (using Sanity `urlFor(image).width(1200).height(630)`), and Twitter cards on every page (`/`, `/events`, `/mixes`, `/videos`, `/record-store`, `/contact`).
- **JSON-LD Structured Data (`application/ld+json`):**
  - **Root / Homepage:** `Person` / `MusicGroup` schema for **Freaky Frank** (aliases: *DJ Freaky Frank*, genre: *Techno, House, Underground Electronic Music*, origin: *Long Island / New York*, `sameAs` links to Resident Advisor, Instagram, SoundCloud/hearthis.at).
  - **Events (`/events` & Homepage):** `MusicEvent` schema array for every upcoming show with `startDate`, `location` (`Place` + `PostalAddress`), `performer`, and `offers` (ticket URL).
  - **Mixes & Videos (`/mixes`, `/videos`):** `MusicRecording` / `AudioObject` and `VideoObject` schemas with duration, uploadDate, and stream URLs.
  - **Record Store (`/record-store`):** `Store` / `MusicStore` schema with store description, hero image, and `Product` / `Offer` items.
- **Crawler & AI Indexing Files:**
  - `app/sitemap.ts`: Auto-generates XML sitemap including all static routes and dynamic event/store slugs from Sanity.
  - `app/robots.ts`: Allows indexing of all `(site)` routes and disallows `/studio`.
  - `public/llms.txt`: Clean, machine-readable Markdown summary of Freaky Frank's bio, upcoming dates, mixes, record store, and booking contact for LLM crawlers.
- **Semantic HTML:** Exactly one `<h1>` per page (using visually-hidden `sr-only` text when the visual header uses the Sanity SVG/PNG logo), proper `<article>`, `<time dateTime="...">`, and descriptive `alt` attributes pulled from Sanity image metadata.

## 6. Verification Checklist (Required Before Finishing Any Task)
1. Confirm `app/(epk)/` has zero modified files (`git status`).
2. Confirm `/` loads `app/(site)/page.tsx` without redirecting to `/epk`.
3. Run `pnpm --filter freakyfrank typegen` (if schemas or queries changed).
4. Run `pnpm --filter freakyfrank lint`.
5. Run `pnpm --filter freakyfrank typecheck` (or `tsc --noEmit`).
