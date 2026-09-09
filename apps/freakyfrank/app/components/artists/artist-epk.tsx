/* eslint-disable @next/next/no-img-element */
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
    <article id={`audio${audioIndex}`} className="flex flex-col justify-center h-svh w-full p-2">
      <div className="flex items-center gap-2 mb-2">
        <Headphones className="text-[var(--signal)]" size={28} />
        <h2 className="text-lg uppercase font-semibold tracking-tight text-[var(--white-muted)]">{`DJ Mixes (${audioIndex} of ${totalAudioCount})`}</h2>
      </div>
      <div className="max-h-[75vh] w-full flex items-center justify-center">
        {embedUrl ? (
          <div className="w-full bg-[var(--bg-light)] p-2 border border-[var(--chrome-line)] shadow-inner">
            <iframe
              className="w-full h-full max-h-[75vh] object-contain"
              src={embedUrl}
              title={audio.title || undefined}
              loading="lazy"
              allow="autoplay"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : (
          <div className="w-full h-40 bg-[var(--bg-light)] border border-[var(--chrome-line)] flex items-center justify-center mono text-[10px] uppercase tracking-widest opacity-50">
            Player Unavailable
          </div>
        )}
        </div>
      <div className="pt-4 pb-2">
        <h3 className="text-base tracking-tight">{audio.title}</h3>
        {audio.details && <p className="text-sm text-[var(--white-muted)] mt-2">{audio.details}</p>}
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
    <article id={`video${videoIndex}`} className="flex flex-col justify-center h-svh w-full p-2">
      <div className="flex items-center gap-2 mb-2">
        <Video className="text-[var(--signal)]" size={28} />
        <h2 className="text-lg uppercase font-semibold tracking-tight text-[var(--white-muted)]">{`Video Clips of Live Sets (${videoIndex} of ${totalVideoCount})`}</h2>
      </div>
      <div className="max-h-[75vh] w-full flex items-center justify-center">
        {localOrHostedFile ? (
          <video
            className="w-full h-full max-h-[75vh] object-contain"
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
            className="w-full aspect-video max-h-[75vh] max-w-full"
            src={embedUrl}
            title={video.title}
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : externalUrl ? (
          <a href={externalUrl} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center text-white underline mono text-xs uppercase tracking-widest hover:text-[var(--accent-primary)] transition-colors">
            Watch Video ↗
          </a>
        ) : null}
      </div>
      <div className="pt-4 pb-2">
        <h3 className="text-base tracking-tight">{video.title}</h3>
        {video.caption && <p className="text-sm text-[var(--white-muted)] mt-2">{video.caption}</p>}
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
  { id: 'bio', label: 'DJ FREAKY FRANK EPK', icon: '◼', previous: null, previousLabel: null, next: 'audio1', nextLabel: 'AUDIO MIX 1/2' },
  { id: 'audio1', label: 'AUDIO MIX 1/2', icon: '◉', previous: 'bio', previousLabel: 'BIO', next: 'audio2', nextLabel: 'AUDIO MIX 2/2' },
  { id: 'audio2', label: 'AUDIO MIX 2/2', icon: '◉', previous: 'audio1', previousLabel: 'AUDIO MIX 1/2', next: 'video1', nextLabel: 'VIDEO CLIP 1/2' },
  { id: 'video1', label: 'VIDEO CLIP 1/2', icon: '◷', previous: 'audio2', previousLabel: 'AUDIO MIX 2/2', next: 'video2', nextLabel: 'VIDEO CLIP 2/2' },
  { id: 'video2', label: 'VIDEO CLIP 2/2', icon: '◷', previous: 'video1', previousLabel: 'VIDEO CLIP 1/2', next: 'events', nextLabel: 'UPCOMING EVENTS' },
  { id: 'events', label: 'UPCOMING EVENTS', icon: '◷', previous: 'video2', previousLabel: 'VIDEO CLIP 2/2', next: 'connect', nextLabel: 'BOOK + CONNECT' },
  { id: 'connect', label: 'BOOK + CONNECT', icon: '⌁', previous: 'events', previousLabel: 'UPCOMING EVENTS', next: null, nextLabel: null },
];

function TopHeader({ section }: { section: Section }) {
  const previousSection = section.previous;
  return (
    <header className="reader-chrome reader-header">
      <nav className="reader-content flex items-center gap-4 mono">
        <span className="reader-content">
          <span className="mono font-semibold text-[var(--white-muted)] text-base">
            {section.label}
          </span>
        </span>
      </nav>
      {previousSection && (
        <a className="reader-content flex items-center gap-2 text-[var(--white-muted)]" href={`#${previousSection}`}>
          <span className="inline mono">
            {section.previousLabel}
          </span>
          <span className="inline"><
            ArrowUp className="text-[var(--signal)]" size={18} />
          </span>
        </a>
      )}
    </header>
  );
}

function BottomTray({ section }: { section: Section }) {
  const nextSection = section.next;
  return (
    <footer className="reader-chrome reader-footer">
      <nav className="reader-content flex items-center gap-4 mono">
        <span className="reader-content">
          {false && (
            <a className="text-[var(--white-muted)]" href="#connect">
              ▧
              <span className="underline underline-offset-4">
                EPK
              </span>
            </a>
          )}
          <a className="reader-content mono flex items-center gap-2 text-[var(--white-muted)]" href="#connect">
            <span className="inline">
              <Handshake className="text-[var(--signal)]" size={18} />
            </span>
            <span className="">BOOK | CONNECT</span>
          </a>
        </span>
      </nav>
      {nextSection && (
        <a className="reader-content mono flex items-center gap-2 text-[var(--white-subtle)]" href={`#${nextSection}`}>
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
    <div className="epk-frame relative">
      <TopHeader section={section} />
      {/* 3. Main Single Column Container */}
      <main className="epk-scroll">
        {/* 1. PROFILE / INTRO (DARK CAP) */}
        <section id="bio" className="w-full p-4">
          <article className="flex flex-col justify-center h-svh w-full p-2">
            {artist.primaryLogo?.src && ( <div>
              <img src={artist.primaryLogo.src} alt={artist.heroImage?.alt || artist.name || undefined} />
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
                  <div className="w-full h-full bg-[rgba(255,255,255,0.05)]"></div>
                )}
                {/* Bio Right */}
                <div className="w-full text-base text-[var(--white-muted)] shadow-sm">
                  {artist.shortBio?.split('\n').map((paragraph, i) => (
                    <div key={i}>{paragraph}</div>
                  ))}
              </div>
            </div>
          </article>
        </section>

        {/* 2. AUDIO EMBEDS */}
        {audioEmbeds?.length ? (
          <section className="w-full p-4">
            {audioEmbeds.map((audio, i) => (
              <AudioCard key={audio._key} audioIndex={i + 1} totalAudioCount={audioEmbeds.length} audio={audio as ArtistAudio} />
            ))}
          </section>
        ) : null}

        {/* 3. VIDEOS */}
        {videos?.length ? (
          <section className="w-full p-4">
            {videos.map((video, i) => (
              <VideoCard key={video._key} videoIndex={i + 1} totalVideoCount={videos.length} video={video as ArtistVideo} />
            ))}
          </section>
        ) : null}

        {/* 4. UPCOMING EVENTS (LIGHT CORE) */}
        {events?.length ? (
          <section id="events" className="w-full p-4">
            <article className="flex flex-col justify-center h-svh w-full p-2">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-[var(--signal)]" size={28} />
                <h2 className="text-lg uppercase font-semibold tracking-tight text-[var(--white-muted)]">Upcoming Events</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className=" bg-[var(--cover-inner)] p-4 border border-[var(--chrome-line)] shadow-sm">
                  <div className="space-y-6">
                    {events.map((event, i) => {
                      const displayDate = event.dateDisplay || (event.startsAt ? new Date(event.startsAt).toLocaleDateString() : 'TBA')
                      const venueLine = [event.venue, event.location].filter(Boolean).join(" — ")
                      return (
                        <div key={i} className="flex flex-col md:flex-row md:items-start justify-between border-b border-[var(--line-light)] pb-6 last:border-0 last:pb-0 gap-4">
                          <div>
                            <div className="flex items-center gap-4 mb-2">
                              <span className="font-semibold text-xl">{displayDate}</span>
                            </div>
                            <h3 className="text-lg font-medium">{event.title}</h3>
                            {venueLine && <p className="opacity-70 mt-1 text-sm">{venueLine}</p>}
                          </div>
                          {event.url && (
                            <a href={event.url} target="_blank" rel="noreferrer" className="mono text-[10px] uppercase tracking-[0.18em] whitespace-nowrap hover:text-[var(--accent-primary)] transition-colors pt-1">
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
        <section id="connect" className="w-full p-4">
          <article className="flex flex-col justify-center h-svh w-full p-2">
            <div className="flex items-center gap-2 mb-4">
              <Handshake className="text-[var(--signal)]" size={28} />
              <h2 className="text-lg uppercase font-semibold tracking-tight text-[var(--white-muted)]">Booking & Connections</h2>
            </div>
            <div className="">
              <ul className="font-medium mono text-sm text-[var(--white-muted)]">
                {artist.externalLinks?.map((link, i) => (
                  <li key={i}>
                    <a  href={link.href!} target={link.openInNewTab ? "_blank" : undefined} className="inline-block py-2 my-4">
                      {link.label || link.href}
                    </a>
                  </li>
                ))}
                {artist.bookingEmail && (
                  <li><a href={`mailto:${artist.bookingEmail}`} className="inline-block py-2 my-4">{artist.bookingLabel}</a></li>
                )}
                <li>
                  <div className="w-full max-w-sm mt-6">
                    <div>
                      Message (include contact info):
                    </div>
                    <div className="mt-2">
                      <MessageForm />
                    </div>
                  </div>
                </li>
              </ul>
              {/* EPK Package Download */}
              {artist.epkPackage?.url ? (
                <div className="border border-[var(--line-dark)] p-8 md:p-10 bg-[rgba(255,255,255,0.03)] rounded-sm">
                  <h3 className="mono text-[10px] uppercase tracking-[0.18em] opacity-50 mb-3">Media Kit</h3>
                  <h4 className="text-3xl font-bold mb-8">Download Full EPK</h4>
                  <a
                    href={artist.epkPackage.url}
                    className="inline-flex items-center gap-3 bg-[var(--bg-light)] text-[var(--bg-dark)] px-8 py-4 font-bold hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
                    download
                  >
                    <Download size={20} /> Get Press Package
                  </a>
                </div>
              ) : null}
              {artist.technicalRider?.preferredSetup?.length ? (
                <div>
                  <h3 className="mono text-[10px] uppercase tracking-[0.18em] mb-6">TECH SPECS</h3>
                  <ul className="border-l border-[var(--accent-primary)] pl-6 space-y-3 font-medium mono text-sm">
                    {artist.technicalRider.preferredSetup.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                    {artist.technicalRider.boothMonitors && <li>{artist.technicalRider.boothMonitors}</li>}
                  </ul>
                </div>
              ) : null}
            </div>
          </article>
        </section>
      </main>

      <BottomTray section={section} />
    </div>
  )
}
