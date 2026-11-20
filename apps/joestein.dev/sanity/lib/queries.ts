import { defineQuery } from "next-sanity";

export const PORTFOLIO_CONTEXT_QUERY = defineQuery(`{
  "siteSettings": *[_type == "siteSettings" && _id == "site-settings"][0]{
    identity{brandName}, modes{prompt{label, navigationLabel}, overview{label, navigationLabel}},
    navigation{colophonLabel},
    promptExperience{invitation, placeholder, submitLabel, pendingLabel, starterQuestions[]{_key, question}}
  },
  "colophonSummary": *[_type == "page" && slug.current == "colophon"] | order(_updatedAt desc)[0]{
    title, subtitle, "plainText": pt::text(body),
    "technicalBlocks": body[_type in ["mermaidDiagram", "codeBlock"]]{_key, _type, caption, language, code}
  },
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

export const COLOPHON_PAGE_QUERY = defineQuery(`
  *[_type == "page" && slug.current == "colophon"] | order(_updatedAt desc)[0]{
    _id, title, subtitle, eyebrow, "slug": slug.current, body, "plainText": pt::text(body)
  }
`);

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "site-settings"][0]{
    identity{brandName}, modes{prompt{label, navigationLabel}, overview{label, navigationLabel}},
    navigation{colophonLabel},
    promptExperience{invitation, placeholder, submitLabel, pendingLabel, starterQuestions[]{_key, question}}
  }
`);
