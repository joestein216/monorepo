import { defineArrayMember, defineField, defineType } from "sanity"

export const navigationItem = defineType({
  name: "navigationItem",
  title: "Navigation item",
  type: "object",
  fields: [
    defineField({
      name: "link",
      title: "Link",
      type: "link",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "children",
      title: "Child links",
      type: "array",
      of: [defineArrayMember({ type: "link" })],
    }),
  ],
  preview: {
    select: {
      title: "link.label",
      subtitle: "link.href",
    },
  },
})
