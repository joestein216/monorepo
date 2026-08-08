// app/gallery/page.tsx
import { client } from '../../sanity/client' // your sanity client config
import {type SanityImage} from '../../sanity/types' // your SanityImage type
import GalleryView from '../components/GalleryView'

// 1. Define the shape of your specific query response
interface GalleryResponse {
  title: string;
  images: SanityImage[]; 
}

async function getGalleryData() {
  // Use the -> operator to drill into the referenced image asset data
  const query = `*[_type == "photoGallery" && title == "Universal Gallery"][0]{
    title,
    images[]{
      _key,
      _type,
      alt,
      caption,
      asset->{
        _id,
        _ref,
        _type,
        metadata {
          dimensions {
            aspectRatio,
            width,
            height
          }
        },
        url,
      },
      hotspot,
      crop,
    }
  }`
  
  return await client.fetch<GalleryResponse>(query)
}

export default async function GalleryPage() {
  const gallery = await getGalleryData()

  if (!gallery) return <p className="p-8">Gallery not found</p>

  return (
    <main className="max-w-9xl p-6">
      <h1 className="text-3xl font-bold mb-8">{gallery.title}</h1>
      <GalleryView images={gallery.images} />
    </main>
  )
}
