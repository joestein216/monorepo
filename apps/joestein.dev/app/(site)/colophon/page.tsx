import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ColophonContent } from "@/components/colophon-content";
import { PortfolioHeader } from "@/components/portfolio-header";
import { PortfolioFooter } from "@/components/portfolio-footer";
import { getSitePresentation } from "@/lib/site-presentation";
import { getColophonPage, getSiteSettings } from "@/lib/sanity-context";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getColophonPage();
  return { title: page?.title ?? "Making of joestein.dev", description: page?.subtitle ?? undefined };
}

export default async function Colophon() {
  const [page, settings] = await Promise.all([getColophonPage(), getSiteSettings().catch(() => null)]);
  if (!page) notFound();
  const presentation = getSitePresentation(settings);
  return <main data-slot="colophon-shell">
    <PortfolioHeader colophon presentation={presentation} />
    <ColophonContent page={page} />
    <PortfolioFooter colophon presentation={presentation} />
  </main>;
}
