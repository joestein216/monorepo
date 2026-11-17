import type { PortfolioData } from "./portfolio-topics";

// A selectable receipt is a project or an individual achievement, never a role.
// Keep source evidence separate from the metadata returned by server hydration.
export function getReceiptCatalog(context: PortfolioData) {
  const records = [
    ...context.projects.map((project) => ({
      id: project._id,
      type: "project" as const,
      evidence: { problem: project.problem, architectureNotes: project.architectureNotes },
      metadata: {
        title: project.title, subtitle: project.subtitle, technologies: project.techStack,
        liveUrl: project.liveUrl, repoUrl: project.repoUrl, architectureNotes: project.architectureNotes,
      },
    })),
    ...context.roles.flatMap((role) => (role.achievements ?? []).map((achievement) => ({
      id: achievement._key,
      type: "achievement" as const,
      evidence: { bullet: achievement.bullet, deepDive: achievement.deepDive, tracks: achievement.tracks },
      metadata: {
        roleId: role._id, roleTitle: role.title, company: role.company, dateRange: role.dateRange,
        technologies: achievement.technologies, deepDive: achievement.deepDive,
      },
    }))),
  ];
  const counts = new Map<string, number>();
  for (const record of records) counts.set(record.id, (counts.get(record.id) ?? 0) + 1);
  return records.filter((record) => counts.get(record.id) === 1);
}

export function getPortfolioPromptData(context: PortfolioData) {
  return {
    about: context.about,
    technologies: context.technologies,
    // Role summaries provide career context but expose no selectable parent IDs.
    roles: context.roles.map(({ company, title, dateRange, roleSummary, technologies }) => ({
      company, title, dateRange, roleSummary, technologies,
    })),
    receiptCatalog: getReceiptCatalog(context).map((record) => ({
      id: record.id, type: record.type, ...record.evidence,
      ...Object.fromEntries(Object.entries(record.metadata).filter(([key]) => key !== "roleId")),
    })),
  };
}
