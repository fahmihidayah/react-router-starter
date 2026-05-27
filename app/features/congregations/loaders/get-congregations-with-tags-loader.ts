import { like } from 'drizzle-orm'
import { db } from '~/lib/database'
import { congregations } from '~/db/schema'

/**
 * Example loader demonstrating Drizzle Relational API
 * Fetches congregations with their associated tags using the relational query builder
 */
export async function getCongregationsWithTagsLoader(search?: string) {
  return db.query.congregations.findMany({
    where: search ? like(congregations.name, `%${search}%`) : undefined,
    with: {
      congregationTags: {
        with: {
          tag: true,
        },
      },
    },
  })
}
