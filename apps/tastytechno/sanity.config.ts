import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {schema} from './schemaTypes'
import {BackstageTool, canUseBackstage} from './sanity/tools/backstage/BackstageTool'
import {structure} from './sanity/structure'
import {resolve} from './sanity/presentation/resolve'

export default defineConfig({
  name: "tastytechno-studio",
  title: 'Tasty Techno',
  basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '5sak3amq',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'development',
  plugins: [
    structureTool({structure}),
    presentationTool({
      resolve,
      previewUrl: {
        initial: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3004',
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
    visionTool()],
  tools: (previous, {currentUser}) => canUseBackstage(currentUser)
    ? [...previous, {name: 'backstage', title: 'Backstage', component: BackstageTool}]
    : previous,
  schema: {
    ...schema,
    templates: (previous) => previous.filter((template) => template.schemaType !== 'backstageBoard'),
  },
  document: {
    actions: (previous, {schemaType}) => schemaType === 'backstageBoard'
      ? previous.filter((action) => !['duplicate', 'delete', 'unpublish'].includes(action.action || ''))
      : previous,
  },
})
