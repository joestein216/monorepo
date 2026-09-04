import { defineArrayMember, defineField, defineType } from "sanity"

export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  groups: [
    { name: "overview", title: "Overview", default: true },
    { name: "lineup", title: "Lineup" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Event title",
      type: "string",
      group: "overview",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "chapterLabel",
      title: "Chapter label",
      type: "string",
      description: "For example, Chapter One.",
      group: "overview",
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
      name: "organizer",
      title: "Organizer",
      type: "string",
      group: "overview",
      initialValue: "Freaky Frank",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "overview",
      options: {
        list: [
          { title: "Upcoming", value: "upcoming" },
          { title: "To be announced", value: "tba" },
          { title: "Past", value: "past" },
          { title: "Cancelled", value: "cancelled" },
        ],
        layout: "radio",
      },
      initialValue: "upcoming",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "eventDate", title: "Event date", type: "date", group: "overview" }),
    defineField({ name: "startsAt", title: "Starts", type: "datetime", group: "overview" }),
    defineField({ name: "endsAt", title: "Ends", type: "datetime", group: "overview" }),
    defineField({
      name: "dateDisplay",
      title: "Public date label",
      type: "string",
      description: "Use this when the public wording is more useful than a machine-formatted time.",
      group: "overview",
    }),
    defineField({ name: "venue", title: "Venue", type: "string", group: "overview" }),
    defineField({ name: "location", title: "Location", type: "string", group: "overview" }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 4,
      group: "overview",
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: "heroImage",
      title: "Event image",
      type: "image",
      group: "overview",
      options: { hotspot: true },
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
      name: "lineup",
      title: "Lineup",
      type: "array",
      group: "lineup",
      of: [
        defineArrayMember({
          name: "lineupArtist",
          title: "Lineup artist",
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Display name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "role", title: "Role or billing", type: "string" }),
            defineField({
              name: "artist",
              title: "Artist profile",
              type: "reference",
              to: [{ type: "artistPage" }],
            }),
          ],
          preview: { select: { title: "name", subtitle: "role" } },
        }),
      ],
    }),
    defineField({
      name: "eventUrl",
      title: "Event or ticket URL",
      type: "url",
      group: "overview",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
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
    select: { title: "title", chapter: "chapterLabel", date: "dateDisplay", media: "heroImage" },
    prepare({ title, chapter, date, media }) {
      return { title, subtitle: [chapter, date].filter(Boolean).join(" · "), media }
    },
  },
})
