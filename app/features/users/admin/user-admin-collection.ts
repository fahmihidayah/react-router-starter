import type { Collection } from '~/lib/admin/collection/collection'

export const UserAdminCollection: Collection = {
  slug: 'users',
  access: {
    create: undefined,
    read: undefined,
    delete: undefined,
    edit: undefined,
  },
}
