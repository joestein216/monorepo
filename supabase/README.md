# Supabase database

This directory is the source of truth for the database shared by all four apps.
The hosted project is `monorepo` (`hipolptjkkkddajdrwxn`).

Sanity content remains isolated per site. Supabase holds only shared relational,
authentication, storage, and workflow data that belongs in Postgres.

## First-time setup

```bash
pnpm supabase login
pnpm supabase link --project-ref hipolptjkkkddajdrwxn
pnpm supabase start
pnpm supabase db reset
```

The link command writes local state under `supabase/.temp/`, which is ignored by
Git. It may prompt for the database password; never commit that password.

## Schema workflow

The project uses declarative SQL under `supabase/schemas/`. Keep shared objects
in `00_core.sql` and add site-owned files with explicit numeric ordering.

```bash
pnpm supabase db diff -f <migration-name>
pnpm supabase db reset
pnpm types:db
```

Commit the declarative schema, generated migration, and regenerated TypeScript
types together. Before applying remote migrations, review the dry run:

```bash
pnpm supabase db push --dry-run
pnpm supabase db push
```

Do not use `db reset --linked` against this hosted project; it destroys remote
data. Seed files are for local development and tests only.
