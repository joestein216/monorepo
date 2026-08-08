# Deployment environments

Create one Vercel project for each app and point it at the corresponding root
directory:

| Vercel project | Root directory |
| --- | --- |
| Archtypica | `apps/archtypica` |
| Joe Stein | `apps/joestein` |
| Luff Photo | `apps/luffphoto` |
| Tasty Techno | `apps/tastytechno` |

Each app owns one Sanity project. Create both `development` and `production`
datasets in that project, then scope the variables in that app's Vercel project:

| Variable | Development | Preview | Production |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Site project ID | Same site project ID | Same site project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `development` | `development` | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Development URL | Preview-safe URL | Production URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Development key | Preview-safe key | Production key |

Do not derive the Sanity dataset from `NODE_ENV`. Vercel Preview builds run a
production-mode Next.js build, so Preview must explicitly receive
`NEXT_PUBLIC_SANITY_DATASET=development`.

The project ID, dataset name, Supabase URL, and Supabase publishable key are
browser-visible configuration. Never put a Supabase secret key or legacy
`service_role` key in a `NEXT_PUBLIC_` variable.

For local development, copy the relevant app's `.env.example` to
`.env.local` and fill in that site's values. Keep `.env.local` untracked.

After a domain is connected, add the app's local, Preview, and Production Studio
origins to the matching Sanity project's CORS settings with authenticated
requests enabled.

## Database type generation

The shared generated types live at
`packages/database/database.types.ts`. Regenerate them without committing a
project reference:

```bash
SUPABASE_PROJECT_ID=your-project-ref pnpm types:db
```
