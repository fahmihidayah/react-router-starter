import type { LucideIcon } from 'lucide-react'
import type { UserWithRoles } from '~/features/users/types'
import type { UserAdmin } from './user'

export type AdminGroup = {
  slug: string
  label?: string
  icon?: LucideIcon
}

export type AdminMenu = {
  slug: string
  label?: string
  url?: string
  icon?: LucideIcon
  group?: AdminGroup
  hide?: (user: UserAdmin) => boolean
}
