import type { SchemaTypeDefinition } from "sanity"
import vinylRecord from './vinylRecord'

// Keep site-specific document types here; shared objects come from @repo/sanity-config.
export const siteSchemas: SchemaTypeDefinition[] = [vinylRecord]
