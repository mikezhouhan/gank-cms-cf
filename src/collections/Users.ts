import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
  },
  auth: {
    useAPIKey: true,
  },
  fields: [
    // Email added by default
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'linkedin',
      label: 'LinkedIn',
      type: 'text',
      admin: {
        condition: (data) => Boolean(data?.id),
      },
    },
    {
      name: 'twitter',
      label: 'Twitter',
      type: 'text',
      admin: {
        condition: (data) => Boolean(data?.id),
      },
    },
    {
      name: 'avatar',
      label: 'Avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => Boolean(data?.id),
      },
    },
    {
      name: 'info',
      label: 'Info',
      type: 'textarea',
      admin: {
        condition: (data) => Boolean(data?.id),
      },
    },
  ],
}
