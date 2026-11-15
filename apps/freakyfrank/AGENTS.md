<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Rules: Next.js App Router + Embedded Sanity Studio

## Directory Structure (No `src/` Directory)
- `app/`: Next.js App Router routes and layouts.
  - `app/studio/[[...tool]]/page.tsx`: Embedded Sanity Studio route. Keep Studio isolated from frontend root layouts/styles using route groups (e.g., `app/(site)/` vs `app/(studio)/`) so global frontend CSS does not bleed into Studio UI.
- `sanity/`: Sanity configuration, schemas, GROQ queries, and client helpers.
  - `sanity/schemaTypes/`: Document and object schema definitions.
  - `sanity/lib/`: Sanity client, `defineLive` / `sanityFetch`, image URL builder, and queries.
- `sanity.config.ts` & `sanity.cli.ts`: Located at this project root (`apps/<project>/`).

## Next.js & React Conventions
- Follow the local docs in `node_modules/next/dist/docs/` for async request APIs (`params`, `searchParams`, `cookies`, `headers`), caching directives (`use cache`), and Server Actions.
- Default to React Server Components (RSC). Only add `"use client"` when browser APIs, hooks, or Sanity Visual Editing overlays strictly require it.
- Never import `next-sanity` Studio components into frontend RSC pages.

## Sanity CMS & TypeGen Conventions
- Define all queries using `defineQuery` from `next-sanity` so TypeGen can extract them automatically.
- Always run TypeGen after modifying schemas or `defineQuery` calls:
  - `pnpm --filter <project-name> typegen` (or `npx sanity typegen generate` inside `apps/<project>`).
- Never manually edit generated Sanity type files (e.g., `sanity.types.ts`).
- Keep environment variables prefixed with `NEXT_PUBLIC_SANITY_*` for browser-safe project ID and dataset values; keep read/write tokens strictly server-only.

## Verification Checklist
- Run `pnpm --filter <project-name> lint` and `pnpm --filter <project-name> typecheck` (or `tsc --noEmit`) before finishing a task.
