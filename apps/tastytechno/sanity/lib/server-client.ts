import 'server-only'

import {client} from './client'

// Backend work must never depend on preview cookies, stega, or a stale CDN read.
// This app's published dataset is public, so reads intentionally use no token.
// Private reads and mutations need a separate credential boundary when required.
export const serverClient = client.withConfig({
  token: undefined,
  perspective: 'published',
  stega: false,
  useCdn: false,
  maxRetries: 0,
})
