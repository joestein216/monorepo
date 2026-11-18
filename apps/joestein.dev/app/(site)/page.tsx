import { PortfolioPrototype } from "@/components/portfolio-prototype";
import { getSanityContext } from "@/lib/sanity-context";

export default async function Home({ searchParams }: PageProps<"/">) {
  const [context, params] = await Promise.all([getSanityContext().catch(() => null), searchParams]);
  return <PortfolioPrototype
    context={context ?? { about: null, projects: [], roles: [], technologies: [], colophonSummary: null, starterTopics: [] }}
    initialMode={params.mode === "overview" ? "overview" : "prompt"}
    loadError={context === null}
  />;
}
