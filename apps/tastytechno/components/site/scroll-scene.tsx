"use client"

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import styles from "./scroll-scene.module.css"

const motionQuery = "(prefers-reduced-motion: no-preference)"
function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(motionQuery)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}
const getMotionPreference = () => window.matchMedia(motionQuery).matches
const getServerMotionPreference = () => false

/** Decorative projection. No autoplay, timers, or continuously running RAF loop. */
export function ScrollScene({ children, artwork }: { children: ReactNode; artwork: ReactNode }) {
  const sceneRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [requested, setRequested] = useState(false)
  const [failed, setFailed] = useState(false)
  const permitsMotion = useSyncExternalStore(subscribeToMotionPreference, getMotionPreference, getServerMotionPreference)
  const active = requested && permitsMotion && !failed

  useEffect(() => {
    const scene = sceneRef.current
    const video = videoRef.current
    if (!scene || !video || !active) return
    let frame = 0
    const update = () => {
      frame = 0
      const rect = scene.getBoundingClientRect()
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, window.innerHeight)))
      scene.style.setProperty("--scene-progress", String(progress))
      if (video.readyState >= 1 && Number.isFinite(video.duration) && !video.seeking) {
        const target = progress * Math.max(0, video.duration - 0.1)
        if (Math.abs(video.currentTime - target) > 0.08) video.currentTime = target
      }
    }
    const queueUpdate = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    window.addEventListener("scroll", queueUpdate, { passive: true })
    window.addEventListener("resize", queueUpdate)
    video.addEventListener("loadedmetadata", queueUpdate)
    video.addEventListener("seeked", queueUpdate)
    queueUpdate()
    return () => {
      window.removeEventListener("scroll", queueUpdate)
      window.removeEventListener("resize", queueUpdate)
      video.removeEventListener("loadedmetadata", queueUpdate)
      video.removeEventListener("seeked", queueUpdate)
      if (frame) window.cancelAnimationFrame(frame)
      scene.style.removeProperty("--scene-progress")
    }
  }, [active])

  return (
    <section ref={sceneRef} className={styles.scene} data-slot="residency" data-motion={active ? "on" : "off"} aria-labelledby="home-heading">
      <div className={styles.projection} aria-hidden="true">
        <video ref={videoRef} src={active ? "/media/dance-projection.mp4" : undefined} poster="/media/dance-projection-poster.jpg" muted playsInline preload={active ? "auto" : "none"} tabIndex={-1} onError={() => setFailed(true)} />
      </div>
      <div className={styles.copy}>{children}</div>
      <div className={styles.artwork}>{artwork}</div>
      <div className={styles.controls}>
        <button type="button" aria-pressed={active} aria-describedby="scene-motion-description" disabled={!permitsMotion || failed} onClick={() => setRequested((value) => !value)}>
          Scroll motion: {active ? "on" : "off"}
        </button>
        <p id="scene-motion-description">
          {failed ? "The still background is available; motion could not load." : !permitsMotion ? "Still scene. Reduced motion is respected." : "Optional depth effect. Moves only as you scroll."}
        </p>
      </div>
    </section>
  )
}
