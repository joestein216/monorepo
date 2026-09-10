"use client"

import React, { useEffect, useState } from "react"
import { ArtistQueryResult } from "../../../sanity.types"
import { type SanityImageValue, getSiteImageUrl } from "../../../sanity/queries/image"
import { SanityImage } from "../site/sanity-image"
import { Download, Headphones, Calendar, Video, ArrowDown, ArrowUp, Handshake } from "lucide-react"
import MessageForm from "../../components/site/message-form"

type ArtistEpkProps = {
  artist: ArtistQueryResult
}

export type ArtistAudio = {
  _key: string
  title: string | null
  provider: "hearthis" | "mixcloud" | "soundcloud" | "spotify" | "youtube" | null
  sourceUrl: string | null
  embedUrl: string | null
  details: string | null
  trackId: string | null
  thumbUrl: string | null
  thumbImage: SanityImageValue | null
  coverArtUrl: string | null
  coverArtImage: SanityImageValue | null
  waveformUrl: string | null
  waveformImage: SanityImageValue | null
  waveformBgUrl: string | null
  waveformBgImage: SanityImageValue | null
}

export type ArtistVideo = {
  _key: string
  title: string
  fileUrl?: string | null
  externalUrl?: string | null
  caption?: string | null
  poster?: SanityImageValue | null
  loop: boolean
}

const trustedEmbedHosts = new Set([
  "hearthis.at",
  "app.hearthis.at",
  "open.spotify.com",
  "player.vimeo.com",
  "w.soundcloud.com",
  "widget.mixcloud.com",
  "www.youtube.com",
  "youtube.com",
])

function safeHref(value?: string | null) {
  if (!value) return null
  if (value.startsWith("/") && !value.startsWith("//")) return value
  try {
    const url = new URL(value)
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.toString() : null
  } catch {
    return null
  }
}

function safeEmbedUrl(value?: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== "https:" || !trustedEmbedHosts.has(url.hostname)) return null
    if (url.hostname === "hearthis.at" && !url.pathname.startsWith("/embed/")) return null
    if (["youtube.com", "www.youtube.com"].includes(url.hostname) && !url.pathname.startsWith("/embed/")) {
      return null
    }
    if (url.hostname === "open.spotify.com" && !url.pathname.startsWith("/embed/")) return null
    return url.toString()
  } catch {
    return null
  }
}

export type AudioCardProps = {
  audioIndex: number,
  totalAudioCount: number,
  audio: ArtistAudio,
}

