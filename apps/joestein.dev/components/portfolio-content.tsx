import { useId, useState, type CSSProperties } from "react";
import { Popover } from "@base-ui-components/react/popover";
import { PortableText } from "@portabletext/react";
import type { PortfolioData } from "@/lib/portfolio-topics";
import type { PortfolioReceipt } from "@/lib/portfolio-tools";

export function safeUrl(value?: string | null) {
  if (!value) return undefined;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? value : undefined; }
  catch { return undefined; }
}

function RichText({ value }: { value: NonNullable<PortfolioData["about"]>["story"] }) {
  return value?.length ? <PortableText value={value} components={{ marks: {
    link: ({ value, children }) => safeUrl(value?.href) ? <a href={safeUrl(value?.href)}>{children}</a> : <>{children}</>,
  } }} /> : null;
}

type TechnologyTags = PortfolioData["roles"][number]["technologies"];
function Technologies({ items }: { items: TechnologyTags }) {
  return items?.some(Boolean) ? <ul aria-label="Technologies" data-slot="tech-list" role="list">{items.map((tech) => tech && <li key={tech._id}>{tech.name}</li>)}</ul> : null;
}

export function ReceiptCard({ receipt }: { receipt: PortfolioReceipt }) {
  const [expanded, setExpanded] = useState(false);
  const narrativeId = useId();
  const long = receipt.tailoredNarrative.length > 320;
  const excerpt = receipt.tailoredNarrative.slice(0, 320);
  const cut = excerpt.lastIndexOf(" ");
  const narrative = long && !expanded ? `${excerpt.slice(0, cut > 0 ? cut : 320).trimEnd()}…` : receipt.tailoredNarrative;
  const metadata = receipt.type === "achievement"
    ? [receipt.roleTitle, receipt.company, receipt.dateRange].filter(Boolean).join(" · ")
    : [receipt.title, receipt.subtitle].filter(Boolean).join(" · ");

  return <article data-slot="receipt-card" aria-label={receipt.type === "achievement" ? "Achievement receipt" : "Project receipt"}>
    <p id={narrativeId} data-slot="receipt-narrative">{narrative}
      {long && <> <button type="button" data-slot="receipt-more" aria-expanded={expanded} aria-controls={narrativeId}
        onClick={() => setExpanded((value) => !value)}>{expanded ? "less" : "more..."}</button></>}
    </p>
    <Technologies items={receipt.technologies} />
    <footer data-slot="receipt-footer">
      <small data-slot="receipt-stamp">{metadata}
        {receipt.type === "project" && <>
          {safeUrl(receipt.liveUrl) && <a data-slot="receipt-link" href={safeUrl(receipt.liveUrl)}>Live system ↗</a>}
          {safeUrl(receipt.repoUrl) && <a data-slot="receipt-link" href={safeUrl(receipt.repoUrl)}>Source ↗</a>}
        </>}
      </small>
      <span data-slot="relevance-box">
        {/* Only the data value is dynamic; gauge geometry and ink belong to CSS. */}
        <span data-slot="score-gauge" role="img" aria-label={`Relevance score ${receipt.relevanceScore} out of 100.`} style={{ "--relevance-score": receipt.relevanceScore } as CSSProperties}><span>{receipt.relevanceScore}</span></span>
        {receipt.matchReason && <Popover.Root>
          <Popover.Trigger openOnHover={false} data-slot="info-trigger"
            aria-label={`Relevance score ${receipt.relevanceScore} out of 100. Click for reasoning.`}>(i)</Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner side="top" align="end" data-slot="relevance-positioner">
              <Popover.Popup data-slot="relevance-popover" data-surface="cover" render={<aside />}>
                <Popover.Title data-slot="relevance-title">{receipt.relevanceScore}/100</Popover.Title>
                <Popover.Description>{receipt.matchReason}</Popover.Description>
                <Popover.Close data-slot="popover-close">Close</Popover.Close>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>}
      </span>
    </footer>
  </article>;
}

