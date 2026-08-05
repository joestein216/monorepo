import { NextRequest, NextResponse } from "next/server";
import { createClient } from "next-sanity";

interface VinylRecord {
  _id: string;
  listing_id: number;
  artist: string;
  title: string;
  label: string;
  catno: string;
  format: string;
  release_id: number;
  price: number;
  comments: string;
  media_condition: string;
  sleeve_condition: string;
  external_id: string;
  weight: number;
  coverArt: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
  };
}

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 64;

function getClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim();

  if (!projectId || !dataset) {
    throw new Error("Sanity project ID and dataset must be configured.");
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: "2026-08-02",
    perspective: "published",
    useCdn: true,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") ?? String(DEFAULT_LIMIT)), 1),
      MAX_LIMIT,
    );

    const offset = (page - 1) * limit;

    const client = getClient();

    const vinyls = await client.fetch<VinylRecord[]>(
      `*[_type == "vinylRecord" && defined(coverArt)] | order(listing_id asc)[${offset}...${offset + limit}] {
        _id,
        listing_id,
        artist,
        title,
        label,
        catno,
        format,
        release_id,
        price,
        comments,
        media_condition,
        sleeve_condition,
        external_id,
        weight,
        coverArt
      }`,
    );

    const total = await client.fetch<number>(
      'count(*[_type == "vinylRecord"])',
    );

    return NextResponse.json({
      page,
      limit,
      total,
      hasMore: offset + vinyls.length < total,
      vinyls,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load vinyl records.",
      },
      { status: 500 },
    );
  }
}
