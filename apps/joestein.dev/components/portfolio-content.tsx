import { PortableText } from "@portabletext/react";
import type { PortfolioContext } from "@/lib/sanity-context";
import type { PortfolioReceipt } from "@/lib/portfolio-tools";
import type { StarterTopic, FollowUpSuggestion } from "@/lib/portfolio-topics";

export function TopicNavigation({ topics, poppedTopicId, suggestions, disabled, onTopic, onFollowUp }: {
  topics: StarterTopic[];
  poppedTopicId: string | null;
  suggestions: FollowUpSuggestion[];
  disabled: boolean;
  onTopic: (topic: StarterTopic) => void;
  onFollowUp: (suggestion: FollowUpSuggestion) => void;
}) {
  if (!topics.length) return null;
  return <nav aria-label="Portfolio topics" data-slot="topic-bladder">
    <ul data-slot="toc-topics">
      {topics.map((topic) => <li key={topic.id} data-topic-id={topic.id} data-topic-state={poppedTopicId === topic.id ? "popped" : "ready"}>
        {poppedTopicId === topic.id && suggestions.length === 3 ? (
          <ul aria-label={`${topic.label} follow-ups`} data-slot="toc-subtopics">
            {suggestions.map((suggestion) => <li key={suggestion.prompt}>
              <button type="button" data-bubble-tier="secondary" disabled={disabled} onClick={() => onFollowUp(suggestion)}>{suggestion.label}</button>
            </li>)}
          </ul>
        ) : <button type="button" data-bubble-tier="primary" disabled={disabled} onClick={() => onTopic(topic)}>{topic.label}</button>}
      </li>)}
    </ul>
  </nav>;
}

export function safeUrl(value?: string | null) {
  if (!value) return undefined;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? value : undefined; }
  catch { return undefined; }
}

function RichText({ value }: { value: NonNullable<PortfolioContext["about"]>["story"] }) {
  return value?.length ? <PortableText value={value} components={{ marks: {
    link: ({ value, children }) => safeUrl(value?.href) ? <a href={safeUrl(value?.href)}>{children}</a> : <>{children}</>,
  } }} /> : null;
}

type TechnologyTags = PortfolioContext["roles"][number]["technologies"];
function Technologies({ items }: { items: TechnologyTags }) {
  return items?.some(Boolean) ? <ul aria-label="Technologies">{items.map((tech) => tech && <li key={tech._id}>{tech.name}</li>)}</ul> : null;
}

export function ReceiptCard({ receipt }: { receipt: PortfolioReceipt }) {
  const metadata = receipt.type === "achievement"
    ? [receipt.roleTitle, receipt.company, receipt.dateRange].filter(Boolean).join(" · ")
    : [receipt.title, receipt.subtitle].filter(Boolean).join(" · ");

  return <article data-slot="receipt-card" aria-label={receipt.type === "achievement" ? "Achievement receipt" : "Project receipt"}>
    <p>{receipt.tailoredNarrative}</p>
    <Technologies items={receipt.technologies} />
    <footer data-slot="receipt-footer">
      <small>{metadata}</small>{" "}
      {receipt.type === "project" && <>
        {safeUrl(receipt.liveUrl) && <><a href={safeUrl(receipt.liveUrl)}>Live system</a>{" "}</>}
        {safeUrl(receipt.repoUrl) && <><a href={safeUrl(receipt.repoUrl)}>Source</a>{" "}</>}
      </>}
      <small>Score: {receipt.relevanceScore}/100 · {receipt.matchReason}</small>
    </footer>
  </article>;
}

export function AboutSection({ about }: { about: PortfolioContext["about"] }) {
  return <section aria-label="About Joe">
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
        {about.advisory.focusAreas?.map((area) => <article key={area._key}>
          <h4>{area.title}</h4><p>{area.summary}</p>
        </article>)}
      </section>}
    </> : <p>Joe’s introduction has not been published yet.</p>}
  </section>;
}

export function ProjectsSection({ projects }: { projects: PortfolioContext["projects"] }) {
  return <section aria-label="Projects"><h2>Projects</h2>
    {projects.length ? projects.map((project) => <article key={project._id}>
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

export function ExperienceSection({ roles, overview = false }: { roles: PortfolioContext["roles"]; overview?: boolean }) {
  return <section aria-label="Experience"><h2>Experience</h2>
    {roles.length ? roles.map((role) => <article key={role._id}>
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

type Downloads = NonNullable<PortfolioContext["about"]>["downloads"];
export function DownloadsSection({ downloads }: { downloads: Downloads }) {
  return <section aria-label="Downloads"><h2>Downloads</h2>
    {downloads?.length ? <ul>{downloads.map((download) => <li key={download._key}>
      {safeUrl(download.url) ? <a href={safeUrl(download.url)} download>{download.label ?? download.filename ?? "Download resume"}</a> : <span>{download.label} (file unavailable)</span>}
      {download.description && <p>{download.description}</p>}
    </li>)}</ul> : <p>No downloads are published yet.</p>}
  </section>;
}

export function ContactSection({ contact }: { contact: NonNullable<PortfolioContext["about"]>["contact"] }) {
  return <section aria-label="Contact"><h2>Contact</h2>
    {contact ? <address><ul>
      {contact.email && <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
      {safeUrl(contact.github) && <li><a href={safeUrl(contact.github)}>GitHub</a></li>}
      {safeUrl(contact.linkedin) && <li><a href={safeUrl(contact.linkedin)}>LinkedIn</a></li>}
    </ul></address> : <p>Contact information is not published yet.</p>}
  </section>;
}

export function Overview({ context }: { context: PortfolioContext }) {
  return <>
    <AboutSection about={context.about} />
    <ProjectsSection projects={context.projects} />
    <ExperienceSection roles={context.roles} overview />
    <DownloadsSection downloads={context.about?.downloads ?? []} />
    <ContactSection contact={context.about?.contact ?? null} />
  </>;
}
