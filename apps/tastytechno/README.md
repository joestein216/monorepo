# Tasty Techno

Next.js App Router frontend and embedded Sanity Studio for Tasty Techno's
artists, events, and photography. Event syndication is planned; Story 0 establishes
the development/data foundation and does not implement or enable publishing jobs.

## Publishing hub direction

The next product direction is an editor/admin publishing hub for reviewing event
content through destination-specific presentations, with useful manual copy,
image download, and platform-link workflows before automated delivery. This is
partially implemented as the Backstage workspace described below. The earlier queue/worker/VPS roadmap below is conditional
future work, not a prerequisite; automatic social posting is outside current scope.

Keep shared event facts on the event, destination-specific editorial choices in
publishing editions referencing it, and mechanical translations in typed adapters.
Inherit source content until deliberately overridden; preserve custom work when
the source changes. Reuse image assets while permitting destination-specific
framing. A platform requirement must not unnecessarily constrain unrelated events
or destinations. The core event can evolve for demonstrated needs with documented
rationale and user agreement, rather than being either frozen or a catch-all.

See [AGENTS.md](./AGENTS.md) for guiding rules and
[publishing decisions](./docs/publishing-decisions.md) for the dated rationale and
lightweight decision template. The initial principles were documentation only; the first Backstage workspace now adds shared focus and opportunity content, without delivery integrations.

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

### One content dataset

Use project `5sak3amq`, dataset `development`, as the authoritative forward
content source. Local, preview, and eventual live deployments should use the same
dataset; the existing name need not change. Separate code deployments do not
require separate content copies. Draft Mode is available for occasional previews,
not a mandatory editorial approval workflow. Add a sandbox only when an actual
experiment needs disposable content.

This app-specific decision supersedes the root deployment guide's two-dataset
convention. Current local configuration already uses this dataset. Hosted
configuration alignment is still part of cutover and has not been performed.
Never derive the dataset from `NODE_ENV`. Schema changes must remain compatible
with the frontend versions reading the shared content, or explicitly coordinate
that change. The user accepts a content rebuild/reset during this rebuild if
needed; do not create a historical migration project by default. No reset or
dataset deletion has been performed.

## Existing architecture

### Public homepage replacement in progress

The homepage now centers Into: Haven and its resident artist, with a next-event
section, photographs linked to their album, and a separate event archive. It
preserves natural image proportions and provides direct section links on small
screens; larger screens put related text and imagery alongside one another.
Existing event, artist, and album detail routes remain available.

In Studio, Home Page now has a **Current residency** object, a **Featured artist**
reference, and an optional artist website URL. These are homepage editorial
choices, not additions to the core event contract or a recurrence generator.
Existing chapter fields and documents are retained. The homepage uses Into: Haven
and Freaky Frank defaults until these new editorial fields are populated.

`lib/home-events.ts` separates dated upcoming/in-progress events from archives.
An expired featured event cannot become the next event. Cancelled, TBA, missing,
or invalid date ranges are not promoted as upcoming. Without an end time, only
events whose start has not passed qualify. Sorting uses actual timestamps, not
the display order. Dates rendered without an editorial label use New York time.

Cutover is not complete. The development dataset now includes the published
`into-haven-2026-11-27` event, its organizer-supplied flyer, Frank's artist reference,
and the existing RA listing link. Publishing was explicitly authorized. The public
label follows the flyer (10 p.m. to close, 21+); the machine end time is 4 a.m. the
next day, matching the manually submitted RA event. The homepage and event detail
were verified against this published content. The July event and photo album
remain in the archive. Before switching domains, review the homepage editorial
settings and gallery captions/alt text, align hosted configuration to the shared dataset, and
check old `/collective` and `/tickets` URL destinations. The RA artist archive
remains source material to review, not a runtime data dependency. No domain was
moved and no new external-platform event was created.

Homepage metadata currently uses residency-focused copy rather than the previous
chapter-era homepage SEO values. The public-site design is a reviewable first
pass; it does not alter the isolated Studio theme or existing image contracts.