function AudioCard({ audioIndex, totalAudioCount, audio }: AudioCardProps) {
  const embedUrl = audio.embedUrl //safeEmbedUrl(audio.embedUrl)
  return (
    <article id={`audio${audioIndex}`} className="sans flex flex-col justify-center h-svh w-full p-2">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="flex items-center gap-2 text-lg uppercase font-semibold tracking-tight text-[var(--white-muted)]">
          <Headphones className="inline text-[var(--signal)]" size={28} />
          <span className="inline">
            {`DJ Mixes (${audioIndex} of ${totalAudioCount})`}
          </span>
        </h2>
      </div>
      <div className="max-h-[75vh] w-full flex items-center justify-center">
        {embedUrl ? (
          <div className="w-full h-full">
            <iframe
              className="content-card w-full h-full max-h-[75vh] object-contain shadow-sm shadow-black"
              src={embedUrl}
              title={audio.title || undefined}
              loading="lazy"
              allow="autoplay"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : (
          <div className="content-card w-full h-40 flex items-center justify-center">
            Player Unavailable
          </div>
        )}
        </div>
      <div className="pt-4 pb-2">
        <h3 className="font-bold text-lg tracking-tight  text-[var(--ink-heading)]">{audio.title}</h3>
        {audio.details && <p className="text-base tracking-tight  text-[var(--ink-body)] mt-2">{audio.details}</p>}
      </div>
    </article>
  )
} 

export type VideoCardProps = {
  videoIndex: number,
  totalVideoCount: number,
  video: ArtistVideo,
}

function VideoCard({ videoIndex, totalVideoCount, video }: VideoCardProps) {
  const localOrHostedFile = safeHref(video.fileUrl)
  const embedUrl = safeEmbedUrl(video.externalUrl)
  const externalUrl = safeHref(video.externalUrl)
  const poster = video.poster || null
  const posterUrl = poster ? getSiteImageUrl(poster, { width: 1280, height: 720 }) : undefined

  return (
    <article id={`video${videoIndex}`} className="sans flex flex-col justify-center h-svh w-full p-2">
      <div className="flex items-center gap-2 mb-2">
        <Video className="text-[var(--signal)]" size={28} />
        <h2 className="text-lg uppercase font-semibold tracking-tight text-[var(--white-muted)]">{`Video Clips of Live Sets (${videoIndex} of ${totalVideoCount})`}</h2>
      </div>
      <div className="max-h-[75vh] w-full flex items-center justify-center">
        {localOrHostedFile ? (
          <video
            className="content-card w-full h-full max-h-[75vh] object-contain  shadow-sm shadow-black"
            controls
            playsInline
            preload="metadata"
            poster={posterUrl}
            aria-label={video.title}
            loop={video.loop}
          >
            <source src={localOrHostedFile} />
            Your browser does not support embedded video.
          </video>
        ) : embedUrl ? (
          <iframe
            className="content-card w-full aspect-video max-h-[75vh] max-w-full shadow-sm shadow-black"
            src={embedUrl}
            title={video.title}
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : externalUrl ? (
          <a href={externalUrl} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center text-white underline text-xs uppercase tracking-widest hover:text-[var(--accent-primary)] transition-colors">
            Watch Video ↗
          </a>
        ) : null}
      </div>
      <div className="pt-4 pb-2">
        <h3 className="font-bold text-lg tracking-tight text-[var(--ink-heading)]">{video.title}</h3>
        {video.caption && <p className="text-base tracking-tight text-[var(--ink-body)] mt-2">{video.caption}</p>}
      </div>
    </article>
  )
}

type SectionId = 'bio' | 'audio1' | 'audio2' | 'video1' | 'video2' | 'events' | 'connect';

type Section = {
  id: SectionId;
  label: string;
  icon: string;
  previous: SectionId | null;
  previousLabel: string | null;
  next: SectionId | null;
  nextLabel: string | null;
};

const sections: Section[] = [
  { id: 'bio', label: 'DJ FREAKY FRANK EPK', icon: '◼', previous: null, previousLabel: null, next: 'audio1', nextLabel: 'DJ MIX 1/2' },
  { id: 'audio1', label: 'DJ MIX 1/2', icon: '◉', previous: 'bio', previousLabel: 'BIO', next: 'audio2', nextLabel: 'DJ MIX 2/2' },
  { id: 'audio2', label: 'DJ MIX 2/2', icon: '◉', previous: 'audio1', previousLabel: 'DJ MIX 1/2', next: 'video1', nextLabel: 'VIDEO CLIP 1/2' },
  { id: 'video1', label: 'VIDEO CLIP 1/2', icon: '◷', previous: 'audio2', previousLabel: 'DJ MIX 2/2', next: 'video2', nextLabel: 'VIDEO CLIP 2/2' },
  { id: 'video2', label: 'VIDEO CLIP 2/2', icon: '◷', previous: 'video1', previousLabel: 'VIDEO CLIP 1/2', next: 'events', nextLabel: 'UPCOMING EVENTS' },
  { id: 'events', label: 'UPCOMING EVENTS', icon: '◷', previous: 'video2', previousLabel: 'VIDEO CLIP 2/2', next: 'connect', nextLabel: 'BOOK + CONNECT' },
  { id: 'connect', label: 'BOOK + CONNECT', icon: '⌁', previous: 'events', previousLabel: 'UPCOMING EVENTS', next: null, nextLabel: null },
];

function TopHeader({ section }: { section: Section }) {
  const previousSection = section.previous;

  return previousSection && (
    <header className="reader-chrome reader-header">
      <nav className="reader-content flex items-center gap-4 mono">
        <span className="reader-content">
          <span className="mono font-semibold text-[var(--white-muted)] text-sm">
            {section.label}
          </span>
        </span>
      </nav>
      {previousSection && (
        <a className="reader-content flex items-center gap-2 text-[var(--white-muted)]" href={`#${previousSection}`}>
          <span className="inline mono">
            {section.previousLabel}
          </span>
          <span className="inline">
            <ArrowUp className="text-[var(--signal)]" size={18} />
          </span>
        </a>
      )}
    </header>
  );
}

function BottomTray({ section }: { section: Section }) {
  const nextSection = section.next;

  return nextSection && (
    <footer className="reader-chrome reader-footer">
      <nav className="reader-content flex items-center gap-6 mono">
        {/* <a className="flex items-center gap-2 text-[var(--white-muted)]" href="/api/epk-pdf" target="_blank">
          <Download className="inline text-[var(--signal)]" size={18} /> 
          <span className="inline">
            EPK
          </span>
        </a> */}
        <a className="reader-content mono flex items-center gap-2 text-[var(--white-muted)]" href="#connect">
          <Handshake className="inline text-[var(--signal)]" size={18} />
          <span className="">
            CONNECT
          </span>
        </a>
      </nav>
      {nextSection && (
        <a className="reader-content mono flex items-center gap-2 text-[var(--white-muted)]" href={`#${nextSection}`}>
          <span className="inline">
            {section.nextLabel}
          </span>
          <span className="inline">
            <ArrowDown className="text-[var(--signal)]" size={18} />
          </span>
        </a>
      )}
    </footer>
  );
}

export function ArtistEpk({ artist }: ArtistEpkProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('bio');
  const maxCountVideos = 2;
  const maxCountAudioEmbeds = 2;

  useEffect(() => {
    const latestEntries = new Map<SectionId, IntersectionObserverEntry>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id as SectionId;
        if (sections.some((section) => section.id === id)) latestEntries.set(id, entry);
      });

      const upperViewport = window.innerHeight * (2 / 3);
      const visible = sections
        .map(({ id }) => {
          const entry = latestEntries.get(id);
          if (!entry || !entry.isIntersecting) return null;
          const bounds = entry.boundingClientRect;
          const upperVisibleHeight = Math.max(0, Math.min(bounds.bottom, upperViewport) - Math.max(bounds.top, 0));
          return { id, upperVisibleRatio: upperVisibleHeight / bounds.height, topDistance: Math.abs(bounds.top) };
        })
        .filter((section): section is { id: SectionId; upperVisibleRatio: number; topDistance: number } => section !== null)
        .sort((a, b) => b.upperVisibleRatio - a.upperVisibleRatio || a.topDistance - b.topDistance)[0];

      if (visible) {
        setActiveSection((currentSection) => visible.id === currentSection ? currentSection : visible.id);
      }
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  if (!artist) { return null }

  const section = sections.find(({ id }) => id === activeSection) || sections[0];
  const events = artist.events; //?.filter((event) => event.status !== "past" && event.status !== "cancelled") ?? []
  const videos = artist.videos?.slice(0, maxCountVideos);
  const audioEmbeds = artist.audioEmbeds?.slice(0, maxCountAudioEmbeds);

  return (
    <div className="epk-frame">
      <TopHeader section={section} />
      {/* 3. Main Single Column Container */}
      <main className="">
        {/* 1. PROFILE / INTRO (DARK CAP) */}
        <section id="bio" className="section-cover w-full px-4 md:px-8 pt-4 md:pt-8">
          <article className="flex flex-col h-svh w-full">
            {artist.primaryLogo?.src && ( <div>
              <SanityImage
                image={artist.primaryLogo}
                alt={artist.primaryLogo.alt || artist.name}
                className="w-full h-auto"
              />
            </div>
            )}
            <div className="mt-6 text-base text-[var(--white-subtle)]">
              {artist.positioning}
            </div>
            <div className="relative mt-6">
              {/* Photo Left */}
              {artist.heroImage?.src ? (
              <div className="wrapped-photo-container">
              <SanityImage
                image={artist.heroImage}
                alt={artist.heroImage.alt || artist.name}
                sizes="(max-width: 300px) 30vw, (max-width: 600px) 20vw, 15vw"
              />
              </div>
                ) : (
                  <div className="w-full h-full"></div>
                )}
                <div className="w-full text-base text-[var(--white-muted)] shadow-sm">
                {artist?.shortBio && artist.shortBio?.split('\n').map((paragraph, i) => (
                  <div key={i}>{paragraph}</div>
                ))}
                </div>
                <div className="w-full text-base text-[var(--white-muted)] shadow-sm mt-4">
                {artist?.biography && artist.biography?.split('\n').map((paragraph, i) => (
                  <div key={i}>{paragraph}</div>
                ))}
                </div>
              </div>  
          </article>
        </section>

        {/* 2. AUDIO EMBEDS */}
        {audioEmbeds?.length ? (
          <section className="section-paper w-full p-4">
            {audioEmbeds.map((audio, i) => (
              <AudioCard key={audio._key} audioIndex={i + 1} totalAudioCount={audioEmbeds.length} audio={audio as ArtistAudio} />
            ))}
          </section>
        ) : null}

        {/* 3. VIDEOS */}
        {videos?.length ? (
          <section className="section-paper w-full p-4">
            {videos.map((video, i) => (
              <VideoCard key={video._key} videoIndex={i + 1} totalVideoCount={videos.length} video={video as ArtistVideo} />
            ))}
          </section>
        ) : null}

        {/* 4. UPCOMING EVENTS (LIGHT CORE) */}
        {events?.length ? (
          <section id="events" className="section-paper w-full p-4">
            <article className="flex flex-col justify-center h-svh w-full p-2">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-[var(--signal)]" size={28} />
                <h2 className="text-lg uppercase font-semibold tracking-tight text-[var(--white-muted)]">Upcoming Events</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-4">
                  <div className="space-y-6">
                    {events.map((event, i) => {
                      const displayDate = event.dateDisplay || (event.startsAt ? new Date(event.startsAt).toLocaleDateString() : 'TBA')
                      const venueLine = [event.venue, event.location].filter(Boolean).join(" — ")
                      return (
                        <div key={i} className="content-card flex flex-col shadow-sm shadow-black">
                          <div>
                            <div className="flex items-center gap-4 mb-2">
                              <span className="font-semibold text-xl">{displayDate}</span>
                            </div>
                            <h3 className="text-lg font-medium">{event.title}</h3>
                            {venueLine && <p className="opacity-70 mt-1 text-sm">{venueLine}</p>}
                          </div>
                          {event.url && (
                            <a href={event.url} target="_blank" rel="noreferrer" className="mono text-[10px] uppercase whitespace-nowrap">
                              Tickets ↗
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </article>
          </section>
        ) : null}

        {/* 5. CONNECT */}
        <section id="connect" className="section-cover w-full p-4">
          <article className="flex flex-col justify-center h-svh w-full p-2">
            <div className="flex items-center gap-2 mb-4">
              <Handshake className="text-[var(--signal)]" size={28} />
              <h2 className="text-lg uppercase font-semibold tracking-tight text-[var(--white-muted)]">Booking & Connections</h2>
            </div>
            <div className="">
              <ul className="font-medium mono text-base text-[var(--white-muted)]">
                {artist.externalLinks?.map((link, i) => (
                  <li key={i}>
                    <a  href={link.href!} target={link.openInNewTab ? "_blank" : undefined} className="inline-block py-2 my-2">
                      {link.label || link.href}
                    </a>
                  </li>
                ))}
                {artist.bookingEmail && (
                  <li><a href={`mailto:${artist.bookingEmail}`} className="inline-block py-2 my-2">{artist.bookingLabel}</a></li>
                )}
              </ul>
            </div>
            <div className="absolute bottom-8 left-8 text-base text-[var(--white-subtle)]">
              <div className="mt-2 p-s">
                <MessageForm />
              </div>
            </div>
          </article>
        </section>
      </main>

      <BottomTray section={section} />
    </div>
  )
}
