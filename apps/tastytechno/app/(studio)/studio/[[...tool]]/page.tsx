// src/app/studio/[[...tool]]/page.tsx
import { StudioClient } from './StudioClient'

// Force dynamic rendering to prevent Next.js from statically optimizing the admin route
export const dynamic = 'force-dynamic'

export default function StudioPage() {
  return <StudioClient />
}
