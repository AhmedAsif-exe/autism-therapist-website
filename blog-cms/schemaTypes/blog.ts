import {defineField, defineType} from 'sanity'
import {section} from './section' // adjust the path accordingly

export const blog = defineType({
  name: 'blog',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Main Title',
    }),
    defineField({
      name: 'authors',
      type: 'array',
      title: 'Authors',
      of: [{type: 'author'}], // ✅ use named schema
    }),
    defineField({name: 'description', type: 'string', title: 'Description'}),
    defineField({
      name: 'mainImage',
      type: 'image',
      title: 'Main Image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
        }),
      ],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'string',
    }),
    defineField({
      name: 'sections',
      type: 'array',
      title: 'Sections',
      of: [{type: 'section'}], // reference named schema here
    }),
  ],
})
