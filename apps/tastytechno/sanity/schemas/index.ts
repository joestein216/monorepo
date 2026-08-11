import type { SchemaTypeDefinition } from "sanity"

import { artistPage } from "./artistPage"

// Keep site-specific document types here; shared objects come from @repo/sanity-config.
export const siteSchemas: SchemaTypeDefinition[] = [artistPage]
