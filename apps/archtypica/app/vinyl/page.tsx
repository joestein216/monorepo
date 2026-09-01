"use client";

import React from 'react';
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { urlFor } from '../../sanity/lib/image'
import { useCartStore } from '../store/useCartStore';
import coverArtPlaceholder from '../assets/coverArtPlaceholder.png';

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

// Map Goldmine codes to a strict 8-point physical structural scale
const gradeMap: Record<string, { rank: number; display: string; desc: string }> = {
  'M':   { rank: 8, display: 'm',   desc: 'Mint - Perfect physical structure' },
  'NM':  { rank: 7, display: 'nm',  desc: 'Near Mint - Almost flawless' },
  'VG+': { rank: 6, display: 'vg+', desc: 'Very Good Plus - Minor structural wear' },
  'VG':  { rank: 5, display: 'vg',  desc: 'Very Good - Visible wear, structurally intact' },
  'G+':  { rank: 4, display: 'g+',  desc: 'Good Plus - Moderate structural defects' },
  'G':   { rank: 3, display: 'g',   desc: 'Good - Heavy wear and surface markings' },
  'F':   { rank: 2, display: 'f',   desc: 'Fair - Severe degradation' },
  'P':   { rank: 1, display: 'p',   desc: 'Poor - Drastic damage' },
  '0':   { rank: 0, display: '-',   desc: 'Not Graded' },
};

interface ConditionGaugeProps {
  grade: { rank: number, display: string, desc: string }
}

export function ConditionGauge({ grade }: ConditionGaugeProps) {
  const totalSteps = 8;

  return (
    <div 
      className=""
      aria-label={`Physical structural rating: ${grade.rank} out of 8. Grade code: ${grade.display}. ${grade.desc}`}
    >
      {/* 2. Geometric Shape Meter (Purely visual layout using hardware blocks) */}
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const isFilled = idx < grade.rank;
          return (
            <div
              key={idx}
              className={`h-2.5 w-5 rounded-sm border transition-all duration-200 ${
                isFilled
                  ? 'bg-zinc-300 border-zinc-400 shadow-sm' // Solid Geometric Block
                  : 'bg-transparent border-zinc-800'         // Clean Outline Box
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

const VinylCard = memo(function VinylCard({ vinyl }: { vinyl: VinylRecord }) {
  const { addItem } = useCartStore();
  const vinylMatch = vinyl.media_condition.match(/\(([^)]*)\)/)
  const sleeveMatch = vinyl.sleeve_condition.match(/\(([^)]*)\)/)

  const vinylGradeCode = vinylMatch ? vinylMatch[1] : '0'
  const sleeveGradeCode = sleeveMatch ? sleeveMatch[1] : '0' 

  const vinylGrade = gradeMap[vinylGradeCode] || { rank: 0, display: '-', desc: 'not graded' }
  const sleeveGrade = gradeMap[sleeveGradeCode] || { rank: 0, display: '-', desc: 'not graded' }

  return (
    <article className="rounded-xs border border-border bg-background p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col h-full">
        <div className="relative w-full aspect-square shadow-[0_4px_4px_-2px_rgba(0,0,0,0.70)]">
          {vinyl.coverArt ? (
            <Image
              src={urlFor(vinyl.coverArt).width(600).height(600).fit('crop').url()}
              alt={`discogs image ${vinyl.title}`}
              fill 
              className="object-cover"
            />
          ) : vinyl.coverArtMusicBrainz ? (
            <Image
              src={urlFor(vinyl.coverArtMusicBrainz).width(600).height(600).fit('crop').url()}
              alt={`cover art from MusicBrainz for ${vinyl.title}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="p-8">
              <Image
                src={coverArtPlaceholder}
                alt="no cover art available"
                width={300}
                height={300}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          )}
        </div>
        <h2 className="text-xl font-semibold text-foreground mt-2 mb-0">{vinyl.title}</h2>
        <h3 className="text-lg text-foreground mb-0">{vinyl.artist}</h3>
        <div className="text-md text-muted-foreground">
          <div>
            {vinyl.label}
          </div>
        </div>
        <div className="grid grid-cols-2 w-full">
          <div className="text-foreground justify-self-start">
            {vinyl.catno}
          </div>
          <div className="text-foreground justify-self-end">
            {vinyl.format}
          </div>
        </div>
        <div className="">
          {vinyl.comments ? <p className="text-xs text-muted-foreground">{vinyl.comments}</p> : null}
        </div>
        <div className="mt-auto w-full">
          <div className="grid grid-cols-3 mb-4 w-full items-center sm:grid-cols-[10%_80%_10%]">
            <div className="">
              <svg xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#555" 
                strokeWidth="2" 
                stroke-winecap="round" 
                strokeLinejoin="round" 
                className="lucide lucide-disc3-icon lucide-disc-3">
                <circle cx="12" cy="12" r="10"/>
                <path d="M6 12c0-1.7.7-3.2 1.8-4.2"/>
                <circle cx="12" cy="12" r="2"/><path d="M18 12c0 1.7-.7 3.2-1.8 4.2"/></svg>
            </div>
            <div>
              <ConditionGauge grade={vinylGrade}></ConditionGauge>
            </div>
            <div className="text-sm text-grey-400 justify-self-end">
              {vinylGrade.display}
            </div>
            <div className="">
              <svg xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#555" 
                stroke-width="2" 
                stroke-linecap="round" 
                strokeLinejoin="round" 
                className="lucide lucide-disc-album-icon lucide-disc-album">
                <rect width="18" height="18" x="3" y="3" rx="2"/>
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 12h.01"/>
              </svg>
            </div>
            <div>
              <ConditionGauge grade={sleeveGrade}></ConditionGauge>
            </div>
            <div className="text-sm text-grey-400 justify-self-end">
              {sleeveGrade.display}
            </div>
          </div>
          <div className="grid grid-cols-2 w-full">
            <div className="font-medium text-foreground justify-self-start">
                Price: ${vinyl.price.toFixed(2)}
            </div>
            <div className="font-medium justify-self-end">
              <button
                onClick={() => addItem({ id: vinyl._id, name: vinyl.title, price: vinyl.price * 100, quantity: 1 })}
                className="text-green-400">
                Add to Cart
              </button>
            </div>
          </div>
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
        <p className="mt-2 mb-4 max-w-4xl text-medium text-muted-foreground">
          Browse the the collection and become curator of some new sounds.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vinyls.map((vinyl) => (
            <VinylCard key={vinyl._id} vinyl={vinyl} />
          ))}
          {initialLoad && !vinyls.length && !loading && (
            <div className="rounded-3xl border border-border bg-background p-8 text-center text-sm text-muted-foreground">
              No records found.
            </div>
          )}
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
