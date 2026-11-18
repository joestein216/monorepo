import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ColophonContent } from "@/components/colophon-content";
import { PortfolioHeader } from "@/components/portfolio-header";
import { getColophonPage } from "@/lib/sanity-context";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getColophonPage();
  return { title: page?.title ?? "Making of joestein.dev", description: page?.subtitle ?? undefined };
}

export default async function Colophon() {
  const page = await getColophonPage();
  if (!page) notFound();
  return <main data-slot="colophon-shell">
    <PortfolioHeader colophon />
    <ColophonContent page={page} />
  </main>;
}
