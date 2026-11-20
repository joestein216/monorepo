import { defineArrayMember, defineField, defineType } from "sanity";

export const role = defineType({
  name: "role",
  type: "document",
  fields: [
    defineField({ name: "company", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "dateRange", type: "string" }),
    defineField({ name: "order", type: "number" }),
    defineField({ name: "roleSummary", type: "text" }),
    defineField({ name: "technologies", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "technology" }] })], validation: (rule) => rule.unique().error("Each technology can only be listed once.") }),
    defineField({ name: "achievements", type: "array", of: [defineArrayMember({
      name: "achievement", type: "object", fields: [
        defineField({ name: "bullet", type: "string" }),
        defineField({ name: "deepDive", type: "text" }),
        defineField({ name: "tracks", type: "array", of: [defineArrayMember({ type: "string" })], options: { list: ["Frontend Architecture", "Full-Stack Systems", "Commerce & POS", "AI & Automation", "Content Architecture", "Product Engineering"] } }),
        defineField({ name: "includeInDefaultOverview", type: "boolean", initialValue: false }),
        defineField({ name: "technologies", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "technology" }] })], validation: (rule) => rule.unique().error("Each technology can only be listed once.") }),
      ],
    })] }),
  ],
  preview: { select: { title: "company", subtitle: "title" } },
  orderings: [{ title: "Most recent first", name: "chronological", by: [{ field: "order", direction: "asc" }] }],
});
