// src/app/studio/[[...tool]]/StudioClient.tsx
'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config2' // Path to your sanity config

export function StudioClient() {
  return <NextStudio config={config} />
}
