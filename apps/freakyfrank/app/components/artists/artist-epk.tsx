/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useEffect, useState } from "react"
import { ArtistQueryResult } from "../../../sanity.types"
import { type SanityImageValue, getSiteImageUrl } from "../../../sanity/queries/image"
import { SanityImage } from "../site/sanity-image"
import { Download, Headphones, Calendar, Video, ArrowDown, ArrowUp, Handshake } from "lucide-react"

type ArtistEpkProps = {
  artist: ArtistQueryResult
}

export type ArtistAudio = {
  title: string | null
  provider: "hearthis" | "mixcloud" | "soundcloud" | "spotify" | "youtube" | null
  sourceUrl: string | null
  embedUrl: string | null
  details: string | null
}

export type ArtistVideo = {
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

function AudioCard({ audio }: { audio: ArtistAudio }) {
  const embedUrl = audio.embedUrl //safeEmbedUrl(audio.embedUrl)
  return (
    <article className="text-[var(--white-muted)]">
      {embedUrl ? (
        <div className="w-full bg-[var(--bg-light)] p-2 border border-[var(--chrome-line)] shadow-inner">
          <iframe
            className="w-full h-40"
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
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{audio.title}</h3>
          {audio.details && <p className="text-sm opacity-70 mt-2">{audio.details}</p>}
        </div>
      </div>
    </article>
  )
} 

function VideoCard({ video }: { video: ArtistVideo }) {
  const localOrHostedFile = safeHref(video.fileUrl)
  const embedUrl = safeEmbedUrl(video.externalUrl)
  const externalUrl = safeHref(video.externalUrl)
  const poster = video.poster || null
  const posterUrl = poster ? getSiteImageUrl(poster, { width: 1280, height: 720 }) : undefined

  return (
    <article className="overflow-hidden mb-8 h-auto max-h-[250px] text-[var(--white-muted)] border border-[var(--chrome-line)] shadow-sm">
      <div className="relative">
        {localOrHostedFile ? (
          <video
            className="w-full max-h-[175px] md:mn-h-[250px] object-contain"
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
            className="w-full h-full"
            src={embedUrl}
            title={video.title}
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : externalUrl ? (
          <a href={externalUrl} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center text-white underline mono text-xs uppercase tracking-widest hover:text-[var(--accent-primary)] transition-colors">
            Watch Video ↗
          </a>
        ) : null}
      </div>
      <div className="">
        <h3 className="text-base tracking-tight">{video.title}</h3>
        {video.caption && <p className="text-sm text-[var(--text-dark)] opacity-70 mt-2">{video.caption}</p>}
      </div>
    </article>
  )
}

type SectionId = 'bio' | 'audio' | 'video' | 'events' | 'connect';

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
  { id: 'bio', label: 'BIO', icon: '◼', previous: null, previousLabel: null, next: 'audio', nextLabel: 'MUSIC' },
  { id: 'audio', label: 'MUSIC', icon: '◉', previous: 'bio', previousLabel: 'BIO', next: 'video', nextLabel: 'VIDEO' },
  { id: 'video', label: 'VIDEO', icon: '◷', previous: 'audio', previousLabel: 'AUDIO', next: 'events', nextLabel: 'EVENTS' },
  { id: 'events', label: 'EVENTS', icon: '◷', previous: 'video', previousLabel: 'VIDEO', next: 'connect', nextLabel: 'CONNECT' },
  { id: 'connect', label: 'CONNECT', icon: '⌁', previous: 'events', previousLabel: 'EVENTS', next: null, nextLabel: null },
];

function TopHeader({ section }: { section: Section }) {
  const previousSection = section.previous;
  return previousSection && (
    <header className="reader-chrome reader-header">
      <span className="reader-content">
        <span className="mr-3 text-sm text-[var(--signal)]">{section.icon}</span>
        <span className="mono">{section.label}</span>
      </span>
      {previousSection && (
        <a className="reader-content focus-ring flex items-center gap-2 text-[var(--white-subtle)] transition-colors hover:text-[var(--white)]" href={`#${previousSection}`}>
          <span className="inline mono">{section.previousLabel}</span>
          <span className=""><ArrowUp className="text-[var(--signal)]" size={18} /></span>
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
        {false && (
          <a className="focus-ring transition-colors hover:text-[var(--signal)]" href="#connect">▧ <span className="underline underline-offset-4">EPK</span></a>
        )}
        <a className="reader-content focus-ring mono flex items-center gap-2 text-[var(--white-subtle)] transition-colors hover:text-[var(--white)]" href="#connect">
          <span className="inline"><Handshake className="text-[var(--accent-primary)]" size={18} /></span>
          <span className="">BOOK</span>
        </a>
      </nav>
      {nextSection && (
        <a className="reader-content focus-ring mono flex items-center gap-2 text-[var(--white-subtle)] transition-colors hover:text-[var(--white)]" href={`#${nextSection}`}>
          <span className="inline">{section.nextLabel}</span>
          <span className="text-[var(--signal)]"><ArrowDown className="text-[var(--accent-primary)]" size={18} /></span>
        </a>
      )}
    </footer>
  );
}

export function ArtistEpk({ artist }: ArtistEpkProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('bio');

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
  const events = artist.events //?.filter((event) => event.status !== "past" && event.status !== "cancelled") ?? []

  return (
    <div className="epk-frame relative">
      <TopHeader section={section} />
      {/* 3. Main Single Column Container */}
      <main className="epk-scroll">
        {/* 1. PROFILE / INTRO (DARK CAP) */}
        <section id="bio" className="epk-section mx-4 bg-[var(--bg-dark)] text-[var(--text-light)]">
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
        </section>

        {/* 2. AUDIO STREAMS (LIGHT CORE) */}
        {artist.audioEmbeds?.length ? (
          <section id="audio" className="epk-section mx-4">
            <div className="mx-auto">
              <div className="flex items-center mb-4">
                <Headphones className="text-[var(--accent-primary)]" size={28} />&nbsp;&nbsp;
                <h2 className="text-lg font-semibold uppercase tracking-tight">Audio Streams</h2>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                {artist.audioEmbeds.map((audio, i) => (
                  <AudioCard key={i} audio={audio as ArtistAudio} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* 3. LIVE VIDEO ARCHIVE (LIGHT CORE) */}
        {artist.videos?.length ? (
          <section id="video" className="epk-section my-24 mx-4 bg-[var(--bg-light)] text-[var(--text-dark)]">
            <div className="flex items-center mb-4">
              <Video className="text-[var(--accent-primary)]" size={28} />&nbsp;&nbsp;
              <h2 className="text-lg uppercase font-semibold tracking-tight">Live from the Booth</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {artist.videos.map((video, i) => (
                <VideoCard key={i} video={video as ArtistVideo} />
              ))}
            </div>
          </section>
        ) : null}

        {/* 4. UPCOMING EVENTS (LIGHT CORE) */}
        {events?.length ? (
          <section id="events" className="epk-section mx-4 text-[var(--text-dark)]">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <Calendar className="text-[var(--accent-primary)]" size={28} />
                <h2 className="text-lg uppercase font-semibold tracking-tight">Upcoming Events</h2>
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
                              {event.status === 'pending' && <span className="mono text-[10px] uppercase tracking-widest bg-[var(--accent-primary)] text-white px-2 py-1 rounded-sm">PENDING</span>}
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
            </div>
          </section>
        ) : null}

        {/* 5. CONNECT */}
        <section id="connect" className="epk-section px-6 bg-[var(--bg-dark)]">
          <div className="max-w-6xl mx-auto">
            <h2 className=" mb-8 text-lg font-bold tracking-tight uppercase leading-tight text-[var(--text-light)] shadow-sm">
              BOOKING & CONNECTIONS
            </h2>
            <div className="">
              <ul className="font-medium mono text-sm text-[var(--white-muted)]">
                {artist.externalLinks?.map((link, i) => (
                  <li key={i}>
                    <a  href={link.href!} target={link.openInNewTab ? "_blank" : undefined} className="block pt-6 pb-6">
                      {link.label || link.href}
                    </a>
                  </li>
                ))}
                {artist.bookingEmail && (
                  <li><a href={`mailto:${artist.bookingEmail}`} className="block pt-6 pb-6">{artist.bookingEmail}</a></li>
                )}
              </ul>
              {false ? (
                <form className="flex border border-[var(--chrome-line)]" onSubmit={(e) => e.preventDefault()}>
                  <textarea rows={4}
                    placeholder="Send a message (include contact info)"
                    className="flex-1 p-1 bg-[var(--cover-inner)] outline-none placeholder:opacity-40 text-base"
                  />
                  <button type="button" className="mono text-sm px-2 uppercase bg-[rgba(255,255,255,0.1)]">
                    SEND
                  </button>
                </form>
              ) : null}
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
          </div>
        </section>
      </main>

      <BottomTray section={section} />
    </div>
  )
}
