import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { coreSchemas } from '@repo/sanity-config'

export default defineConfig({
  name: 'luffphoto-studio',
  title: 'Luffphoto Workspace',

  // Use the unique keys provided via your local app env settings
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'evjxcrhnmedyypjzpitn',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  // This matches your App Router dashboard folder path layout
  basePath: '/studio',

  // 1. Inherit your shared core structural schema definitions
  schema: {
    types: coreSchemas,
  },

  // 2. Add workflow plugins specific to just this site's editors
  plugins: [structureTool()],
})
