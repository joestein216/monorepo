
export { metadata, viewport } from 'next-sanity/studio'
import React from 'react'
import { draftMode } from 'next/headers'
import {VisualEditing} from 'next-sanity/visual-editing'
import {SanityLive} from '../../sanity/lib/live'
import {DisableDraftMode} from '../../components/system/DisableDraftMode'

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isEnabled: isDraftMode } = await draftMode()

  return (
    <html lang="en">
      <body>
        {children}

        <SanityLive />
        {isDraftMode && (
          <>
            <VisualEditing />
            <DisableDraftMode />
          </>
        )}
      </body>
    </html>
  )
}