import type { AdminMenu } from './admin-collection'

export type AdminConfig = {
  title: string
  subTitle?: string
  menus: AdminMenu[]
}
