import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schema} from './schemaTypes'

export default defineConfig({
  name: "tastytechno-studio",
  title: 'Tasty Techno',

  projectId: '5sak3amq',
  dataset: 'development',

  basePath: "/studio2",

  plugins: [structureTool(), visionTool()],

  schema
})
