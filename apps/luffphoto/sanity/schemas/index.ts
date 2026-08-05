import type { SchemaTypeDefinition } from "sanity"
import { photoGallery } from "./photoGallery"

// Keep site-specific document types here; shared objects come from @repo/sanity-config.
export const siteSchemas: SchemaTypeDefinition[] = [photoGallery]
