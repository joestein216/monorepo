import imageUrlBuilder from '@sanity/image-url'

// Replace with your actual Sanity configuration
const clientConfig = {
  projectId: 'your_project_id', 
  dataset: 'production',
}

const builder = imageUrlBuilder(clientConfig)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source)
}
