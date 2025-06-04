// ./customList.ts
import { defineField, defineType } from 'sanity'

export const customList = defineType({
  name: 'customList',
  title: 'List',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      type: 'array',
      title: 'List Items',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'style',
      type: 'string',
      title: 'List Style',
      options: {
        list: ['bullet', 'number'],
        layout: 'radio',
      },
      initialValue: 'bullet',
    }),
  ],
})
