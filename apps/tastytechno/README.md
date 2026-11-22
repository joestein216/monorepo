# Tasty Techno

Next.js App Router frontend and embedded Sanity Studio for Tasty Techno's
artists, events, and photography. Event syndication is planned; Story 0 establishes
the development/data foundation and does not implement or enable publishing jobs.

## Local setup

Use pnpm from the monorepo root. The package name is `@repo/tastytechno`.
Use Node 22.12 or newer to satisfy the installed Sanity/client requirements.
Install workspace dependencies using the repository's normal pnpm workflow.
Copy this app's `.env.example` to `.env.local` and supply its project/dataset and
server-only Viewer read token. The example contains no real credentials.

```sh
pnpm --filter @repo/tastytechno dev
```

The site runs at http://localhost:3004 and Studio at http://localhost:3004/studio.
For deployed Studio preview, set `NEXT_PUBLIC_SITE_URL` to the frontend origin and
`NEXT_PUBLIC_STUDIO_URL` to its Studio URL. These are public configuration, never
places for tokens. Project CORS/role settings are managed in Sanity; no account,
role, token provisioning, or remote content changes are part of this baseline.

## Existing architecture

- `app/(app)/`: public pages, root layout/CSS, crawler files, and Draft Mode routes.
- `app/(studio)/studio/[[...tool]]/`: isolated Studio layout, page, and client boundary.
- `schemaTypes/`: current schema definitions; no schema/path migration in Story 0.
- `sanity/queries/`: existing frontend GROQ queries/getters.
- `sanity/lib/client.ts`: browser-safe client configuration with no credentials.
  Its stega filter excludes known identifiers, URLs, dates, and behavior fields
  while retaining annotations on editorial text.
- `sanity/lib/token.ts`: explicit server-only boundary for the Viewer read token.
- `sanity/lib/server-client.ts`: server-only published, stega-free, non-CDN read
  client. Published data in this dataset is public, so it intentionally has no token. No preview cookies, no automatic request retries. Use this boundary for
  backend work and static params; never use preview-aware fetching for syndication.
- `sanity/lib/live.ts`: preview-aware `sanityFetch` and published `SanityLive`.
  `browserToken: false` keeps the read token out of preview browsers. Draft content
  is still fetched server-side; refresh to see draft edits. Automatic live-draft
  refreshing/relay is deliberately deferred. Published updates remain live.

Metadata calls explicitly pass `{stega: false}`. Static params use the published
server client. Clean strings at logic/URL/structured-data boundaries with
`stegaClean`; do not strip annotations from visible editorial content globally.
IDs and boolean flags must not be confused with display labels. The public layout
sets the canonical metadata base to https://www.tastytechno.com.

The local read token was rejected by Sanity during verification (`401 — Session
not found`). Published, unauthenticated reads were verified separately. A valid
Viewer token must be supplied by an operator before authenticated draft preview
can be verified; no credentials were changed and there is no automatic auth fallback.

No write client exists yet. A future `SANITY_API_WRITE_TOKEN` must remain in a
server-only module and must never be reused for previews or shipped with Studio.

## Verification and generated types

```sh
pnpm --filter @repo/tastytechno typegen
pnpm --filter @repo/tastytechno typecheck
pnpm --filter @repo/tastytechno lint
pnpm --filter @repo/tastytechno build
```

TypeGen extracts the schema to existing `schema.json` with `--force`, then scans
`app`, `components`, `sanity`, and `scripts` TS/TSX files. Queries must have unique
`defineQuery` names. Commit `schema.json` and `sanity.types.ts`; never hand-edit
them. Import/seed queries participate in generation, but those scripts are not
executed by TypeGen or the build. They mutate remote content when explicitly run;
do not use them as verification commands.

The future `worker/` is excluded from the Next.js TypeScript project and is not
scanned by this TypeGen configuration. It needs its own package/tsconfig and build
context. Shared normalized contracts should stay framework-independent; any worker
Sanity query strategy must be agreed before worker implementation.

The workspace currently pins Sanity to 6.8.0 through the root override, despite the
app declaring 6.9.1. The baseline retains that installed dependency set; changing
the global override needs a separate cross-workspace review. The deprecated,
unused `@sanity/presentation` dependency is also deferred: code already imports
`sanity/presentation`. No dependency/lockfile upgrade is needed just for this story.

## Syndication decisions for subsequent stories

- First publication of a complete event, plus an explicit manual Studio trigger,
  will use one orchestration endpoint. Keep the webhook disabled during development.
- Creation only: no synchronization of subsequent edits, recurrence engine, paid
  tickets/payments, or organizer-approval fields. Offline coordination stays offline.
- Each platform is independent. Add a single $0 admission tier only where required.
- No automatic retry or recovery after any failure, including login redirects.
  Record the actual error and context for manual review, redacting credentials.
  Reconcile uncertain submission results before an explicit new attempt.
- Keep stable external identities and distinguish submission from public visibility.
- Prove one platform locally with a Dockerized worker before generalizing; validate
  the VPS deployment separately. Recheck the plan and approve scope before each story.

## Deferred work

Image contracts/components, public styling/page replacement, cosmetic route/schema
folder moves, live-draft relay, and broad dependency upgrades are outside Story 0.
Existing public pages stay until working replacements exist. No syndication schema,
Studio action, endpoint, queue, browser adapter, or infrastructure is added here.
