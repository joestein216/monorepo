// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import 'server-only'
import {defineLive} from 'next-sanity/live'
import {client} from './client'
import {readToken} from './token'

export const {sanityFetch, SanityLive} = defineLive({
  client,
  serverToken: readToken,
  // Published updates remain live. Draft edits require a refresh until a relay
  // is justified; the read token never travels to a preview browser.
  browserToken: false,
})
