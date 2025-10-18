import type { CollectionConfig } from 'payload'

const hasAdminRole = (user: unknown): boolean => {
  if (!user) {
    return false
  }

  const { roles } = user as { roles?: unknown }

  if (!Array.isArray(roles)) {
    return false
  }

  return roles.some((role) => role === 'admin')
}

const getUserId = (user: unknown): string | number | null => {
  if (!user) {
    return null
  }

  const { id } = user as { id?: unknown }

  if (typeof id === 'string' || typeof id === 'number') {
    return id
  }

  return null
}

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedAt'],
  },
  access: {
    create: ({ req: { user } }) => getUserId(user) !== null,
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
    update: ({ req: { user } }) => {
      if (!user) {
        return false
      }

      if (hasAdminRole(user)) {
        return true
      }

      const userId = getUserId(user)

      if (userId === null) {
        return false
      }

      // Authors can only modify their own posts
      return {
        author: {
          equals: userId,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) {
        return false
      }

      if (hasAdminRole(user)) {
        return true
      }

      const userId = getUserId(user)

      if (userId === null) {
        return false
      }

      return {
        author: {
          equals: userId,
        },
      }
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
      admin: {
        description: 'URL-friendly version of the title',
      },
      // Note: unique constraint removed to allow same slug for different locales
      // Combined uniqueness enforced via hooks or application logic
    },
    {
      name: 'locale',
      type: 'select',
      required: true,
      defaultValue: 'en',
      options: [
        {
          label: 'English',
          value: 'en',
        },
        {
          label: '简体中文',
          value: 'zh-CN',
        },
        {
          label: 'Deutsch',
          value: 'de',
        },
      ],
      admin: {
        position: 'sidebar',
        description: 'Language of the blog post',
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
      name: 'authorImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
        description: 'Custom author image (overrides user avatar if set)',
      },
    },
    {
      name: 'authorLink',
      type: 'text',
      admin: {
        description: 'Custom author profile link',
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
