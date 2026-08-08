import { defineConfig, type SchemaTypeDefinition } from "sanity"
import { structureTool } from "sanity/structure"
import { visionTool } from '@sanity/vision'
import { presentationTool } from 'sanity/presentation'
import { coreSchemas } from "./schemas"

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
      structureTool({
        structure: (structure) =>
          structure
            .list()
            .title("Content")
            .items([
              structure
                .listItem()
                .id("siteSettings")
                .title("Site Settings")
                .child(
                  structure
                    .document()
                    .schemaType("siteSettings")
                    .documentId("siteSettings"),
                ),
              structure.divider(),
              ...structure
                .documentTypeListItems()
                .filter((item) => item.getId() !== "siteSettings"),
            ]),
      }),
      // VPresentation tool is typically included for developers to preview content in a presentation format
      presentationTool,
      // Vision tool is typically included for developers to test GROQ queries safely
      visionTool({
        // Optional configuration: Restrict to specific datasets or default query
        defaultApiVersion: '2026-08-05',
        defaultDataset: 'development'
      })
    ],
  })
}
