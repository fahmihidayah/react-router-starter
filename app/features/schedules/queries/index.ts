import { and, eq, gte, inArray, isNull, notExists } from 'drizzle-orm'
import {
  dailySchedules,
  learningRecords,
  scheduleItems,
  scheduleTodos,
  type TDailySchedule,
  type TInsertDailySchedule,
  type TInsertScheduleItem,
  type TInsertScheduleTodo,
  type TLearningRecord,
  type TScheduleItem,
  type TScheduleTodo,
} from '~/db/schema'
import { db } from '~/lib/database'

export function findScheduleByLearnerId(learnerId: string): Promise<TDailySchedule | undefined> {
  return db.query.dailySchedules.findFirst({ where: { learnerId } })
}

export function findActiveItemsByScheduleId(scheduleId: string): Promise<TScheduleItem[]> {
  return db.query.scheduleItems.findMany({
    where: { scheduleId, archivedAt: { isNull: true } },
    orderBy: { position: 'asc', createdAt: 'asc' },
  })
}

export function findTodosInRange(
  learnerId: string,
  start: string,
  end: string,
): Promise<TScheduleTodo[]> {
  return db.query.scheduleTodos.findMany({
    where: { learnerId, scheduledDate: { gte: start, lte: end } },
    orderBy: { scheduledDate: 'asc', position: 'asc', createdAt: 'asc' },
  })
}

export function findTodoById(id: string, learnerId: string): Promise<TScheduleTodo | undefined> {
  return db.query.scheduleTodos.findFirst({ where: { id, learnerId } })
}

export async function findRecordsByTodoIds(
  todoIds: string[],
): Promise<Pick<TLearningRecord, 'durationMinutes' | 'id' | 'scheduleTodoId'>[]> {
  if (todoIds.length === 0) return []
  return db
    .select({
      id: learningRecords.id,
      scheduleTodoId: learningRecords.scheduleTodoId,
      durationMinutes: learningRecords.durationMinutes,
    })
    .from(learningRecords)
    .where(inArray(learningRecords.scheduleTodoId, todoIds))
}

export async function createScheduleWithItems(
  schedule: TInsertDailySchedule,
  items: TInsertScheduleItem[],
): Promise<TDailySchedule> {
  return db.transaction(async (transaction) => {
    const [created] = await transaction.insert(dailySchedules).values(schedule).returning()
    if (items.length > 0) await transaction.insert(scheduleItems).values(items)
    return created
  })
}

export async function replaceScheduleItems(
  scheduleId: string,
  fromDate: string,
  timezone: string,
  items: TInsertScheduleItem[],
): Promise<void> {
  const now = new Date()
  await db.transaction(async (transaction) => {
    await transaction
      .update(dailySchedules)
      .set({ startsOn: fromDate, timezone, pausedAt: null, updatedAt: now })
      .where(eq(dailySchedules.id, scheduleId))
    await transaction
      .update(scheduleItems)
      .set({ archivedAt: now, updatedAt: now })
      .where(and(eq(scheduleItems.scheduleId, scheduleId), isNull(scheduleItems.archivedAt)))
    await transaction
      .update(scheduleTodos)
      .set({
        cancelledAt: now,
        cancellationReason: 'series_changed',
        updatedAt: now,
      })
      .where(
        and(
          eq(scheduleTodos.scheduleId, scheduleId),
          gte(scheduleTodos.scheduledDate, fromDate),
          isNull(scheduleTodos.cancelledAt),
          notExists(
            transaction
              .select({ id: learningRecords.id })
              .from(learningRecords)
              .where(eq(learningRecords.scheduleTodoId, scheduleTodos.id)),
          ),
        ),
      )
    if (items.length > 0) await transaction.insert(scheduleItems).values(items)
  })
}

export async function createTodos(items: TInsertScheduleTodo[]): Promise<void> {
  if (items.length === 0) return
  await db.insert(scheduleTodos).values(items).onConflictDoNothing()
}

export async function createTodo(item: TInsertScheduleTodo): Promise<TScheduleTodo> {
  const [created] = await db.insert(scheduleTodos).values(item).returning()
  return created
}

export async function cancelTodos(
  ids: string[],
  reason: NonNullable<TScheduleTodo['cancellationReason']>,
): Promise<number> {
  if (ids.length === 0) return 0
  const now = new Date()
  const cancelled = await db
    .update(scheduleTodos)
    .set({ cancelledAt: now, cancellationReason: reason, updatedAt: now })
    .where(and(inArray(scheduleTodos.id, ids), isNull(scheduleTodos.cancelledAt)))
    .returning({ id: scheduleTodos.id })
  return cancelled.length
}

export async function updateTodoPositions(
  updates: { id: string; position: number }[],
): Promise<void> {
  if (updates.length === 0) return
  await db.transaction(async (transaction) => {
    for (const update of updates) {
      await transaction
        .update(scheduleTodos)
        .set({ position: update.position, updatedAt: new Date() })
        .where(eq(scheduleTodos.id, update.id))
    }
  })
}

export function findMatchingTodo({
  learnerId,
  scheduledDate,
  goalId,
  trackId,
  preferredTodoId,
}: {
  learnerId: string
  scheduledDate: string
  goalId?: string
  trackId?: string
  preferredTodoId?: string
}): Promise<TScheduleTodo | undefined> {
  return db.query.scheduleTodos.findFirst({
    where: {
      learnerId,
      scheduledDate,
      cancelledAt: { isNull: true },
      ...(goalId ? { goalId } : {}),
      ...(trackId ? { trackId } : {}),
      ...(preferredTodoId ? { id: preferredTodoId } : {}),
    },
    orderBy: { position: 'asc', createdAt: 'asc' },
  })
}
