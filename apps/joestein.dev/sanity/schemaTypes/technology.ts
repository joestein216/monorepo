import { defineField, defineType } from "sanity";

export const technology = defineType({
  name: "technology",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "name" }, validation: (rule) => rule.required() }),
    defineField({ name: "category", type: "string", options: { list: ["Frontend & UI", "Backend & Systems", "CMS & Data", "Commerce & POS", "AI & Agents"] } }),
    defineField({ name: "iconKey", type: "string" }),
  ],
});
