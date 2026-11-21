# Public site first pass

The public website lives in `app/(site)`. Its root layout owns navigation,
footer, and a single persistent audio provider. EPK and Studio retain their
independent root layouts and CSS. Entering either leaves the public audio session.
The older `(app)` group retains artist pages and draft-mode endpoints; its former
homepage has been replaced by `(site)/page.tsx`.

## Structure and presentation

Server components own semantic content. Native links, buttons, details/summary,
audio/video controls, landmarks, and heading order work independently of the theme.
`components/site` exposes `data-slot` boundaries. `app/(site)/globals.css` owns
visual presentation in token, core, and theme layers. Its tokens cover palette,
typography, spacing, controls, and major geometry.

Only navigation state, mix selection/playback, and parallax require client code.
Parallax transforms run through requestAnimationFrame with passive scroll events;
reduced motion removes the vertical transform. Media has no automatic video playback.

## Content map

- **Artist EPK / freaky-frank:** Existing portrait, gold logos, tagline, bio,
  audioEmbeds, videos, booking email, and external links. The main site and EPK
  share these documents without changing any existing field names or queries.
- **Events:** Existing `event` documents. Actual startsAt values determine
  upcoming versus past, with ascending/descending GROQ order. Date-only records
  remain upcoming through their New York calendar date. Undated events have their
  own listing; cancelled events retain a visible cancellation label.
- **Site Settings:** Optional heroPortrait and heroStatement overrides, crowdImage
  for parallax, recordStoreHeroImage, recordStoreTitle, recordStoreDescription,
  managementEmail, and pressEmail. Artist media and booking email are fallbacks.
- **Record Store Item:** Optional vinyl, apparel, or release documents. Supply an
  image and alt text, description, price/currency, availability, and purchaseUrl.
  Purchase links use the seller’s checkout. No local cart or payment service exists.
- **Photo Albums:** The latest six become community updates on the homepage.
- **Media metadata:** Optional uploadDate and ISO 8601 duration fields support
  accurate structured data. No dates or durations are invented for existing media.

No CMS documents were written or published as part of this implementation.
The crowd background and store content need editorial selection in Studio.

## Data and playback

`sanity/lib/queries.ts` contains public-site defineQuery queries, with types
produced by Sanity TypeGen. `public-site.ts` performs server-only fetching with
request deduplication, published perspective, and 60-second revalidation. Draft
Mode uses the server read token and draft perspective; refresh to see draft edits.
Public data and metadata disable stega; public clients receive no read token.

The audio dock stays mounted across Next.js navigation within `(site)`. Existing
mixes use trusted provider embeds: select a mix, then use the provider’s play,
pause, and seeking controls. Optional direct streamUrl uses native audio controls.
Closing the dock unloads playback. Reloading or leaving the public route group
ends the session. Untrusted embeds fall back to original source links.

## Search and indexing

All six public routes generate unique canonical, Open Graph, and Twitter metadata
for https://freakyfrank.com, using Sanity-generated 1200×630 images when available.
JSON-LD reflects actual available fields. Video search enhancements requiring an
upload date need that CMS field populated. Person identity is emitted in the shared
layout, alongside route-specific event, audio, video, store, and product schemas.

The sitemap contains real rendered pages. Event/store slugs identify anchors in
catalog pages; they do not imply unimplemented detail routes. CMS updates supply
catalog lastModified values. robots.txt disallows Studio and API paths. llms.txt
links to current listings instead of copying dates that would become stale; update
its static contact line if the booking address changes.

## Permissions

Studio is configured for this app’s Sanity project/dataset. There are no local
email-based role restrictions or publication approval gates. Sanity organization
and project roles govern Studio/MCP access; repository instructions do not enforce
those account permissions. Authentication and role configuration were not changed.

## Checks

Run from the monorepo root with the package’s actual scoped name:

```sh
pnpm --filter @repo/freakyfrank typegen
pnpm --filter @repo/freakyfrank lint
pnpm --filter @repo/freakyfrank typecheck
pnpm --filter @repo/freakyfrank build
```

The inherited next.config.ts disables build-time type validation, so the separate
TypeScript check is required. After moving routes, refresh Next’s generated cache
with `pnpm --filter @repo/freakyfrank exec next typegen` if stale paths remain.
