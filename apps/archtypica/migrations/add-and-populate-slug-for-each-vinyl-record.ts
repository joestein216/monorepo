import { defineMigration, at, setIfMissing } from 'sanity/migrate'
import slugify from 'slugify'

// 2. Pure SEO Slug Generator Function (Max 50 Chars)
function generateSeoSlug(artist: string, title: string, releaseId: number | string): string {
  const MAX_LEN = 50;
  
  // Clean text: lowercase, removes punctuation, replaces spaces with hyphens
  const clean = (text: string) => 
    slugify(text, { lower: true, strict: true, trim: true });

  const cleanArtist = clean(artist);
  const cleanTitle = clean(title);
  const strId = String(releaseId);

  // Overhead = ID length + 2 joining hyphens (artist-title-id)
  const overhead = strId.length + 2;
  const availableSpace = MAX_LEN - overhead;

  // Fallback for extreme edge cases
  if (availableSpace < 6) {
    return `${cleanArtist.slice(0, 5)}-${cleanTitle.slice(0, 5)}-${strId}`.replace(/-+/g, '-');
  }

  // 40% Artist / 60% Title Allocation
  const artistBudget = Math.floor(availableSpace * 0.40);
  let titleBudget = availableSpace - artistBudget;

  let finalArtist = '';
  let finalTitle = '';

  // Distribute budgets and pass leftovers to the other field
  if (cleanArtist.length <= artistBudget) {
    const leftover = artistBudget - cleanArtist.length;
    titleBudget += leftover;
    finalArtist = cleanArtist;
  } else {
    finalArtist = cleanArtist.slice(0, artistBudget).replace(/-$/, '');
  }

  if (cleanTitle.length <= titleBudget) {
    if (cleanArtist.length > artistBudget) {
      const leftover = titleBudget - cleanTitle.length;
      finalArtist = cleanArtist.slice(0, artistBudget + leftover).replace(/-$/, '');
    }
    finalTitle = cleanTitle;
  } else {
    finalTitle = cleanTitle.slice(0, titleBudget).replace(/-$/, '');
  }

  // Combine and safe-strip double hyphens
  const slug = `${finalArtist}-${finalTitle}-${strId}`;
  return slug.replace(/-+/g, '-');
}


export default defineMigration({
  title: 'Generate slugs for vinylRecord documents',
  documentTypes: ["vinylRecord"],
  migrate: {
    document (doc) {
      // Fallbacks prevent the script from crashing if fields are empty on older records
      const artist = doc.artist ? `${doc.artist}` : `${Math.random().toString(36).slice(2, 8)}`
      const title = doc.title ? `${doc.title}` : `${Math.random().toString(36).slice(2, 8)}`
      const release_id = doc.release_id ? `${doc.release_id}` : `${Math.random().toString(36).slice(2, 8)}`

      const generatedSlug = generateSeoSlug(artist, title, release_id)

      // Sanity slugs must be saved as an object containing '_type' and 'current'
      return [
        at('slug', setIfMissing({
          _type: 'slug',
          current: generatedSlug
        }))
      ]
    }
  }
})
