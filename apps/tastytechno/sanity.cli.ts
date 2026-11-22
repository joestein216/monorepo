import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
  typegen: {
    enabled: true,
    schema: 'schema.json',
    path: './{app,components,sanity,scripts}/**/*.{ts,tsx}',
    generates: 'sanity.types.ts',
    formatGeneratedCode: true,
    overloadClientMethods: true,
  },
})
