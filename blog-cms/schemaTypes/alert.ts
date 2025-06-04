import {defineType, defineField} from 'sanity'

export const alert = defineType({
  name: 'alert',
  type: 'object',
  title: 'Alert',
  fields: [
    defineField({
      name: 'message',
      type: 'string',
      title: 'Message',
    }),
    defineField({
      name: 'severity',
      title: 'Severity',
      type: 'string',
      options: {
        list: ['success', 'warning', 'info', 'error'],
        layout: 'radio',
      },
      initialValue: 'success', // bullet is invalid here
    }),
  ],
})
