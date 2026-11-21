import Link from "next/link";
import { getPublicContact } from "../../../sanity/lib/public-site";
import { siteMetadata } from "../../../components/site/seo";
import { safeUrl } from "../../../components/site/media";
export async function generateMetadata() {
  return siteMetadata(
    "/contact",
    "Contact & Booking",
    "Book Freaky Frank for club nights, festivals, and underground events. Booking, management, press, and electronic press kit.",
  );
}
export default async function ContactPage() {
  const { artist, settings, home } = await getPublicContact();
  const email = artist?.bookingEmail || home?.inquiryEmail;
  const contacts = [
    ["Booking inquiries", email],
    ["Management", settings?.managementEmail || email],
    ["Press", settings?.pressEmail || email],
  ];
  const links =
    artist?.externalLinks || settings?.socialLinks || home?.socialLinks || [];
  return (
    <main id="main" tabIndex={-1}>
      <header data-slot="page-heading">
        <p data-slot="eyebrow">Make a connection</p>
        <h1>Let’s build a night.</h1>
        <p>Clubs, festivals, after-hours, and the unexpected. Get in touch.</p>
      </header>
      <section data-slot="band" aria-labelledby="contact-details">
        <h2 id="contact-details">Contact &amp; booking</h2>
        <address data-slot="contacts">
          {contacts.map(([label, address]) => (
            <section key={label}>
              <h3>{label}</h3>
              {address ? (
                <a href={`mailto:${address}`}>{address}</a>
              ) : (
                <p>Contact details will be announced here.</p>
              )}
            </section>
          ))}
        </address>
        <p>
          For booking, include the event date, venue, city, and a little about
          the night you have in mind.
        </p>
        <Link href="/epk" data-variant="primary">
          View the electronic press kit
        </Link>
      </section>
      <section data-slot="band" aria-labelledby="connect">
        <h2 id="connect">Stay connected</h2>
        <ul data-slot="social-links">
          {links
            .filter((link) => safeUrl(link.href))
            .map((link) => (
              <li key={link._key}>
                <a href={safeUrl(link.href)}>{link.label}</a>
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}
