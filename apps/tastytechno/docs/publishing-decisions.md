# Publishing decisions

Keep short, dated records of consequential content-model and publishing-boundary
decisions. Record the context available at the time, including uncertainty. Append
a superseding entry when a decision changes; do not erase the earlier rationale.
Routine field mappings do not need their own decision record unless they change
core semantics or introduce a new abstraction.

## 2026-11-22 — Shared event facts, destination editions, typed adapters

**Agreement:** The user explicitly requested recording this principle in AGENTS.md
after reviewing the event/edition/adapter separation. This approves the guiding
principle, not an implementation story or external publishing action.

**Need and context:** Tasty Techno prepares roughly one independent event per
week. Browser delivery feasibility and account acceptance remain unproven. A hub
can still provide value by preparing content and imagery for review and manual
posting. The desired experience supports creative exploration across destinations,
not automatic duplication of identical posts. The RA manual workflow and HARs
provide mapping evidence; other destination contracts still require verification.

**Decision:**

- Keep shared event facts in the event document.
- Model destination-specific editorial work as publishing editions referencing
  that event. Present the relationship together in the hub.
- Resolve inherited content at read/preview time. Store intentional overrides,
  preserve them when the source changes, and support returning to inheritance.
- Keep mechanical formatting and external field contracts in small typed adapters.
- Reuse original image assets with independent framing where a destination needs it.
- Allow core event expansion for a demonstrated domain/shared content need, with
  rationale and agreement recorded before implementing the change.

**Alternatives and trade-offs:** Putting every destination's fields on the event
couples the core schema to external quirks. Copying the whole event into each
edition creates synchronization work and stale copies. Completely unrelated
platform documents repeat entry. Referenced editions preserve a common source
and creative differences, but introduce inheritance and review behavior that must
be explicit. Avoid a generic configuration engine; add only the fields and
behaviors needed by the approved slice.

**Compatibility:** Documentation only. No schemas, documents, permissions, routes,
or external listings were changed. Future schema changes must identify existing
consumers and migration needs. The earlier queue/container/VPS roadmap is deferred;
it is not a prerequisite for publishing preparation. Public page/image refactors
remain deferred; narrowly scoped hub image preparation is a separate possibility.

**Reconsider when:** A concrete platform workflow cannot fit without awkward
duplication; editors repeatedly make the same override; a platform requirement
turns out to describe a genuine event fact; or usage establishes a need for a
different editing, versioning, access, or delivery boundary. Record the evidence
and revised decision at that point.

## 2026-11-23 — One authoritative dataset and a forward rebuild

**Agreement:** The user prefers one site/content source with an optional sandbox,
and explicitly accepts a reset if needed because the current content is available
locally. Build forward from the current work rather than reconstructing old models.

**Context:** The current local app reads `5sak3amq` / `development`, including
Frank's profile, the gallery, the July event, and the newly published November 27
Into: Haven event. The separate static site still serves tastytechno.com; there is
no audience relying on a monorepo production content-promotion workflow.

**Decision:** Keep that existing dataset as the authoritative source and align
local, preview, and live code deployments to it at cutover. Do not rename, clone,
or reset it merely to satisfy environment labels. A separate sandbox is optional.
Do not build dataset synchronization or legacy migrations without a concrete need.

**Trade-offs:** Shared content removes duplicate entry and promotion work, but
schema and editorial changes affect whichever deployments read it. Validate
compatibility with live code; do not treat `development` as disposable test data.
Distinct datasets remain an option for experiments that genuinely require them.

**Compatibility:** Documentation only. Local configuration already uses this
dataset; hosted variables, the domain, and existing datasets were not changed.
Reset tolerance does not require a reset, and does not authorize external-platform
test submissions.

**Reconsider when:** Destructive experiments require isolated content, different
audiences require different access boundaries, or actual usage justifies a
separate editorial/deployment process.

## 2026-11-23 — A shared Backstage focus and sourced opportunities

**Agreement:** After reviewing the weekly Promote / Research / Engage view, the
user requested pulling Gabriela and Café Balearica information into the opportunity
sections and allowing Frank to feature or unfeature one item, then confirmed the
approach. This expands the original static mock scope only enough to persist
opportunity content and the shared feature choice.

**Decision:** Add a Studio tool, an editable `backstageOpportunity` document, and
one live-edited `backstageBoard` singleton. The board references existing events
or opportunities; it never copies event facts. Its explicit focus mode follows
the next upcoming event, selects one item, or leaves the spotlight empty.
Expired events leave the upcoming view on load/refresh; opportunities do not expire
just because the weekly event changes. No polling or platform monitoring.

**Alternatives and trade-offs:** Browser-only state would diverge between Frank
and Joe. Storing these choices on the event would mix workspace editorial choices
with shared event facts. A small singleton and referenced content supply durable
shared behavior without adding an edition model before mappings are reviewed.
Use revision checks for existing board mutations and expose failures without
retry. Concurrent initial creation uses one transaction; initial contenders are
last-write-wins. No new backend token or privileged server route.

**Access and compatibility:** The tool checks editor/admin membership and uses
the signed-in Studio user's client; Content Lake enforces their dataset write
permissions. Public datasets still expose their content: store sourced public
facts and non-sensitive preparation copy only. No role grants or access policies
are changed. Public event schemas and queries stay compatible. UI-only access
filtering is not a substitute for dataset permissions. The custom tool writes
published board preferences directly; opportunities use normal draft/publish.
The prototype promotion cards are labeled examples, except the specific RA
listing confirmed by the user; no counts, status writes, or analytics are added.

**Reconsider when:** Actual work requires saved destination editions, private
relationship notes, custom roles, or richer prioritization. Those need a scoped
review rather than silently growing the event or workspace schemas.

## 2026-11-23 — Manual curation while evaluating value

**Agreement and context:** The user explicitly accepts manually maintaining
research and opportunities during this week's iteration. This serves one DJ we
know closely; clear actions and intentions can invite useful conversations before
we invest in automation.

**Decision:** Treat sourced manual curation as a valid operating approach. Evaluate
whether Frank understands each item's purpose and next action, and whether the
workspace prompts useful action or discussion. Direct observation and feedback
are sufficient for this pilot; no usage instrumentation is required. Add automation
only for a demonstrated repeated burden with agreed value and scope.

**Trade-offs and compatibility:** This accepts some manual effort in exchange for
low cost and faster learning. It changes guidance only: no new schema, tracking,
background research, integration, or maintenance schedule. Source dates and links
remain visible so a manually maintained snapshot does not imply live verification.

**Reconsider when:** Maintenance becomes a recurring obstacle, the audience grows
beyond close collaborators, or a proven action benefits from specific automation.

## Template for subsequent decisions

- Date, title, and earlier decision superseded (if any).
- Concrete need and evidence/constraints known now; distinguish assumptions.
- Chosen field/behavior ownership and rationale.
- Alternatives, costs, and trade-offs.
- Existing consumers, compatibility/migration impact, and verification needed.
- User agreement: pending or the actual approval context; do not invent approval.
- Conditions that would justify revisiting the decision.
