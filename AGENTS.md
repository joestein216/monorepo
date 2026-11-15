# Monorepo Workspace Rules

## Package Manager & Commands
- Use `pnpm` exclusively. Never run `npm` or `yarn`.
- Always target specific apps using filters from the root: `pnpm --filter <project-name> <command>`.
- Never add app-specific dependencies to the root `package.json`. Install them inside the target workspace (`pnpm --filter <project-name> add <pkg>`).
- Never manually edit `pnpm-lock.yaml`.

## Repository Layout
- `apps/*`: Independent Next.js applications (no `src/` directory; `app/` sits at each project root).
- `packages/*`: Shared internal libraries, UI components, or configs (if present).

## Workflow & Token Hygiene
- Before writing code in any app, read that app's local `AGENTS.md` first.
- Keep diffs focused on the requested workspace. Do not touch sibling apps in `apps/` unless explicitly instructed.
