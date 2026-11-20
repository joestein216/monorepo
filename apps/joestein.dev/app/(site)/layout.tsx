import "../globals.css";
import { Instrument_Serif, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/sanity/lib/live";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", interactiveWidget: "resizes-content" };

export const metadata: Metadata = {
  title: "Joe Stein | Engineering Portfolio",
  description: "Joe Stein’s engineering experience, projects, and resume.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}><body>
    {children}
    <SanityLive />
    {(await draftMode()).isEnabled && <VisualEditing />}
  </body></html>;
}
