// src/app/master-lister/page.tsx (Partial Update for Side-Panel Sidebar)
'use client';

import { useState } from 'react';
import { type DiscogsSearchResults } from '../../services/discogs'

export default function MasterListerPage() {
  const [releaseId, setReleaseId] = useState('');
  const [smartInput, setSmartInput] = useState('');
  const [searchResults, setSearchResults] = useState<DiscogsSearchResults[]>([]);
  const [currentPlan, setCurrentPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSmartSearch = async () => {
    if (!smartInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/discogs-smart-search?searchTerms=${encodeURIComponent(smartInput)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
        setCurrentPlan(data.plan);
        
        // AUTO-CONFIRM RULE: If exactly 1 result drops, auto-select it immediately!
        if (data.results.length === 1) {
          setReleaseId(String(data.results[0].id));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      
      {/* Main Left Form Layout stays normal */}
      <main className="w-1/2 p-8 border-r border-zinc-800">
        <h1 className="text-xl font-bold mb-4">Master Lister Dashboard</h1>
        <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
          <p className="text-xs text-zinc-400">Active Bound ID:</p>
          <p className="text-2xl font-mono text-amber-400 font-bold">{releaseId || 'NONE SELECTED'}</p>
        </div>
      </main>

      {/* RIGHT SIDE PANEL: Interactive Matching Engine */}
      <aside className="w-1/2 bg-zinc-900/30 p-6 flex flex-col h-screen overflow-y-auto">
        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
          Intelligent Matching Router
        </h2>
        
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={smartInput}
            onChange={(e) => setSmartInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
            placeholder="Drop Barcode, Catalog Number, or Album Text here..."
            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm focus:outline-none focus:border-amber-500"
          />
          <button onClick={handleSmartSearch} className="px-4 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded text-sm">
            {loading ? '...' : 'Route'}
          </button>
        </div>

        {currentPlan && (
          <p className="text-[10px] font-mono text-zinc-500 mb-4">
            Routing Engine Plan Executed: <span className="text-zinc-300 font-semibold">{currentPlan}</span>
          </p>
        )}

        {/* INTERACTIVE MODE A: Perfect Auto-Match Callout */}
        {searchResults.length === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <div 
              key={searchResults[0].id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between hover:border-amber-500/50 transition relative overflow-hidden group"
            >
              <div className="space-y-2">
                {/* Big Square Aspect-Ratio Image Container */}
                <div className="aspect-square w-full relative bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800">
                  {searchResults[0].thumb ? (
                    <img src={searchResults[0].thumb} alt="" className="object-cover w-full h-full group-hover:scale-105 transition duration-200" />
                  ) : (
                    <span className="text-[10px] text-zinc-600">No Image</span>
                  )}
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-bold text-zinc-100 line-clamp-2">{searchResults[0].title}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">Cat: {searchResults[0].catno}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">Year: {searchResults[0].year}</p>
                </div>
              </div>

              {/* Decision Action Buttons */}
              <div className="flex gap-2 mt-4 pt-2 border-t border-zinc-800/60">
                <button 
                  onClick={() => setReleaseId(String(searchResults[0].id))}
                  className="flex-1 py-1 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded text-[11px] text-center transition"
                >
                  ✓ Match
                </button>
              </div>
            </div>
            <button onClick={() => { setSearchResults([]); setSmartInput(''); }} className="text-xs text-zinc-400 underline hover:text-zinc-200">
              Clear & search again
            </button>
          </div>
        )}

        {/* INTERACTIVE MODE B: Side-by-Side Visual Decision Board */}
        {searchResults.length > 1 && (
          <div className="space-y-4">
            <p className="text-xs text-amber-400 font-semibold">⚠️ Multi-Match Decision Required. Choose the matching profile:</p>
            
            {/* Horizontal Flex Grid for comparison visual layout */}
            <div className="grid grid-cols-2 gap-4">
              {searchResults.map((release) => (
                <div 
                  key={release.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between hover:border-amber-500/50 transition relative overflow-hidden group"
                >
                  <div className="space-y-2">
                    {/* Big Square Aspect-Ratio Image Container */}
                    <div className="aspect-square w-full relative bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800">
                      {release.thumb ? (
                        <img src={release.thumb} alt="" className="object-cover w-full h-full group-hover:scale-105 transition duration-200" />
                      ) : (
                        <span className="text-[10px] text-zinc-600">No Image</span>
                      )}
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-zinc-100 line-clamp-2">{release.title}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">Cat: {release.catno}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">Year: {release.year}</p>
                    </div>
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-2 border-t border-zinc-800/60">
                    <button 
                      onClick={() => setReleaseId(String(release.id))}
                      className="flex-1 py-1 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded text-[11px] text-center transition"
                    >
                      ✓ Match
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && !loading && (
          <div className="text-center py-20 text-zinc-600 text-xs font-mono">
            System Idle. Standby for input stream.
          </div>
        )}
      </aside>

    </div>
  );
}
