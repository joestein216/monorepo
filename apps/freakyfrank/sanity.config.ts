import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {schema} from './schemaTypes'
import {resolve} from './sanity/presentation/resolve'

export default defineConfig({
  name: "freakyfrank-studio",
  title: 'Freaky Frank',
  basePath: '/studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'e6kdq235',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'development',
  plugins: [
    structureTool(),
    presentationTool({
      resolve,
      previewUrl: {
        origin: process.env.NEXT_PUBLIC_STUDIO_URL || 'http://localhost:3005',
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
    visionTool()],
  schema: {
    types: schema.types,
  },
})
