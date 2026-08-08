// imageUrlBuilder.ts
import imageUrlBuilder, {type SanityImageSource} from '@sanity/image-url'
import { client } from '../client' // your sanity client config

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
