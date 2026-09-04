// src/app/api/webhooks/vinyl-record-created/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { createClient } from "next-sanity";
import { pushToDiscogsMarketplace } from '../../../services/discogs';

function getClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim();

  if (!projectId || !dataset) {
    throw new Error("Sanity project ID and dataset must be configured.");
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: "2026-08-07",
    perspective: "published",
    useCdn: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validate that the request actually came from Sanity using your secret
    const { isValidSignature, body } = await parseBody<{ _type: string; _id: string }>(
      req,
      process.env.SANITY_WEBHOOK_SECRET
    );

    if (!isValidSignature) {
      console.error('❌ Webhook verification failed: Invalid signature');
      return new Response('Invalid signature', { status: 401 });
    }

    if (!body?._id) {
      return NextResponse.json({ error: 'Missing documentId' }, { status: 400 });
    }

    const client = getClient();

    // 1. Fetch fresh document state
    const record = await client.fetch(`*[_id == $id][0]`, { id: body._id });

    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // 2. Fire the Discogs Service
    const discogsResult = await pushToDiscogsMarketplace(record);

    // 3. Handle errors or update Sanity with the new listing ID
    if (!discogsResult.success) {
      console.error(`❌ Discogs Sync Failed for ${body._id}:`, discogsResult.error);
      // Optional: Update Sanity doc with a "failed" status badge or text
      return NextResponse.json({ success: false, error: discogsResult.error }, { status: 500 });
    }

    console.log(`✅ Success! Discogs Listing ID: ${discogsResult.listingId}`);
    return NextResponse.json({ success: true, listingId: discogsResult.listingId });

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
