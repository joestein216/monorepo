# Supabase database

This directory is the source of truth for the database shared by all four apps.
The two hosted environments are:

- Local, Vercel Development, and Vercel Preview: `monorepo-development`
  (`exqqxtnbcaioqmdgjcio`)
- Vercel Production: `monorepo-production` (`bzzwkdenmsaurjkdmabk`)

Sanity content remains isolated per site. Supabase holds only shared relational,
authentication, storage, and workflow data that belongs in Postgres.

## First-time setup

```bash
pnpm supabase login
pnpm supabase link --project-ref exqqxtnbcaioqmdgjcio
pnpm supabase start
pnpm supabase db reset
```

Development is the default linked remote. The link command writes local state
under `supabase/.temp/`, which is ignored by Git. It may prompt for the database
password; never commit that password.

## Schema workflow

The project uses declarative SQL under `supabase/schemas/`. Keep shared objects
in `00_core.sql` and add site-owned files with explicit numeric ordering.

```bash
pnpm supabase db diff -f <migration-name>
pnpm supabase db reset
pnpm types:db
```

Commit the declarative schema, generated migration, and regenerated TypeScript
types together.

## Remote deployment

Apply and verify migrations against development first:

```bash
pnpm supabase link --project-ref exqqxtnbcaioqmdgjcio
pnpm supabase db push --dry-run
pnpm supabase db push
```

After development verification, target production explicitly and apply the same
committed migrations:

```bash
pnpm supabase link --project-ref bzzwkdenmsaurjkdmabk
pnpm supabase db push --dry-run
pnpm supabase db push
pnpm supabase link --project-ref exqqxtnbcaioqmdgjcio
```

Relink development immediately afterward so normal CLI and type-generation work
cannot accidentally target production. Never use `db reset --linked` against
either hosted project; it destroys remote data. Seed files are for local
development and tests only.