The homepage uses a matte charcoal palette, opaque information panels, restrained
red actions, and a brushed gunmetal portrait frame. Event details and contact
addresses remain selectable HTML text. A low-contrast background gains a fixed
viewport perspective only when scroll motion is enabled; reduced-motion users
retain the normal scrolling background. These tokens are scoped to the homepage.

### Backstage: this week and the next connection

This is a small pilot for one DJ we work closely with. Manual opportunity research,
card maintenance, and curation are acceptable while we evaluate whether the feed's
intent and next actions are useful and intuitive. Feedback can come directly from
Frank and from conversations during the week; evaluation does not require new
analytics. Automate a demonstrated repeated burden when it earns its place.

Open `/studio/backstage` as a signed-in Sanity **editor** or **administrator**.
The tool has its own scoped charcoal styling; it does not import public global
CSS or change Studio's shell. The public website has no Backstage route or nav link.
A role check gates both tool registration and its root. Mutations use the signed-in
Studio client and Content Lake's dataset permissions, never a new server token.
Other/custom roles are excluded until explicitly supported. Content itself is not
private in this public dataset: do not add private contacts or relationship notes.

The large **In focus** space follows the next published upcoming event by default.
**Feature this** selects an event or opportunity for everyone; **Unfeature** clears
the space without deleting the item. **Follow the next event** restores automatic
selection. An ended/cancelled event stops appearing on the next load/refresh; if a
selected event is no longer eligible, the next eligible event takes its place.
There are no timers, recurring-event generation, or external-platform status checks.

Preferences are saved directly to the live-edited `backstageBoard` singleton,
managed through Structure with a fixed ID. Existing updates use revision guards;
conflicts/errors are shown for manual refresh, without automatic retry. The first
creation uses an atomic create-if-missing + patch transaction. On concurrent first
creation, the last write wins. Saved choices are shared; other open views see them
when refreshed. If a write succeeds but refresh fails, refresh before trying again.

`backstageOpportunity` holds a title, group, summary, address, suggested next step,
and official source/action links with a source-check date. Edit/publish opportunities
through Structure. Initial content was sourced from Gabriela's official website
and Café Balearica's DJ-submissions page on November 23, 2026. Their details are
snapshots and can change; the source links remain visible. These documents were
published in `5sak3amq` / `development`, and the additive schema was deployed with
the local Sanity CLI. No website/domain deployment was changed.

The **Promote / Research / Engage** groups stack on narrow screens and sit alongside
one another on larger screens. Promote includes the specific November 27 RA listing
as user-confirmed completed work while the event is upcoming. Instagram, Posh,
Shotgun, and Facebook cards are explicitly preparation examples, not verified
publication states. Instagram's starting copy comes from the current event; copying
it or opening a site does not submit or mark anything posted. No external contact,
application, or social post was sent. No performance figures are invented.

There is one pre-existing Studio development warning about `photo.usage` combining
`layout: tags` with predefined list options; this slice does not change that schema.

### Optional scroll scene

The homepage residency section has three visual planes: a decorative projection,
the event artwork, and foreground copy. It starts still. The **Scroll motion**
button explicitly enables scroll-driven video seeking and shallow parallax; there
is no autoplay, audio playback, looping playback, or perpetual animation loop.
Turning it off removes the scroll listeners and restores static presentation.
`prefers-reduced-motion` disables the effect in both JavaScript and CSS, including
when the device preference changes while the page is open. All event information
and navigation remain available without motion or JavaScript.

The local source `109980-685695012.mp4` was reduced to a silent 12-second,
960-pixel-wide H.264 derivative in `public/media/dance-projection.mp4`, with a JPEG
poster alongside it. The original is unchanged and is not bundled. The derivative
loads only after opting in; the poster is decorative. Video errors leave the
still background and readable content intact. This is a homepage composition,
not separation of the dancers from the lights within the original footage.
No video is uploaded to Sanity file storage or a new video hosting service.

These choices address motion controls and reduced-motion behavior; they are not
a claim that the entire site has passed a WCAG conformance audit.

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

No server write client exists. Backstage uses the signed-in Studio client for
shared feature preferences. A future `SANITY_API_WRITE_TOKEN` must remain in a
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
