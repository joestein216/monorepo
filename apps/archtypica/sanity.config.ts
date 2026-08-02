'use client'

import {
  createStudioConfig,
  requireEnvironmentVariable,
} from "@repo/sanity-config"

import { siteSchemas } from "./sanity/schemas"

const projectId = requireEnvironmentVariable(
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
)
const dataset = requireEnvironmentVariable(
  "NEXT_PUBLIC_SANITY_DATASET",
  process.env.NEXT_PUBLIC_SANITY_DATASET,
)

export default createStudioConfig({
  name: "archtypica-studio",
  title: "Archtypica Studio",
  projectId,
  dataset,
  schemaTypes: siteSchemas,
})
