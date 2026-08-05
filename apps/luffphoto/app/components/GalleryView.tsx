// GalleryView.tsx
import NextImage from 'next/image';
import { type SanityImage } from '../../sanity/types'; // Import the SanityImage type

interface GalleryProps {
  images: SanityImage[];
}

export default function GalleryView({ images }: GalleryProps) {
  if (!images || images.length === 0) return <p>No images inside this gallery.</p>

  return (
    /* 
      1. grid-rows-[auto] handles unpredictable cell sizes.
      2. gap-y-2 works elegantly with grid-row-start variations.
    */
    <div className="columns-1 sm:columns-2 md:columns-3 gap-4 [column-fill:_balance] w-full">
      {images?.map((image) => {
        // Fallback dimensions if metadata query isn't explicitly grabbed
        const width = image.asset?.metadata?.dimensions?.width || 600
        const height = image.asset?.metadata?.dimensions?.height || 800

        const aspectRatio = width / height

        return (
          <figure 
            key={image._key} 
            className="break-inside-avoid group pb-4 flex flex-col"
          >
            <div 
              className="relative w-full rounded-xs overflow-hidden bg-gray-400 shadow-2xl transition group-hover:shadow-2xl"
              // CHANGE 4: Use inline styles to give the container the exact image aspect ratio
              style={{ aspectRatio: `${aspectRatio}` }}
            >
              <NextImage
                src={image.asset._id}
                alt={image.alt || 'Gallery photo'}
                // CHANGE 5: Pass the sizing logic to the browser for your columns
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
            {image.caption && (
              <figcaption className="text-xs text-gray-500 mt-1 px-1">
                {image.caption}
              </figcaption>
            )}
          </figure>
        )
    })}
    </div>
  )
}
