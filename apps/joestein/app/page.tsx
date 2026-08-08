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

const fallbackTitle = "Joe Stein";
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
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Main site navigation and branding */}
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="site-logo text-lg font-semibold">{title}</p>
        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <li>
              <a className="underline-offset-4 hover:underline" href="#content">
                Content
              </a>
            </li>
            <li>
              <a className="underline-offset-4 hover:underline" href="#about">
                About
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Main content area: keep a single h1 for the page topic. */}
      <main className="mx-auto w-full max-w-5xl flex-1 border-y border-border px-6 py-16 sm:py-24">
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
      </main>

      {/* Footer for copyright and legal links */}
      <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-sm text-muted-foreground">
        <p>
          &copy; {currentYear} {title}. All rights reserved.
        </p>
      </footer>
    </>
  );
}

