import { eq } from 'drizzle-orm'
import { congregations } from '~/db/schema'
import { db } from '~/lib/database'

export async function getCongregationByIdLoader(id: string, withTags = false) {
  if (withTags) {
    const result = await db.query.congregations.findFirst({
      where: eq(congregations.id, id),
      with: {
        congregationTags: {
          with: {
            tag: true,
          },
        },
      },
    })
    return {
      ...result,
      congregationTags: undefined,
      tags: result?.congregationTags.map((ct) => ct.tag) || [],
    }
  }

  return db.query.congregations.findFirst({
    where: eq(congregations.id, id),
  })
}
