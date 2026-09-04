// src/app/api/discogs/smart-search/route.ts
import { NextResponse } from 'next/server'
import { executeDiscogsSearch } from '../../../services/discogs'
import { type DiscogsSearchFilters, type DiscogsSearchResults } from '../../../services/discogs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerms = searchParams.get('searchTerms')?.trim() || ''

  if (!searchTerms) {
    return NextResponse.json({ success: true, results: [], plan: 'empty' })
  }

  // 1. REGEX IDENTIFICATION RULES
  const isBarcode = /^\d{10,14}$/.test(searchTerms.replace(/[-\s]/g, ''))
  // Cats often look like letters + numbers (e.g., PC 33235, XL120, rough001)
  const isCatNo = /^[A-Z0-9-\s.]{3,15}$/i.test(searchTerms) && /\d/.test(searchTerms) && /[A-Z]/i.test(searchTerms)

  try {
    // --- PLAN STEP A: Strict Barcode Match ---
    if (isBarcode) {
      const cleanBarcode = searchTerms.replace(/[-\s]/g, '')
      const results: DiscogsSearchResults[] = await executeDiscogsSearch(<DiscogsSearchFilters>{ barcode: cleanBarcode })

      // Filter to only return actual releases, skipping generic master templates if needed
      const filteredResults = results.filter((r: DiscogsSearchResults) => r.type === 'release');

      if (filteredResults.length > 0) {
        return NextResponse.json({ 
          success: true, 
          results: filteredResults, 
          plan: 'Strict Barcode Match' })
      }
    }

    // --- PLAN STEP B: Strict Catalog Number Match ---
    if (isCatNo) {
      const results = await executeDiscogsSearch(<DiscogsSearchFilters>{ catno: searchTerms });

      // Filter to only return actual releases, skipping generic master templates if needed
      const filteredResults = results.filter((r: DiscogsSearchResults) => r.type === 'release');

      if (results.length > 0) {
        return NextResponse.json({ 
          success: true, 
          results: filteredResults, 
          plan: 'Strict Catalog Number Match' });
      }
    }

    // --- PLAN STEP C: Fallback to Broad Keyword Match ---
    // If it wasn't a strict format, or strict checks found nothing, search globally
    const results: DiscogsSearchResults[] = await executeDiscogsSearch(<DiscogsSearchFilters>{ query: searchTerms });

    // Filter to only return actual releases, skipping generic master templates if needed
    const filteredResults = results.filter((r: DiscogsSearchResults) => r.type === 'release');
    
    return NextResponse.json({ 
      success: true, 
      results: filteredResults, 
      plan: 'Broad Keyword Fallback' 
    });

  } catch (err: unknown) {
    let errorMessage: string;

    if (err instanceof Error) {
      // Handles generic or unexpected standard runtime errors
      errorMessage = `Error: ${err.message}`;
      return new Response(errorMessage, { status: 500 });
    } else {
      // Fallback for edge cases where a string or raw object was thrown
      errorMessage = `Unknown error occurred.`
    }
    return new Response(errorMessage, { status: 500 });
  }
}
