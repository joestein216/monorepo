import { defineArrayMember, defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" }, validation: (rule) => rule.required() }),
    defineField({ name: "subtitle", type: "string" }),
    defineField({ name: "order", type: "number" }),
    defineField({ name: "liveUrl", type: "url", validation: (rule) => rule.uri({ scheme: ["http", "https"] }) }),
    defineField({ name: "repoUrl", type: "url", validation: (rule) => rule.uri({ scheme: ["http", "https"] }) }),
    defineField({ name: "problem", type: "text" }),
    defineField({ name: "techStack", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "technology" }] })], validation: (rule) => rule.unique().error("Each technology can only be listed once.") }),
    defineField({ name: "architectureNotes", type: "array", of: [defineArrayMember({ type: "block" })] }),
  ],
  orderings: [{ title: "Portfolio order", name: "portfolioOrder", by: [{ field: "order", direction: "asc" }] }],
});
