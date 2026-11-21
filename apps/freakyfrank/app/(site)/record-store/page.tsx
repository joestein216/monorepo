import { getPublicStore } from "../../../sanity/lib/public-site";
import { SiteImage } from "../../../components/site/SiteImage";
import { StoreItems } from "../../../components/site/catalogs";
import { JsonLd } from "../../../components/site/JsonLd";
import { siteMetadata, SITE_URL } from "../../../components/site/seo";
import { safeUrl } from "../../../components/site/media";
export async function generateMetadata() {
  return siteMetadata(
    "/record-store",
    "Record Store",
    "Explore Freaky Frank’s curated record store. Vinyl, underground releases, apparel, and selections from the crates.",
  );
}
export default async function RecordStorePage() {
  const { settings, items } = await getPublicStore();
  const title = settings?.recordStoreTitle || "Deep in the crates.";
  const description =
    settings?.recordStoreDescription ||
    "A love for records. A connection to the underground. Vinyl, releases, and pieces selected by Freaky Frank.";
  const products = items.map((item) => ({
    "@type": "Product",
    name: item.title,
    description: item.description || undefined,
    image: item.image?.src || undefined,
    url: `${SITE_URL}/record-store#item-${item.slug || item._id}`,
    offers:
      item.price != null && safeUrl(item.purchaseUrl)
        ? {
            "@type": "Offer",
            price: item.price,
            priceCurrency: item.currency || "USD",
            url: safeUrl(item.purchaseUrl),
            availability: item.availability
              ? `https://schema.org/${item.availability === "sold-out" ? "OutOfStock" : item.availability === "preorder" ? "PreOrder" : "InStock"}`
              : undefined,
          }
        : undefined,
  }));
  return (
    <main id="main" tabIndex={-1}>
      <header data-slot="page-heading">
        <p data-slot="eyebrow">Freaky Frank’s record store</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <SiteImage image={settings?.recordStoreHeroImage} priority />
      </header>
      <section data-slot="band" aria-labelledby="store-catalog">
        <h2 id="store-catalog">The collection</h2>
        <StoreItems items={items} />
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "MusicStore",
              name: "Freaky Frank Record Store",
              url: `${SITE_URL}/record-store`,
              description,
              image: settings?.recordStoreHeroImage?.src || undefined,
            },
            ...products,
          ],
        }}
      />
    </main>
  );
}
