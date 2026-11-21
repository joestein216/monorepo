import type { Metadata } from "next";
import type { ReactNode } from "react";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { getPublicContact } from "../../sanity/lib/public-site";
import { SiteHeader } from "../../components/site/SiteHeader";
import { SiteFooter } from "../../components/site/SiteFooter";
import { AudioProvider } from "../../components/site/AudioDock";
import { JsonLd } from "../../components/site/JsonLd";
import { artistSchema, SITE_URL } from "../../components/site/seo";
import { DisableDraftMode } from "../components/system/disable-draft-mode";
import "./globals.css";

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };
export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const data = await getPublicContact();
  const links =
    data.artist?.externalLinks ||
    data.settings?.socialLinks ||
    data.home?.socialLinks ||
    [];
  return (
    <html lang="en" data-theme="underground">
      <body>
        <a data-slot="skip-link" href="#main">
          Skip to content
        </a>
        <AudioProvider>
          <SiteHeader logo={data.artist?.primaryLogo || data.settings?.logo} />
          {children}
          <SiteFooter
            email={data.artist?.bookingEmail || data.home?.inquiryEmail}
            links={links}
          />
        </AudioProvider>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              artistSchema(data),
              {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                url: SITE_URL,
                name: "Freaky Frank",
              },
            ],
          }}
        />
        {(await draftMode()).isEnabled && (
          <>
            <VisualEditing />
            <DisableDraftMode />
          </>
        )}
      </body>
    </html>
  );
}
