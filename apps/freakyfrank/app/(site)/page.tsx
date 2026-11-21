import Link from "next/link";
import { getPublicHome } from "../../sanity/lib/public-site";
import { SiteImage } from "../../components/site/SiteImage";
import { ParallaxWindow } from "../../components/site/ParallaxWindow";
import {
  EventArchive,
  MixList,
  VideoList,
} from "../../components/site/catalogs";
import { PlayMix } from "../../components/site/AudioDock";
import { JsonLd } from "../../components/site/JsonLd";
import { eventSchemas, siteMetadata } from "../../components/site/seo";

export async function generateMetadata() {
  return siteMetadata(
    "/",
    "Freaky Frank",
    "Freaky Frank: New York underground DJ. Explore house and techno sets, upcoming dates, live videos, and the record store. Book Frank direct.",
  );
}
export default async function HomePage() {
  const data = await getPublicHome();
  const { artist, settings } = data;
  const mixes = data.mixes || [],
    videos = data.videos || [];
  const featured = videos.find((video) => video.externalUrl) || videos[0];
  return (
    <main id="main" tabIndex={-1}>
      <section data-slot="hero" aria-labelledby="hero-title">
        <SiteImage
          image={settings?.heroPortrait || artist?.heroImage}
          priority
          slot="hero-portrait"
        />
        <header data-slot="hero-copy">
          <p data-slot="eyebrow">
            {artist?.positioning || "Long Island roots. New York underground."}
          </p>
          <h1 id="hero-title">
            {artist?.wordmark ? (
              <>
                <span className="sr-only">
                  Freaky Frank — New York underground DJ
                </span>
                <SiteImage
                  image={artist.wordmark}
                  priority
                  slot="wordmark"
                  decorative
                />
              </>
            ) : (
              "Freaky Frank"
            )}
          </h1>
          <p data-slot="hero-statement">
            {settings?.heroStatement ||
              artist?.tagline ||
              "Built for the floor."}
          </p>
          <div data-slot="actions">
            <Link href="#dates" data-variant="primary">
              Upcoming dates
            </Link>
            {mixes[0] ? (
              <PlayMix mix={mixes[0]} />
            ) : (
              <Link href="/mixes">Hear the latest set</Link>
            )}
          </div>
        </header>
        <p data-slot="hero-footnote">
          House / Techno / Underground electronic music
        </p>
      </section>
      <section data-slot="intro" aria-label="About Freaky Frank">
        <p data-slot="eyebrow">A life in the underground</p>
        <p>
          {artist?.shortBio ||
            data.home?.introduction ||
            "From Long Island to the New York dance floor. Explore the music, the nights, and the community."}
        </p>
      </section>
      <ParallaxWindow
        imageUrl={settings?.crowdImage?.src}
        label="Featured transmission"
      >
        <header data-slot="section-heading">
          <p data-slot="eyebrow">Tune in</p>
          <h2>Featured transmission</h2>
        </header>
        {featured ? (
          <VideoList videos={[featured]} />
        ) : (
          <p>Live transmissions coming soon.</p>
        )}
      </ParallaxWindow>
      <EventArchive
        upcoming={data.upcoming}
        past={data.past}
        pending={data.pending}
      />
      <section data-slot="band" aria-labelledby="music-title" id="music">
        <header data-slot="section-heading">
          <p data-slot="eyebrow">No predictable playlists</p>
          <h2 id="music-title">Sound without limits.</h2>
          <Link href="/mixes">Explore all mixes</Link>
        </header>
        <MixList mixes={mixes} />
      </section>
      <ParallaxWindow
        imageUrl={
          settings?.recordStoreHeroImage?.src || settings?.crowdImage?.src
        }
        label="Record store spotlight"
      >
        <p data-slot="eyebrow">For the selectors</p>
        <h2>{settings?.recordStoreTitle || "Deep in the crates."}</h2>
        <p>
          {settings?.recordStoreDescription ||
            "Vinyl, releases, and pieces from the underground. A collection with a story behind every selection."}
        </p>
        <Link href="/record-store" data-variant="primary">
          Enter the record store
        </Link>
      </ParallaxWindow>
      <section data-slot="band" aria-labelledby="floor-title">
        <header data-slot="section-heading">
          <p data-slot="eyebrow">The music. The people. The nights.</p>
          <h2 id="floor-title">From the floor</h2>
          <Link href="/videos">All videos</Link>
        </header>
        <VideoList videos={videos} />
        {data.updates.length > 0 && (
          <section aria-labelledby="family-title">
            <h2 id="family-title">Family &amp; updates</h2>
            <ul data-slot="updates">
              {data.updates.map((update) => (
                <li key={update._id}>
                  <article>
                    <SiteImage image={update.image} />
                    <h3>{update.title}</h3>
                    <p>{update.summary}</p>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>
      <section data-slot="booking-band" aria-labelledby="booking-title">
        <p data-slot="eyebrow">Let’s build a night.</p>
        <h2 id="booking-title">See you on the floor.</h2>
        <Link href="/contact" data-variant="primary">
          Booking &amp; contact
        </Link>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": eventSchemas(data.upcoming),
        }}
      />
    </main>
  );
}
