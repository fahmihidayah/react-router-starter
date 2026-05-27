import { congregations } from '~/db/schema'
import { db } from '~/lib/database'
import { BaseRepository } from '~/lib/repository'
import type { TypeCongregation } from '../types/congregation'

/**
 * Congregation Repository
 * Extends BaseRepository with congregation-specific methods
 */
class CongregationRepository extends BaseRepository<typeof congregations> {
  // Add custom congregation-specific methods here if needed
  // override async findById(
  //   id: string | number,
  // ): Promise<InferSelectModel<typeof congregations> | undefined> {
  //   const [result] = await db.select().from(this.table).where(eq(this.table.id, id)).limit(1)
  //   return result as InferSelectModel<typeof congregations> | undefined
  // }

  override async findById(id: number | string): Promise<TypeCongregation | undefined> {
    const result = await db.query.congregations.findFirst({
      where: (congregation, { eq }) => eq(congregation.id, id as string),
      with: {
        congregationTags: {
          with: {
            tag: true,
          },
        },
      },
    })
    if (!result) return undefined
    return {
      ...result,
      tags: result.congregationTags.map((ct) => ct.tag),
    }
  }

  override async findAll(): Promise<TypeCongregation[]> {
    const results = await db.query.congregations.findMany({
      with: {
        congregationTags: {
          with: {
            tag: true,
          },
        },
      },
    })
    return results.map((congregation) => ({
      ...congregation,
      congregationTags: undefined,
      tags: congregation.congregationTags.map((ct) => ct.tag),
    }))
  }
}

export const congregationRepository = new CongregationRepository(congregations)
