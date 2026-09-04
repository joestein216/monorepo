import Link from "next/link"

export function SiteHeader() {
  return (
    <>
      <a
        className="sr-only fixed left-4 top-4 z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only"
        href="#main-content"
      >
        Skip to main content
      </a>
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-sm font-semibold tracking-wide" href="/">
            Freaky Frank
          </Link>
          <nav aria-label="Primary navigation">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <li>
                <Link className="transition-colors hover:text-foreground" href="/events">
                  Events
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-foreground" href="/albums">
                  Albums
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-foreground" href="/artists">
                  Artists
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-foreground" href="/#contact">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  )
}
