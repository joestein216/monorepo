import { defineArrayMember, defineField, defineType } from "sanity"

export const photoAlbum = defineType({
  name: "photoAlbum",
  title: "Photo Album",
  type: "document",
  groups: [
    { name: "overview", title: "Overview", default: true },
    { name: "photos", title: "Photos" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Album title",
      type: "string",
      group: "overview",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      group: "overview",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 4,
      group: "overview",
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: "relatedEvent",
      title: "Related event",
      type: "reference",
      to: [{ type: "event" }],
      group: "overview",
    }),
    defineField({
      name: "coverPhoto",
      title: "Cover photo",
      type: "reference",
      to: [{ type: "photo" }],
      options: { filter: '"album" in usage' },
      group: "overview",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "photos",
      title: "Ordered photos",
      type: "array",
      group: "photos",
      of: [
        defineArrayMember({
          name: "photoPlacement",
          title: "Photo",
          type: "object",
          fields: [
            defineField({
              name: "photo",
              title: "Photo",
              type: "reference",
              to: [{ type: "photo" }],
              options: { filter: '"album" in usage' },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "captionOverride",
              title: "Album caption override",
              type: "string",
              description: "Leave blank to use the photo’s canonical caption.",
            }),
          ],
          preview: {
            select: { title: "photo.title", subtitle: "captionOverride", media: "photo.image" },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "showOnHome",
      title: "Show on home page",
      type: "boolean",
      group: "overview",
      initialValue: false,
    }),
    defineField({
      name: "sortOrder",
      title: "Display order",
      type: "number",
      group: "overview",
      initialValue: 100,
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "relatedEvent.title", media: "coverPhoto.image" },
  },
})
