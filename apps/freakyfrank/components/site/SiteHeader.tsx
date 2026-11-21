"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteImage } from "./SiteImage";
import type { SiteImage as ImageData } from "./types";

const navigation = [
  ["/", "Home"],
  ["/events", "Events"],
  ["/mixes", "Music"],
  ["/videos", "Videos"],
  ["/record-store", "Record Store"],
  ["/contact", "Contact"],
] as const;
export function SiteHeader({ logo }: { logo?: ImageData | null }) {
  const pathname = usePathname();
  return (
    <header data-slot="site-header">
      <Link href="/" aria-label="Freaky Frank home" data-slot="brand">
        {logo ? (
          <SiteImage image={logo} slot="header-logo" priority />
        ) : (
          "FREAKY FRANK"
        )}
      </Link>
      <nav aria-label="Main navigation">
        <ul>
          {navigation.map(([href, label]) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={pathname === href ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <Link href="/epk" data-slot="epk-link">
        EPK
      </Link>
    </header>
  );
}
