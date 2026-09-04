import { SanityDocument } from '@sanity/client'

export type DiscogsSearchFilters = {
  barcode?: string,
  catno?: string,
  query?: string,
}

export type DiscogsSearchResults = {
    id: string,
    title: string,
    year: string | 'N/A',
    thumb: string | '',
    catno: string | 'N/A',
    barcode: string | [],
    type: 'master' | 'release',
}

// Low-level pure wrapper for single target executions
export async function executeDiscogsSearch(filters: DiscogsSearchFilters): Promise<DiscogsSearchResults[]> {
  const discogsSearchBase = 'https://api.discogs.com/database/search?'
  const params = new URLSearchParams()
  
  if (filters.barcode) params.append('barcode', filters.barcode)
  if (filters.catno) params.append('catno', filters.catno)
  if (filters.query) params.append('q', filters.query)

  const response = await fetch(`${discogsSearchBase}${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Discogs token=${process.env.DISCOGS_PERSONAL_TOKEN}`,
      'User-Agent': 'TastyTechnoVinylSync/1.0 +https://tastytechno.com',
    },
  });

  console.log(response)
  if (!response.ok) throw new Error(`Status ${response.status}`)
  const data = await response.json()

  return data.results?.map((item: DiscogsSearchResults) => (
    <DiscogsSearchResults>{
      id: item.id,
      title: item.title,
      year: item.year || 'N/A',
      thumb: item.thumb || '',
      catno: item.catno || 'N/A',
      barcode: item.barcode || [],
      type: item.type, // 'release' or 'master'
    })) || []
}

export async function pushToDiscogsMarketplace(record: SanityDocument): Promise<{ success: boolean; listingId?: string; error?: string }> {
  try {
    const discogsListingsUrl = 'https://api.discogs.com/marketplace/listings'

    // 2. Dispatch payload
    const response = await fetch(discogsListingsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Discogs token=${process.env.DISCOGS_PERSONAL_TOKEN}`,
        'User-Agent': 'TastyTechnoVinylSync/1.0 +https://tastytechno.com',
      },
      body: JSON.stringify({
        release_id: Number(record.release_id),
        condition: record.media_condition,
        sleeve_condition: record.sleeve_condition,
        price: Number(record.price),
        comments: record.comments,
        allow_offers: Boolean(record.accept_offer),
        status: record.status,
        external_id: record.external_id,
        location: record.location,
        weight: record.weight,
        format_quantity: record.format_quantity,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Discogs API rejected upload' };
    }

    return { success: true, listingId: data.listing_id };
  } catch (err: unknown) {
    let errorMessage: string;

    if (err instanceof Error) {
      // Handles generic or unexpected standard runtime errors
      errorMessage = `Error: ${err.message}`;
    } else {
      // Fallback for edge cases where a string or raw object was thrown
      errorMessage = `Unknown error occurred.`
    }
    return { success: false, listingId: undefined, error: errorMessage }
  }
}
