import { getPublicEvents } from "../../../sanity/lib/public-site";
import { EventArchive } from "../../../components/site/catalogs";
import { JsonLd } from "../../../components/site/JsonLd";
import { eventSchemas, siteMetadata } from "../../../components/site/seo";
export async function generateMetadata() {
  return siteMetadata(
    "/events",
    "Events",
    "Find Freaky Frank’s upcoming DJ dates and explore the archive of New York underground nights.",
  );
}
export default async function EventsPage() {
  const data = await getPublicEvents();
  return (
    <main id="main" tabIndex={-1}>
      <header data-slot="page-heading">
        <p data-slot="eyebrow">Together in the underground</p>
        <h1>The nights.</h1>
        <p>Upcoming dances and the nights that brought us here.</p>
      </header>
      <EventArchive {...data} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": eventSchemas(data.upcoming),
        }}
      />
    </main>
  );
}
