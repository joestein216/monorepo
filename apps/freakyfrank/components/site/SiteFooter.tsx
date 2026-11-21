import Link from "next/link";
import { safeUrl } from "./media";
export function SiteFooter({
  links,
  email,
}: {
  links: { label: string | null; href: string | null }[];
  email?: string | null;
}) {
  return (
    <footer data-slot="site-footer">
      <p>
        Freaky Frank <span>New York underground.</span>
      </p>
      <nav aria-label="Social links">
        <ul>
          {links
            .filter((link) => safeUrl(link.href))
            .map((link) => (
              <li key={link.href}>
                <a href={safeUrl(link.href)}>{link.label}</a>
              </li>
            ))}
        </ul>
      </nav>
      <address>{email && <a href={`mailto:${email}`}>{email}</a>}</address>
      <Link href="/epk">Electronic press kit</Link>
    </footer>
  );
}
