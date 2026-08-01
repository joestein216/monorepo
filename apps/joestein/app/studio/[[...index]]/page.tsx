'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../sanity.config' // Verifies the file at apps/joestein/sanity.config.ts

export default function StudioPage() {
  return <NextStudio config={config} />
}
