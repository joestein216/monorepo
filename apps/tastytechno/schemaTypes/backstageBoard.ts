import {defineField, defineType} from 'sanity'

export const backstageBoard = defineType({
  name: 'backstageBoard',
  title: 'Backstage focus',
  type: 'document',
  liveEdit: true,
  fields: [
    defineField({
      name: 'focusMode', type: 'string', initialValue: 'nextEvent',
      options: {list: [{title: 'Next event', value: 'nextEvent'}, {title: 'Selected item', value: 'selected'}, {title: 'No featured item', value: 'hidden'}]},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featuredItem', type: 'reference', to: [{type: 'event'}, {type: 'backstageOpportunity'}],
      hidden: ({document}) => document?.focusMode !== 'selected',
      validation: (rule) => rule.custom((value, context) => context.document?.focusMode === 'selected' && !value?._ref ? 'Choose an item to feature.' : true),
    }),
  ],
  preview: {prepare: () => ({title: 'Backstage focus'})},
})
