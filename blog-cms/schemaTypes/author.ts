import {defineType, defineField} from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'object',
  fields: [
    defineField({name: 'name', type: 'string', title: 'Name'}),
    defineField({
      name: 'description',
      type: 'array',
      title: 'Description',
      of: [{type: 'string'}],
    }),
    defineField({name: 'image', type: 'image', title: 'Image'}),
    defineField({name: 'facebook', type: 'url', title: 'Facebook'}),
    defineField({name: 'instagram', type: 'url', title: 'Instagram'}),
    defineField({name: 'linkedIn', type: 'url', title: 'LinkedIn'}),
    defineField({name: 'gmail', type: 'string', title: 'Gmail'}),
  ],
})
