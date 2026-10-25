import { and, eq, inArray } from 'drizzle-orm'
import {
  auditLogs,
  auditLogTemplates,
  dailySchedules,
  goalGroups,
  learnerMembers,
  learners,
  learningRecords,
  learningTemplates,
  scheduleTodos,
  users,
} from '~/db/schema'
import { db } from '~/lib/database'

export async function deleteById(id: string): Promise<void> {
  await db.transaction(async (transaction) => {
    const ownedLearners = await transaction
      .select({ id: learnerMembers.learnerId })
      .from(learnerMembers)
      .where(and(eq(learnerMembers.userId, id), eq(learnerMembers.role, 'owner')))

    const ownedLearnerIds = ownedLearners.map(({ id: learnerId }) => learnerId)
    if (ownedLearnerIds.length > 0) {
      await transaction.delete(learners).where(inArray(learners.id, ownedLearnerIds))
    }

    // Remove records the user created for learners shared with them. These rows
    // intentionally restrict user deletion so attribution is never orphaned.
    await transaction.delete(learningRecords).where(eq(learningRecords.recordedByUserId, id))
    await transaction.delete(scheduleTodos).where(eq(scheduleTodos.createdByUserId, id))
    await transaction.delete(dailySchedules).where(eq(dailySchedules.createdByUserId, id))
    await transaction.delete(goalGroups).where(eq(goalGroups.createdByUserId, id))

    const ownedTemplates = await transaction
      .select({ id: learningTemplates.id })
      .from(learningTemplates)
      .where(eq(learningTemplates.ownerUserId, id))
    const ownedTemplateIds = ownedTemplates.map(({ id: templateId }) => templateId)
    if (ownedTemplateIds.length > 0) {
      await transaction
        .delete(auditLogTemplates)
        .where(inArray(auditLogTemplates.templateId, ownedTemplateIds))
      await transaction
        .delete(learningTemplates)
        .where(inArray(learningTemplates.id, ownedTemplateIds))
    }

    await transaction.delete(auditLogs).where(eq(auditLogs.actorId, id))
    await transaction.delete(users).where(eq(users.id, id))
  })
}
