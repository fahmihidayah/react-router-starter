import { eq } from 'drizzle-orm'
import { db } from '~/lib/database'
import { congregationTags } from '~/db/schema'

export async function getCongregationTagsLoader(congregationId: string): Promise<string[]> {
  const result = await db.query.congregationTags.findMany({
    where: eq(congregationTags.congregationId, congregationId),
    columns: {
      tagId: true,
    },
  })

  return result.map((t) => t.tagId)
}
