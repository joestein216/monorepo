import {client} from '../../../../../sanity/lib/client'
import {defineEnableDraftMode} from 'next-sanity/draft-mode'
export const {GET} = defineEnableDraftMode({
  client: client.withConfig({
    token: process.env.SANITY_API_READ_TOKEN || 'sk5WQcAD2kUNR2u0X9fLbcmeRr1c6BqOnV476F8pXGggwMK6nDFqjZ0RR7OYDe4uaLRZlIlp8qYQpqw4450CWVMr28Gm4raRTjj2DsmlWaAfEbh3ZroGLgQLfXuP192xV1VKysUJ3cVTYxHwL97Od3TnUhrdEwgCoJAyf8o4FQTzjhD4eCVK'
  }),
})