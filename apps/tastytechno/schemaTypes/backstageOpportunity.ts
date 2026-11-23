import {defineField, defineType} from 'sanity'

export const backstageOpportunity = defineType({
  name: 'backstageOpportunity',
  title: 'Backstage opportunity',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'group', type: 'string', options: {list: ['research', 'engage']}, validation: (rule) => rule.required()}),
    defineField({name: 'summary', type: 'text', rows: 4, validation: (rule) => rule.required()}),
    defineField({name: 'address', type: 'string'}),
    defineField({name: 'nextStep', type: 'string', title: 'Suggested next step'}),
    defineField({name: 'sourceUrl', type: 'url', validation: (rule) => rule.required().uri({scheme: ['https']})}),
    defineField({name: 'sourceCheckedAt', type: 'date', validation: (rule) => rule.required()}),
    defineField({name: 'actionUrl', type: 'url', validation: (rule) => rule.uri({scheme: ['https']})}),
    defineField({name: 'actionLabel', type: 'string'}),
  ],
  preview: {select: {title: 'title', subtitle: 'nextStep'}},
})
