# joestein.dev

Next.js App Router with an embedded Sanity Studio.

Run commands from the monorepo root:

```sh
pnpm --filter joestein.dev dev
pnpm --filter joestein.dev typegen
pnpm --filter joestein.dev build
pnpm --filter joestein.dev lint
pnpm --filter joestein.dev typecheck
```

The website runs at http://localhost:3006 and Studio at http://localhost:3006/studio.

Copy `.env.example` to `.env.local` when setting up another checkout and supply a Sanity Viewer API token. The project is `lt4yrzne`, dataset `production`. Never commit `.env.local`.

Frontend routes and global styles live in `app/(site)/`. Studio has its own root layout in `app/(studio)/` without frontend CSS. Cache Components and partial prefetching are disabled to support Studio's `force-static` configuration.

Add content types to `sanity/schemaTypes/index.ts` and queries with uniquely named `defineQuery` constants. Use `sanityFetch` from `sanity/lib/live.ts` for live content. Run TypeGen after schema or query edits and commit `sanity/extract.json` and `sanity.types.ts`; never edit them manually. The initial schema is intentionally empty.

Presentation previews http://localhost:3006 and enables Draft Mode through `/api/draft-mode/enable`, which validates Sanity preview secrets. SanityLive handles updates, and VisualEditing renders only in Draft Mode. The Viewer token is kept in a server-only module; the requested `defineLive.browserToken` configuration supplies it to authenticated Draft Mode browsers.

When deploying, configure the environment variables, update the Presentation preview URL to the deployed frontend, and add the deployed origin to Sanity CORS with credentials enabled.
