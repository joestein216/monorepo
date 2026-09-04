import { defineArrayMember, defineField, defineType } from "sanity"

export const photo = defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({ name: "caption", title: "Caption", type: "string" }),
        defineField({ name: "credit", title: "Credit", type: "string" }),
      ],
    }),
    defineField({
      name: "events",
      title: "Related events",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "event" }] })],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "artists",
      title: "Related artists",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "artistPage" }] })],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "usage",
      title: "Approved uses",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "tags",
        list: [
          { title: "Album", value: "album" },
          { title: "Event gallery", value: "event-gallery" },
          { title: "Home page", value: "homepage" },
          { title: "Artist EPK", value: "epk" },
          { title: "Press", value: "press" },
          { title: "Social", value: "social" },
        ],
      },
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "tags",
      title: "Descriptive tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      validation: (rule) => rule.unique(),
    }),
    defineField({ name: "takenAt", title: "Date photographed", type: "datetime" }),
  ],
  preview: {
    select: { title: "title", subtitle: "image.caption", media: "image" },
  },
})
