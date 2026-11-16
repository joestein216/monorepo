import { defineArrayMember, defineField, defineType } from "sanity";

export const about = defineType({
  name: "about",
  type: "document",
  fields: [
    defineField({ name: "headline", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "intro", type: "text" }),
    defineField({ name: "story", type: "array", of: [defineArrayMember({ type: "block" })] }),
    defineField({ name: "nextRole", type: "object", fields: [
      defineField({ name: "status", type: "string" }),
      defineField({ name: "targetTitles", type: "array", of: [defineArrayMember({ type: "string" })] }),
      defineField({ name: "environmentSummary", type: "text" }),
    ] }),
    defineField({ name: "advisory", type: "object", fields: [
      defineField({ name: "availabilityNote", type: "string" }),
      defineField({ name: "focusAreas", type: "array", of: [defineArrayMember({ name: "focusArea", type: "object", fields: [
        defineField({ name: "title", type: "string" }),
        defineField({ name: "summary", type: "text" }),
      ] })] }),
    ] }),
    defineField({ name: "downloads", type: "array", of: [defineArrayMember({ name: "download", type: "object", fields: [
      defineField({ name: "label", type: "string" }),
      defineField({ name: "description", type: "text" }),
      defineField({ name: "file", type: "file" }),
    ] })] }),
    defineField({ name: "contact", type: "object", fields: [
      defineField({ name: "email", type: "string", validation: (rule) => rule.email() }),
      defineField({ name: "github", type: "url", validation: (rule) => rule.uri({ scheme: ["https"] }) }),
      defineField({ name: "linkedin", type: "url", validation: (rule) => rule.uri({ scheme: ["https"] }) }),
    ] }),
  ],
});
