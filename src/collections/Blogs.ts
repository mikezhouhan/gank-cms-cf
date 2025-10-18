import type { CollectionConfig } from 'payload'

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      // Public can read published posts
      if (!user) {
        return {
          status: {
            equals: 'published',
          },
        }
      }
      // Logged in users can read all
      return true
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version of the title',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary of the blog post',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Featured image for the blog post',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Published',
          value: 'published',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Date when the blog post was published',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
      admin: {
        description: 'Tags for categorizing blog posts',
      },
    },
  ],
}
