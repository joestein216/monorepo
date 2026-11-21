import { getPublicVideos } from "../../../sanity/lib/public-site";
import { VideoList } from "../../../components/site/catalogs";
import { JsonLd } from "../../../components/site/JsonLd";
import { videoSchemas, siteMetadata } from "../../../components/site/seo";
export async function generateMetadata() {
  return siteMetadata(
    "/videos",
    "Videos",
    "Watch Freaky Frank live: club sets, late-night sessions, and moments from the New York underground dance floor.",
  );
}
export default async function VideosPage() {
  const videos = (await getPublicVideos()) || [];
  return (
    <main id="main" tabIndex={-1}>
      <header data-slot="page-heading">
        <p data-slot="eyebrow">Inside the room</p>
        <h1>From the floor.</h1>
        <p>Live sessions, late nights, and the energy between the records.</p>
      </header>
      <section data-slot="band" aria-labelledby="video-catalog">
        <h2 id="video-catalog">Live &amp; on film</h2>
        <VideoList videos={videos} />
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": videoSchemas(videos),
        }}
      />
    </main>
  );
}
