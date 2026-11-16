import { PortfolioPrototype } from "@/components/portfolio-prototype";
import { getSanityContext } from "@/lib/sanity-context";

export default async function Home() {
  const context = await getSanityContext().catch(() => null);
  return <PortfolioPrototype
    context={context ?? { about: null, projects: [], roles: [], technologies: [] }}
    loadError={context === null}
  />;
}
