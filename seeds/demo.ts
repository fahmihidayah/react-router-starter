import { randomUUID } from 'node:crypto'
import { tags } from '../app/db/schema'
import { db } from '../app/lib/database'

const demoTags = [
  { name: 'Youth', color: '#3B82F6' },
  { name: 'Family', color: '#10B981' },
  { name: 'Education', color: '#F59E0B' },
] as const

/**
 * Seeds sample domain data for local development and demos.
 * Never run this against a production database.
 */
export async function seedDemoData(): Promise<number> {
  const now = new Date()

  for (const tag of demoTags) {
    await db
      .insert(tags)
      .values({ id: randomUUID(), ...tag, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: tags.name,
        set: { color: tag.color, updatedAt: now },
      })
  }

  return demoTags.length
}
