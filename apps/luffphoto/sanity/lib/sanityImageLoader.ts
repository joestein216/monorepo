export default function sanityImageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // 1. Define your environment constants (Replace with your actual keys or process.env variables)
  const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;

  // 2. Remove the "image-" prefix from the string
  const cleanId = src.replace(/^image-/, '');

  // 3. Find the final dash separating the file format (e.g., "-jpg" or "-png")
  const lastDashIndex = cleanId.lastIndexOf('-');
  
  if (lastDashIndex === -1 && PROJECT_ID && DATASET) {
    // Fallback if the string format is unexpected
    return `https://sanity.io/${PROJECT_ID}/${DATASET}/${cleanId}?w=${width}&q=${quality || 75}&fit=max&auto=format`;
  }

  // 4. Split into the asset body and the file extension type
  const baseAsset = cleanId.substring(0, lastDashIndex);
  const extension = cleanId.substring(lastDashIndex + 1);

  // 5. Construct the proper CDN base path
  const cdnUrl = `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${baseAsset}.${extension}`;

  // 6. Return the optimized URL parameters
  return `${cdnUrl}?w=${width}&q=${quality || 75}&fit=max&auto=format`;
}
