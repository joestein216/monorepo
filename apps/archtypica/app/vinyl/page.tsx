"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { urlFor } from '../../sanity/lib/image'
import { useCartStore } from '../store/useCartStore';

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
  coverArtSource: string;
  musicbrainzId: string;
  coverArtMusicBrainz: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
  };
}

interface RecordsResponse {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  vinyls: VinylRecord[];
}

const PAGE_LIMIT = 24;

const VinylCard = memo(function VinylCard({ vinyl }: { vinyl: VinylRecord }) {
  const { addItem } = useCartStore();
  return (
    <article className="rounded-3xl border border-border bg-background p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{vinyl.title}</h2>
          <p className="text-sm text-muted-foreground">{vinyl.artist}</p>
          {/* Simple, non-dynamic image rendering */}
          {vinyl.coverArt && (
            <Image 
              src={urlFor(vinyl.coverArt).url()} 
              alt={`discogs image ${vinyl.title}`}
              width={300}
              height={300}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          )}
          {vinyl.coverArtMusicBrainz && (
            <Image 
              src={urlFor(vinyl.coverArtMusicBrainz).url()} 
              alt={`musicbrainz image ${vinyl.title}`}
              width={300}
              height={300}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          )}
          {!vinyl.coverArt && !vinyl.coverArtMusicBrainz && (
            <div className="flex h-48 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              No Cover Art from Discogs or MusicBrainz
            </div>
          )}
        </div>
        <div className="grid gap-1 text-sm text-muted-foreground">
          <p>Label: {vinyl.label}</p>
          <p>Cat No: {vinyl.catno}</p>
          <p>Format: {vinyl.format}</p>
          <p>Release ID: {vinyl.release_id}</p>
          <p>Weight: {vinyl.weight}g</p>
          <p>Media: {vinyl.media_condition} / Sleeve: {vinyl.sleeve_condition}</p>
          <p className="font-medium text-foreground">Price: ${vinyl.price.toFixed(2)}</p>
          {vinyl.comments ? <p className="text-xs text-muted-foreground">{vinyl.comments}</p> : null}
          <button
            onClick={() => addItem({ id: vinyl._id, name: vinyl.title, price: vinyl.price * 100, quantity: 1 })}
            className="text-xs text-green-500 hover:underline mt-1"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
});

VinylCard.displayName = "VinylCard";

export default function VinylPage() {
  const [vinyls, setVinyls] = useState<VinylRecord[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(
    async (pageToLoad: number) => {
      if (loading || !hasMore) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/vinyl/records?page=${pageToLoad}&limit=${PAGE_LIMIT}`);
        if (!response.ok) {
          throw new Error("Failed to load vinyl records.");
        }

        const result = (await response.json()) as RecordsResponse;
        setVinyls((current) => (pageToLoad === 1 ? result.vinyls : [...current, ...result.vinyls]));
        setHasMore(result.hasMore);
        setPage(result.page);
        setInitialLoad(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load records.");
      } finally {
        setLoading(false);
      }
    },
    [hasMore, loading],
  );

  useEffect(() => {
    if (!sentinelRef.current || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          loadPage(page + 1);
        }
      },
      {
        rootMargin: "240px",
        threshold: 0.1,
      },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadPage, loading, page]);

  return (      
      <section>
        <h1 className="text-2xl tracking-tight mt-0">Our Vinyl Records</h1>
        <p className="mt-2 mb-4 max-w-2xl text-medium text-muted-foreground">
          Browse the the collection and become curator of some new sounds.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vinyls.map((vinyl) => (
            <VinylCard key={vinyl._id} vinyl={vinyl} />
          ))}
          {initialLoad && !vinyls.length && !loading ? (
            <div className="rounded-3xl border border-border bg-background p-8 text-center text-sm text-muted-foreground">
              No records found.
            </div>
          ) : null}

          <div className="mt-10 flex flex-col items-center justify-center gap-2 py-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading more records…</p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : !hasMore ? (
              <p className="text-sm text-muted-foreground">You’ve reached the end of the collection.</p>
            ) : (
              <p className="text-sm text-muted-foreground">Scroll for more records.</p>
            )}
          </div>

          <div ref={sentinelRef} className="h-1" aria-hidden="true" />
        </div>
      </section>
  );
}
