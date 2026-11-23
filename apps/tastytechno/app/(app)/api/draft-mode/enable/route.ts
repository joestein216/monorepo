import {client} from '../../../../../sanity/lib/client'
import {defineEnableDraftMode} from 'next-sanity/draft-mode'
import {readToken} from '../../../../../sanity/lib/token'
export const {GET} = defineEnableDraftMode({
  client: client.withConfig({
    token: readToken
  }),
})