export function AboutSection({ about }: { about: PortfolioData["about"] }) {
  return <section aria-label="About Joe" data-slot="overview-section">
    <h2>{about?.headline ?? "About Joe"}</h2>
    {about ? <>
      {about.intro && <p>{about.intro}</p>}
      <RichText value={about.story} />
      {about.nextRole && <section aria-label="Next role">
        <h3>Next role</h3>
        {about.nextRole.status && <p>{about.nextRole.status}</p>}
        {about.nextRole.targetTitles?.length ? <ul>{about.nextRole.targetTitles.map((title) => <li key={title}>{title}</li>)}</ul> : null}
        {about.nextRole.environmentSummary && <p>{about.nextRole.environmentSummary}</p>}
      </section>}
      {about.advisory && <section aria-label="Advisory">
        <h3>Advisory</h3>
        {about.advisory.availabilityNote && <p>{about.advisory.availabilityNote}</p>}
        {about.advisory.focusAreas?.map((area) => <article key={area._key} data-slot="overview-card">
          <h4>{area.title}</h4><p>{area.summary}</p>
        </article>)}
      </section>}
    </> : <p>Joe’s introduction has not been published yet.</p>}
  </section>;
}

export function ProjectsSection({ projects }: { projects: PortfolioData["projects"] }) {
  return <section aria-label="Projects" data-slot="overview-section"><h2>Projects</h2>
    {projects.length ? projects.map((project) => <article key={project._id} data-slot="overview-card">
      <h3>{project.title}</h3>
      {project.subtitle && <p>{project.subtitle}</p>}
      {project.problem && <p>{project.problem}</p>}
      <Technologies items={project.techStack} />
      <RichText value={project.architectureNotes} />
      {safeUrl(project.liveUrl) && <p><a href={safeUrl(project.liveUrl)}>Visit {project.title}</a></p>}
      {safeUrl(project.repoUrl) && <p><a href={safeUrl(project.repoUrl)}>Source for {project.title}</a></p>}
    </article>) : <p>No matching projects are published yet.</p>}
  </section>;
}

export function ExperienceSection({ roles, overview = false }: { roles: PortfolioData["roles"]; overview?: boolean }) {
  return <section aria-label="Experience" data-slot="overview-section"><h2>Experience</h2>
    {roles.length ? roles.map((role) => <article key={role._id} data-slot="overview-card">
      <h3>{role.title} at {role.company}</h3>
      {role.dateRange && <p>{role.dateRange}</p>}
      {role.roleSummary && <p>{role.roleSummary}</p>}
      <Technologies items={role.technologies} />
      <ul>{(role.achievements ?? []).filter((achievement) => !overview || achievement.includeInDefaultOverview).map((achievement) => <li key={achievement._key}>
        {achievement.bullet}
        {!overview && achievement.deepDive && <details><summary>Engineering details</summary>
          <p>{achievement.deepDive}</p>
          {achievement.tracks?.length ? <p>Tracks: {achievement.tracks.join(", ")}</p> : null}
          <Technologies items={achievement.technologies} />
        </details>}
      </li>)}</ul>
    </article>) : <p>No matching experience is published.</p>}
  </section>;
}

type Downloads = NonNullable<PortfolioData["about"]>["downloads"];
export function DownloadsSection({ downloads }: { downloads: Downloads }) {
  return <section aria-label="Downloads" data-slot="overview-section"><h2>Downloads</h2>
    {downloads?.length ? <ul>{downloads.map((download) => <li key={download._key}>
      {safeUrl(download.url) ? <a href={safeUrl(download.url)} download>{download.label ?? download.filename ?? "Download resume"}</a> : <span>{download.label} (file unavailable)</span>}
      {download.description && <p>{download.description}</p>}
    </li>)}</ul> : <p>No downloads are published yet.</p>}
  </section>;
}

export function ContactSection({ contact }: { contact: NonNullable<PortfolioData["about"]>["contact"] }) {
  return <section aria-label="Contact" data-slot="overview-section"><h2>Contact</h2>
    {contact ? <address><ul>
      {contact.email && <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
      {safeUrl(contact.github) && <li><a href={safeUrl(contact.github)}>GitHub</a></li>}
      {safeUrl(contact.linkedin) && <li><a href={safeUrl(contact.linkedin)}>LinkedIn</a></li>}
    </ul></address> : <p>Contact information is not published yet.</p>}
  </section>;
}

export function Overview({ context }: { context: PortfolioData }) {
  return <section data-slot="overview-sections" aria-label="Portfolio index">
    <AboutSection about={context.about} />
    <ProjectsSection projects={context.projects} />
    <ExperienceSection roles={context.roles} overview />
    <DownloadsSection downloads={context.about?.downloads ?? []} />
    <ContactSection contact={context.about?.contact ?? null} />
  </section>;
}
