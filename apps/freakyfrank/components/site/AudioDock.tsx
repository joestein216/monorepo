"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { Mix } from "./types";
import { playerUrl, safeUrl } from "./media";

const AudioContext = createContext<{
  selected: Mix | null;
  select: (mix: Mix | null) => void;
} | null>(null);
export function AudioProvider({ children }: { children: ReactNode }) {
  const [selected, select] = useState<Mix | null>(null);
  const [failed, setFailed] = useState(false);
  const changeMix = (mix: Mix | null) => {
    setFailed(false);
    select(mix);
  };
  const embed = playerUrl(selected?.embedUrl);
  const stream = safeUrl(selected?.streamUrl);
  return (
    <AudioContext value={{ selected, select: changeMix }}>
      {children}
      <aside
        data-slot="audio-dock"
        aria-label="Persistent music player"
        data-active={Boolean(selected)}
      >
        <p role="status">
          {selected ? selected.title : "The underground, on repeat."}
        </p>
        {selected ? (
          <>
            <button
              type="button"
              onClick={() => changeMix(null)}
              aria-label="Close player and stop playback"
            >
              Close player
            </button>
            {stream ? (
              <audio
                key={stream}
                src={stream}
                controls
                autoPlay
                preload="none"
                onError={() => setFailed(true)}
              >
                Your browser does not support audio playback.
              </audio>
            ) : embed ? (
              <iframe
                key={selected._key}
                src={embed}
                title={`Audio player: ${selected.title}`}
                allow="autoplay; encrypted-media"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <p>Use the original listening link to play this set.</p>
            )}
            {failed && (
              <p role="alert">
                This stream couldn’t load. Try the original listening link.
              </p>
            )}
            {safeUrl(selected.sourceUrl) && (
              <a
                href={safeUrl(selected.sourceUrl)}
                target="_blank"
                rel="noreferrer"
              >
                Open original player
              </a>
            )}
          </>
        ) : (
          <a href="/mixes">Explore the mixes</a>
        )}
      </aside>
    </AudioContext>
  );
}
export function PlayMix({ mix }: { mix: Mix }) {
  const context = useContext(AudioContext);
  if (!context) throw new Error("PlayMix requires AudioProvider");
  const active = context.selected?._key === mix._key;
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`Load ${mix.title || "mix"} in the audio player`}
      disabled={!playerUrl(mix.embedUrl) && !safeUrl(mix.streamUrl)}
      onClick={() => context.select(mix)}
    >
      {active ? "Loaded in player" : "Listen to set"}
    </button>
  );
}
