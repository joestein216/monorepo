import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Keep editorial text editable, but never encode values used as URLs, identifiers,
// dates, or behavior selectors. Backend jobs use server-client.ts (stega: false).
const technicalFields = new Set([
  '_id', '_key', '_ref', '_type', 'current', 'href', 'url', 'eventUrl',
  'sourceUrl', 'embedUrl', 'externalUrl', 'bookingEmail', 'inquiryEmail',
  'artistBookingEmail', 'startsAt', 'endsAt', 'eventDate', 'status', 'provider',
])

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
  stega: {
    enabled: true,
    studioUrl: process.env.NEXT_PUBLIC_STUDIO_URL || 'http://localhost:3004/studio',
    filter: (props) => {
      const field = props.sourcePath.at(-1)
      if (typeof field === 'string' && technicalFields.has(field)) return false
      return props.filterDefault(props)
    },
  },
})
