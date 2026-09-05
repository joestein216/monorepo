"use client"

import React, { useEffect, useState } from "react"
import { ArtistQueryResult } from "../../../sanity.types"
import { type SanityImageValue, getSiteImageUrl } from "../../../sanity/queries/image"
import { SanityImage } from "../site/sanity-image"
import { Download, Headphones, Calendar, Video, ArrowDown, ArrowUp } from "lucide-react"

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
    <article className="bg-[var(--anchor-section)] text-[var(--white-muted)]">
      {embedUrl ? (
        <div className="w-full bg-[var(--bg-light)] p-2 border border-[var(--line-light)] shadow-inner">
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
        <div className="w-full h-40 bg-[var(--bg-light)] border border-[var(--line-light)] flex items-center justify-center mono text-[10px] uppercase tracking-widest opacity-50">
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
    <article className="overflow-hidden mx-4">
      <div className="relative">
        {localOrHostedFile ? (
          <video
            className="w-full h-full object-contain"
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
      <div className="mb-6">
        <h3 className="font-semibold text-xl tracking-tight">{video.title}</h3>
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
  { id: 'bio', label: 'PROFILE', icon: '◼', previous: null, previousLabel: null, next: 'audio', nextLabel: 'MUSIC' },
  { id: 'audio', label: 'AUDIO', icon: '◉', previous: 'bio', previousLabel: 'BIO', next: 'video', nextLabel: 'VIDEO' },
  { id: 'video', label: 'VIDEO', icon: '◷', previous: 'audio', previousLabel: 'AUDIO', next: 'events', nextLabel: 'EVENTS' },
  { id: 'events', label: 'EVENTS', icon: '◷', previous: 'video', previousLabel: 'VIDEO', next: 'connect', nextLabel: 'CONNECT' },
  { id: 'connect', label: 'CONNECT | BOOK ', icon: '⌁', previous: 'events', previousLabel: 'EVENTS', next: null, nextLabel: null },
];

function TopHeader({ section }: { section: Section }) {
  const previousSection = section.previous;
  return previousSection && (
    <header className="reader-chrome reader-header">
      <span className="reader-content">
        <span className="mr-3 text-[16px] text-[var(--signal)]">{section.icon}</span>
        <span className="mono text-[var(--white-muted)]">{section.label}</span>
      </span>
      {previousSection && (
        <a className="reader-content focus-ring flex items-center gap-2 text-[var(--white-subtle)] transition-colors hover:text-[var(--white)]" href={`#${previousSection}`}>
          <span className="inline mono text-[10px]">{section.previousLabel}</span>
          <span className="text-lg text-[var(--signal)]">↑</span>
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
        <a className="focus-ring transition-colors hover:text-[var(--signal)]" href="#bio">▧ <span className="underline underline-offset-4">EPK</span></a>
        <span className="text-[var(--white-faint)]">/</span>
        <a className="focus-ring transition-colors hover:text-[var(--signal)]" href="mailto:connect@freakyfrank.com">◫ <span className="underline underline-offset-4">BOOK</span></a>
      </nav>
      {nextSection && (
        <a className="reader-content focus-ring mono flex items-center gap-3 text-[var(--white-subtle)] transition-colors hover:text-[var(--white)]" href={`#${nextSection}`}>
          <span className="inline">{section.nextLabel}</span><span className="text-lg text-[var(--signal)]">↓</span>
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
  const events = artist.events?.filter((event) => event.status !== "past" && event.status !== "cancelled") ?? []

  return (
    <div className="epk-frame relative">
      <TopHeader section={section} />
      {/* 3. Main Single Column Container */}
      <main className="epk-scroll">
        {/* 1. PROFILE / INTRO (DARK CAP) */}
        <section id="bio" className="epk-section mx-4 bg-[var(--bg-dark)] text-[var(--text-light)]">
          <div>
            <img src={artist.primaryLogo.src} alt={artist.heroImage.alt || artist.name} />
          </div>
          <div className=" mt-4 text-base text-[var(--white-subtle)]">
            {artist.positioning}
          </div>
          <div className="relative mt-6">
              {/* Photo Left */}
              {artist.heroImage ? (
                <div className="wrapped-photo-container">
                  <img
                    src={artist.heroImage.src}
                    alt={artist.heroImage.alt || artist.name}
                    width={225} 
                    height={300}
                    fill="true"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-[rgba(255,255,255,0.05)] border-r border-[var(--line-dark)]"></div>
              )}
              {/* Bio Right */}
              <div className="w-full text-base leading-relaxed text-[var(--white-muted)] shadow-sm">
                {artist.shortBio?.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
            </div>
          </div>
        </section>

        {/* 2. AUDIO STREAMS (LIGHT CORE) */}
        {artist.audioEmbeds?.length ? (
          <section id="audio" className="epk-section bg-[var(--bg-light)] text-[var(--text-dark)] my-24 px-6">
            <div className="mx-auto">
              <div className="flex items-center gap-4 mb-16 pb-4">
                <Headphones className="text-[var(--accent-primary)]" size={28} />
                <h2 className="text-4xl font-semibold tracking-tight">Audio Streams</h2>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
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
            <div className="flex items-center">
              <h2 className="text-xl uppercase font-semibold tracking-tight">Live from the Booth</h2>
            </div>

            <div className="grid lg:grid-cols-2">
              {artist.videos.map((video, i) => (
                <VideoCard key={i} video={video as ArtistVideo} />
              ))}
            </div>
          </section>
        ) : null}

        {/* 4. UPCOMING EVENTS (LIGHT CORE) */}
        {events.length ? (
          <section id="events" className="my-24 px-6 border-t bg-[var(--bg-light)] text-[var(--text-dark)] border-[var(--line-light)]">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-16 border-b border-[var(--line-light)] pb-4">
                <Calendar className="text-[var(--accent-primary)]" size={28} />
                <h2 className="text-4xl font-semibold tracking-tight">Upcoming Events</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="border border-[var(--line-light)] bg-white p-6 md:p-8 shadow-sm">
                  <p className="mono text-[10px] uppercase tracking-[0.18em] opacity-50 mb-8">Confirmed Dates</p>
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

        {/* 5. BOOKING & CONNECTIONS (DARK CAP) */}
        <section id="connect" className="epk-section y-24 px-6 border-t-4 bg-[var(--bg-dark)] text-[var(--text-light)] border-[var(--line-dark)]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-16 max-w-2xl leading-tight">
              Contact, booking & logistics<span className="text-[var(--accent-primary)]">.</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-16 items-start">

              {/* Network & Specs */}
              <div className="space-y-16">
                <div>
                  <h3 className="mono text-sm uppercas">CONNETIONS & BOOKING</h3>
                  <ul className="space-y-4 font-medium mono text-sm">
                    {artist.bookingEmail && (
                      <li><a href={`mailto:${artist.bookingEmail}`} className="hover:text-[var(--accent-primary)] transition-colors">{artist.bookingEmail}</a></li>
                    )}
                    {artist.externalLinks?.map((link, i) => (
                      <li key={i}>
                        <a href={link.href!} target={link.openInNewTab ? "_blank" : undefined} className="hover:text-[var(--accent-primary)] transition-colors">
                          {link.label || link.href}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

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

              {/* Form & EPK Download */}
              <div className="space-y-16">
                <form className="flex border-b border-[var(--line-dark)] pb-3" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="text"
                    placeholder="Send a message (include contact info)"
                    className="flex-1 bg-transparent outline-none placeholder:opacity-40 text-sm"
                  />
                  <button type="button" className="mono text-[10px] uppercase tracking-[0.18em] bg-[rgba(255,255,255,0.1)] hover:bg-[var(--accent-primary)] px-4 py-2 transition-colors">
                    SEND
                  </button>
                </form>

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
              </div>

            </div>
          </div>
        </section>
      </main>

      <BottomTray section={section} />
    </div>
  )
}
