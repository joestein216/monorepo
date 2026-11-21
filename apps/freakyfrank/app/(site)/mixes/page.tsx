import { getPublicMixes } from "../../../sanity/lib/public-site";
import { MixList } from "../../../components/site/catalogs";
import { JsonLd } from "../../../components/site/JsonLd";
import { mixSchemas, siteMetadata } from "../../../components/site/seo";
export async function generateMetadata() {
  return siteMetadata(
    "/mixes",
    "Mixes & Live Sets",
    "Listen to Freaky Frank’s DJ mixes and live sets. House, techno, and New York underground selections.",
  );
}
export default async function MixesPage() {
  const mixes = (await getPublicMixes()) || [];
  return (
    <main id="main" tabIndex={-1}>
      <header data-slot="page-heading">
        <p data-slot="eyebrow">Turn it up</p>
        <h1>Sound without limits.</h1>
        <p>
          Live sets and selections. Load a mix below, then press play in the
          dock. Keep exploring while the music plays.
        </p>
      </header>
      <section data-slot="band" aria-labelledby="mix-catalog">
        <h2 id="mix-catalog">All mixes &amp; live sets</h2>
        <MixList mixes={mixes} />
      </section>
      <JsonLd
        data={{ "@context": "https://schema.org", "@graph": mixSchemas(mixes) }}
      />
    </main>
  );
}
