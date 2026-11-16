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
