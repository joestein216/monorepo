import { defineType, defineField } from 'sanity'

// Provide a default schema object array so the Studio can initialize safely
export const coreSchemas = [
  defineType({
    name: 'samplePost',
    title: 'Sample Post',
    type: 'document',
    fields: [
      defineField({
        name: 'title',
        title: 'Title',
        type: 'string',
      }),
    ],
  }),
]
