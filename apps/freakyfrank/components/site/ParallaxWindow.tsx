"use client";
import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";

export function ParallaxWindow({
  imageUrl,
  children,
  label,
}: {
  imageUrl?: string | null;
  children: ReactNode;
  label: string;
}) {
  const root = useRef<HTMLElement>(null);
  const layer = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!root.current || !layer.current) return;
      const rect = root.current.getBoundingClientRect();
      const offset = media.matches
        ? 0
        : Math.max(
            -80,
            Math.min(80, (innerHeight / 2 - rect.top - rect.height / 2) * 0.12),
          );
      layer.current.style.transform = `translate3d(0, ${offset}px, 0)`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, []);
  return (
    <section ref={root} data-slot="parallax-window" aria-label={label}>
      {imageUrl && (
        <Image
          ref={layer}
          data-slot="depth-image"
          src={imageUrl}
          alt=""
          fill
          sizes="100vw"
        />
      )}
      <div data-slot="window-content">{children}</div>
    </section>
  );
}
