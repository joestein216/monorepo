import type { SchemaTypeDefinition } from "sanity"

import { linkSchema } from "./link"
import { navigationItemSchema } from "./navigationItem"
import { portableTextSchema } from "./portableText"
import { seoSchema } from "./seo"
import { siteSettingsSchema } from "./siteSettings"

export const coreSchemas: SchemaTypeDefinition[] = [
  linkSchema,
  navigationItemSchema,
  portableTextSchema,
  seoSchema,
  siteSettingsSchema,
]

export {
  linkSchema,
  navigationItemSchema,
  portableTextSchema,
  seoSchema,
  siteSettingsSchema,
}
