import { defineArrayMember, defineField, defineType } from "sanity"

export const artistPage = defineType({
  name: "artistPage",
  title: "Artist EPK",
  type: "document",
  groups: [
    { name: "overview", title: "Overview", default: true },
    { name: "story", title: "Story & credits" },
    { name: "media", title: "Media" },
    { name: "events", title: "Events" },
    { name: "booking", title: "Booking & press" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Artist name",
      type: "string",
      group: "overview",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "realName",
      title: "Real name",
      type: "string",
      group: "overview",
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      group: "overview",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "positioning",
      title: "Positioning line",
      type: "string",
      description: "A factual one-line description, such as “New York DJ and underground-event builder.”",
      group: "overview",
      validation: (rule) => rule.max(90),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "overview",
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "location",
      title: "Based in",
      type: "string",
      group: "overview",
    }),
    defineField({
      name: "activeSince",
      title: "Active since",
      type: "string",
      description: "Use a durable label such as “1990s,” not an age that will need annual updates.",
      group: "overview",
    }),
    defineField({
      name: "genres",
      title: "Genres",
      type: "array",
      group: "overview",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      validation: (rule) => rule.unique().max(6),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
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
      name: "primaryLogo",
      title: "Primary logo or sigil",
      type: "image",
      group: "overview",
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "wordmark",
      title: "Wordmark",
      type: "image",
      group: "overview",
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "shortBio",
      title: "Short bio",
      type: "text",
      rows: 5,
      description: "The 50–80 word version for lineups and quick press use.",
      group: "story",
      validation: (rule) => rule.required().max(650),
    }),
    defineField({
      name: "biography",
      title: "Full bio",
      type: "portableText",
      group: "story",
    }),
    defineField({
      name: "careerHighlights",
      title: "Selected history",
      type: "array",
      group: "story",
      of: [
        defineArrayMember({
          name: "careerHighlight",
          title: "Career highlight",
          type: "object",
          fields: [
            defineField({ name: "label", title: "Date or label", type: "string" }),
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
          ],
          preview: {
            select: { title: "title", subtitle: "label" },
          },
        }),
      ],
    }),
    defineField({
      name: "collaborations",
      title: "Collaborations",
      type: "array",
      group: "story",
      of: [
        defineArrayMember({
          name: "collaboration",
          title: "Collaboration",
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Project name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "with", title: "With", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
            defineField({
              name: "url",
              title: "Project link",
              type: "url",
              validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "with" },
          },
        }),
      ],
    }),
    defineField({
      name: "audioEmbeds",
      title: "Featured audio",
      type: "array",
      group: "media",
      of: [
        defineArrayMember({
          name: "audioEmbed",
          title: "Audio embed",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "provider",
              title: "Provider",
              type: "string",
              options: {
                list: [
                  { title: "HearThis", value: "hearthis" },
                  { title: "Mixcloud", value: "mixcloud" },
                  { title: "SoundCloud", value: "soundcloud" },
                  { title: "Spotify", value: "spotify" },
                  { title: "YouTube", value: "youtube" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "sourceUrl",
              title: "Public track page",
              type: "url",
              validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
            }),
            defineField({
              name: "embedUrl",
              title: "Embed URL",
              type: "url",
              description: "Paste only the iframe src URL. Raw embed HTML is intentionally not stored.",
              validation: (rule) => rule.required().uri({ scheme: ["https"] }),
            }),
            defineField({ name: "details", title: "Details", type: "string" }),
          ],
          preview: {
            select: { title: "title", subtitle: "provider" },
          },
        }),
      ],
    }),
    defineField({
      name: "videos",
      title: "Featured video",
      type: "array",
      group: "media",
      of: [
        defineArrayMember({
          name: "artistVideo",
          title: "Video",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "file",
              title: "Uploaded clip",
              type: "file",
              options: { accept: "video/*" },
            }),
            defineField({
              name: "externalUrl",
              title: "External or embed URL",
              type: "url",
              validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
            }),
            defineField({ name: "caption", title: "Caption", type: "text", rows: 2 }),
            defineField({
              name: "poster",
              title: "Poster image",
              type: "image",
              options: { hotspot: true },
              fields: [
                defineField({ name: "alt", title: "Alternative text", type: "string" }),
              ],
            }),
          ],
          preview: {
            select: { title: "title", media: "poster" },
          },
        }),
      ],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      group: "media",
      of: [
        defineArrayMember({
          type: "image",
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
      ],
    }),
    defineField({
      name: "events",
      title: "Events",
      type: "array",
      group: "events",
      of: [
        defineArrayMember({
          name: "artistEvent",
          title: "Event",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Event name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "status",
              title: "Status",
              type: "string",
              options: {
                list: [
                  { title: "Confirmed", value: "confirmed" },
                  { title: "Details pending", value: "pending" },
                  { title: "Past", value: "past" },
                  { title: "Cancelled", value: "cancelled" },
                ],
                layout: "radio",
              },
              initialValue: "confirmed",
            }),
            defineField({ name: "startsAt", title: "Starts", type: "datetime" }),
            defineField({ name: "endsAt", title: "Ends", type: "datetime" }),
            defineField({
              name: "dateDisplay",
              title: "Public date label",
              type: "string",
              description: "Optional. Useful while a precise set time is not yet confirmed.",
            }),
            defineField({ name: "venue", title: "Venue", type: "string" }),
            defineField({ name: "location", title: "Location", type: "string" }),
            defineField({ name: "details", title: "Details", type: "text", rows: 2 }),
            defineField({
              name: "url",
              title: "Event or ticket link",
              type: "url",
              validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "dateDisplay" },
          },
        }),
      ],
    }),
    defineField({
      name: "bookingEmail",
      title: "Booking email",
      type: "email",
      group: "booking",
    }),
    defineField({
      name: "bookingLabel",
      title: "Booking call to action",
      type: "string",
      group: "booking",
      initialValue: "Booking inquiries",
    }),
    defineField({
      name: "externalLinks",
      title: "Artist links",
      type: "array",
      group: "booking",
      of: [defineArrayMember({ type: "link" })],
    }),
    defineField({
      name: "pressAssets",
      title: "Press downloads",
      type: "array",
      group: "booking",
      of: [
        defineArrayMember({
          name: "pressAsset",
          title: "Press asset",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "format", title: "Format or note", type: "string" }),
            defineField({
              name: "image",
              title: "Image asset",
              type: "image",
              description: "Use this for downloadable press photos and logos.",
            }),
            defineField({ name: "file", title: "File", type: "file" }),
            defineField({
              name: "externalUrl",
              title: "External file URL",
              type: "url",
              validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "format" },
          },
        }),
      ],
    }),
    defineField({
      name: "technicalRider",
      title: "Technical rider",
      type: "object",
      group: "booking",
      fields: [
        defineField({
          name: "summary",
          title: "Public summary",
          type: "text",
          rows: 3,
          description: "Keep this promoter-facing and model-agnostic unless the exact setup is confirmed.",
        }),
        defineField({
          name: "preferredSetup",
          title: "Preferred setup",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
        }),
        defineField({ name: "boothMonitors", title: "Booth monitors", type: "string" }),
        defineField({
          name: "mediaFormats",
          title: "Supported media formats",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
        }),
        defineField({ name: "file", title: "Full rider PDF", type: "file", options: { accept: ".pdf" } }),
      ],
    }),
    defineField({
      name: "showOnArtistIndex",
      title: "Show on artist index",
      type: "boolean",
      group: "booking",
      initialValue: true,
    }),
    defineField({
      name: "sortOrder",
      title: "Artist index order",
      type: "number",
      group: "booking",
      initialValue: 100,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "positioning",
      media: "heroImage",
    },
  },
})
