// ./section.ts
import {defineField, defineType} from 'sanity'

export const section = defineType({
  name: 'section',
  title: 'Section',
  type: 'object',
  fields: [
    defineField({
      name: 'subheading',
      type: 'string',
      title: 'Subheading',
    }),
    defineField({
      name: 'content',
      type: 'array',
      title: 'Content Blocks',
      of: [
        {type: 'block'},
        {
          type: 'image',
          name: 'image',
          title: 'Image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt text',
            }),
          ],
        },
        {type: 'customList'},
        {
          type: 'alert',
        },
      ],
    }),
  ],
})
