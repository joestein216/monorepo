import { defineField, defineType } from "sanity";

export const recordStoreItem = defineType({
  name: "recordStoreItem",
  title: "Record Store Item",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "slug", type: "slug", options: { source: "title" } }),
    defineField({
      name: "category",
      type: "string",
      options: { list: ["vinyl", "apparel", "release"] },
    }),
    defineField({ name: "description", type: "text" }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string" })],
    }),
    defineField({
      name: "price",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "currency",
      type: "string",
      initialValue: "USD",
      validation: (rule) => rule.regex(/^[A-Z]{3}$/),
    }),
    defineField({
      name: "purchaseUrl",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "availability",
      type: "string",
      options: { list: ["in-stock", "sold-out", "preorder"] },
    }),
    defineField({ name: "sortOrder", type: "number" }),
  ],
});
