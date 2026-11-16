import { defineQuery } from "next-sanity";

export const PORTFOLIO_CONTEXT_QUERY = defineQuery(`{
  "about": *[_type == "about" && _id == "about"][0]{
    _id, headline, intro, story, nextRole, advisory, contact,
    downloads[]{_key, label, description, "url": file.asset->url, "filename": file.asset->originalFilename}
  },
  "projects": *[_type == "project"] | order(order asc, title asc){
    _id, title, "slug": slug.current, subtitle, order, liveUrl, repoUrl, problem, architectureNotes,
    techStack[]->{_id, name, "slug": slug.current, category, iconKey}
  },
  "roles": *[_type == "role"] | order(order asc, company asc){
    _id, company, title, dateRange, order, roleSummary,
    technologies[]->{_id, name, "slug": slug.current, category, iconKey},
    achievements[]{_key, bullet, deepDive, tracks, includeInDefaultOverview,
      technologies[]->{_id, name, "slug": slug.current, category, iconKey}}
  },
  "technologies": *[_type == "technology"] | order(category asc, name asc){_id, name, "slug": slug.current, category, iconKey}
}`);
