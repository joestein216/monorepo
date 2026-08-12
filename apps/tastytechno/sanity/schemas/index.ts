import type { SchemaTypeDefinition } from "sanity"

import { artistPage } from "./artistPage"
import { event } from "./event"
import { homePage } from "./homePage"
import { photo } from "./photo"
import { photoAlbum } from "./photoAlbum"

// Keep site-specific document types here; shared objects come from @repo/sanity-config.
export const siteSchemas: SchemaTypeDefinition[] = [artistPage, event, photo, photoAlbum, homePage]
