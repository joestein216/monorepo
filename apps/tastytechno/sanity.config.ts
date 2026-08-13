import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {schema} from './schemaTypes'
import {resolve} from './sanity/presentation/resolve'

export default defineConfig({
  name: "tastytechno-studio",
  title: 'Tasty Techno',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '5sak3amq',
  dataset: process.env.SANITY_STUDIO_DATASET || 'development',
  basePath: "/studio",
  plugins: [
    structureTool(),
    presentationTool({
      resolve,
      previewUrl: {
        origin: 'http://localhost:3004',
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
    visionTool()],
  schema
})
