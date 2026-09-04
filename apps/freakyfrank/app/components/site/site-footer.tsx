import Link from "next/link"

import type { SiteLink } from "../../../sanity/queries/site"

type SiteFooterProps = {
  inquiryEmail?: string | null
  socialLinks?: SiteLink[] | null
}

export function SiteFooter({ inquiryEmail, socialLinks }: SiteFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 text-sm sm:grid-cols-2 sm:items-end">
        <div>
          <Link className="font-semibold tracking-wide" href="/">
            Freaky Frank
          </Link>
          <p className="mt-2 text-muted-foreground">Artists, events, music, and underground culture.</p>
        </div>
        <div className="sm:text-right">
          {inquiryEmail ? (
            <a className="underline underline-offset-4" href={`mailto:${inquiryEmail}`}>
              {inquiryEmail}
            </a>
          ) : null}
          {socialLinks?.length ? (
            <ul className="mt-3 flex flex-wrap gap-4 text-muted-foreground sm:justify-end">
              {socialLinks.map((link) => (
                <li key={link.href || link.label}>
                  <a
                    className="transition-colors hover:text-foreground"
                    href={link.href || "#"}
                    target={link.openInNewTab ? "_blank" : undefined}
                    rel={link.openInNewTab ? "noreferrer" : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-3 text-muted-foreground">© {currentYear} Freaky Frank</p>
        </div>
      </div>
    </footer>
  )
}
