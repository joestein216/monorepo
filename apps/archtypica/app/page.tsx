import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { createClient } from "next-sanity";

type SiteSettings = {
  siteTitle?: string | null;
  siteDescription?: string | null;
};

type ResolvedSiteSettings = {
  title: string;
  description: string | null;
};

const fallbackTitle = "Archtypica";
const siteSettingsQuery = `*[_type == "siteSettings" && _id == "siteSettings"][0]{
  siteTitle,
  siteDescription
}`;

function resolveSiteSettings(
  settings: SiteSettings | null,
): ResolvedSiteSettings {
  return {
    title: settings?.siteTitle?.trim() || fallbackTitle,
    description: settings?.siteDescription?.trim() || null,
  };
}

const getSiteSettings = cache(async (): Promise<ResolvedSiteSettings> => {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim();

  if (!projectId || !dataset) {
    return resolveSiteSettings(null);
  }

  try {
    const client = createClient({
      projectId,
      dataset,
      apiVersion: "2026-08-02",
      perspective: "published",
      useCdn: true,
    });
    const settings = await client.fetch<SiteSettings | null>(
      siteSettingsQuery,
    );

    return resolveSiteSettings(settings);
  } catch {
    return resolveSiteSettings(null);
  }
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getSiteSettings();

  return {
    title,
    description: description ?? `The official website of ${title}.`,
  };
}

export default async function HomePage() {
  const { title, description } = await getSiteSettings();
  
  return (
    <>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            {description}
          </p>
        ) : null}

        <p className="mt-8">
          <Link
            className="inline-flex min-h-10 items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            href="/vinyl"
          >
            View Vinyl Records
          </Link>
        </p>

        <p className="mt-8">
          <Link
            className="inline-flex min-h-10 items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            href="/master-lister"
          >
            Master Lister
          </Link>
        </p>
        
        <p className="mt-4">
          <Link
            className="inline-flex min-h-10 items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            href="/studio"
          >
            Launch Studio
          </Link>
        </p>

        {/* Replace these starter sections with site-specific content. */}
        <section
          id="content"
          aria-labelledby="content-heading"
          className="mt-16 border-t border-border pt-10"
        >
          <h2 id="content-heading" className="text-2xl font-semibold">
            Primary Content
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            Use this section to introduce the site&apos;s primary content.
          </p>

          <article className="mt-8">
            <h3 className="text-xl font-medium">First Topic</h3>
            <p className="mt-2 leading-7 text-muted-foreground">
              Add the first major topic, offering, or collection here.
            </p>
          </article>

          <article className="mt-8">
            <h3 className="text-xl font-medium">Second Topic</h3>
            <p className="mt-2 leading-7 text-muted-foreground">
              Add another important topic, offering, or collection here.
            </p>
          </article>
        </section>

        <section
          id="about"
          aria-labelledby="about-heading"
          className="mt-16 border-t border-border pt-10"
        >
          <h2 id="about-heading" className="text-2xl font-semibold">
            About
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            Add the site&apos;s background, purpose, or team information here.
          </p>

          <aside
            aria-labelledby="additional-heading"
            className="mt-8 border-l-2 border-border pl-5"
          >
            <h3 id="additional-heading" className="text-xl font-medium">
              Additional Information
            </h3>
            <p className="mt-2 leading-7 text-muted-foreground">
              Add supporting details, links, or a callout here.
            </p>
          </aside>
        </section>
    </>
  );
}

