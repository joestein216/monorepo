import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/sanity/lib/live";

export const metadata: Metadata = {
  title: "Joe Stein | Engineering Portfolio",
  description: "Joe Stein’s engineering experience, projects, and resume.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body>
    {children}
    <SanityLive />
    {(await draftMode()).isEnabled && <VisualEditing />}
  </body></html>;
}
