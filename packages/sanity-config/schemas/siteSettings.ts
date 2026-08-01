import { defineType, defineField } from 'sanity'

export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Website Title',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'SEO Description',
      type: 'text',
    }),
  ],
})
