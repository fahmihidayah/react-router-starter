import { asc } from 'drizzle-orm'
import { permissions, type TPermission } from '~/db/schema'
import { db } from '~/lib/database'

export function findAll(): Promise<TPermission[]> {
  return db.select().from(permissions).orderBy(asc(permissions.key))
}
