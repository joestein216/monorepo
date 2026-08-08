import { defineConfig, type SchemaTypeDefinition } from "sanity"
import { coreSchemas } from "./schemas"
import { structureTool } from "sanity/structure"
import { visionTool } from '@sanity/vision'
import { presentationTool } from 'sanity/presentation'

export type StudioConfigOptions = {
  name: string
  title: string
  projectId: string
  dataset: string
  basePath?: string
  schemaTypes?: SchemaTypeDefinition[],
}

export function createStudioConfig({
  name,
  title,
  projectId,
  dataset,
  basePath = "/studio",
  schemaTypes = [],
}: StudioConfigOptions) {
  return defineConfig({
    name,
    title,
    projectId,
    dataset,
    basePath,
    schema: {
      types: [...coreSchemas, ...schemaTypes],
    },
    plugins: [
      structureTool(),
      presentationTool({
        previewUrl: {
          initial: process.env.SANITY_STUDIO_PREVIEW_URL,
          previewMode: {
            enable: '/api/draft-mode/enable',
            disable: '/api/draft-mode/disable',
          },
        },
        allowOrigins: [
          'http://localhost:*',
          'https://staging.my-site.com',
          'https://my-site.com',
        ],
      }),
      visionTool({
        defaultApiVersion: '2026-08-05',
        defaultDataset: 'development',
      })
    ],
  })
}
