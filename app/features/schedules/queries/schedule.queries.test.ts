import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  dailySchedules,
  learningRecords,
  scheduleItems,
  scheduleTodos,
  type TDailySchedule,
  type TInsertScheduleTodo,
} from '~/db/schema'
import { db } from '~/lib/database'
import * as queries from './index'

vi.mock('~/lib/database', () => ({
  db: {
    insert: vi.fn(),
    query: {
      dailySchedules: { findFirst: vi.fn() },
      scheduleItems: { findMany: vi.fn() },
      scheduleTodos: { findFirst: vi.fn(), findMany: vi.fn() },
    },
    select: vi.fn(),
    transaction: vi.fn(),
    update: vi.fn(),
  },
}))

const now = new Date('2026-10-07T00:00:00.000Z')
const schedule: TDailySchedule = {
  id: 'schedule-1',
  learnerId: 'learner-1',
  startsOn: '2026-10-07',
  timezone: 'Asia/Jakarta',
  pausedAt: null,
  createdByUserId: 'user-1',
  createdAt: now,
  updatedAt: now,
}
const todo: TInsertScheduleTodo = {
  id: 'todo-1',
  scheduleId: schedule.id,
  scheduleItemId: null,
  learnerId: schedule.learnerId,
  scheduledDate: '2026-10-07',
  sourceType: 'goal',
  goalId: 'goal-1',
  trackId: null,
  titleSnapshot: 'Read',
  plannedDurationMinutes: 30,
  position: 0,
  cancelledAt: null,
  cancellationReason: null,
  createdByUserId: 'user-1',
  createdAt: now,
  updatedAt: now,
}

describe('schedule queries', () => {
  beforeEach(() => vi.resetAllMocks())

  it('loads schedules, active plan items, day ranges, and a single todo', async () => {
    vi.mocked(db.query.dailySchedules.findFirst).mockResolvedValue(schedule)
    vi.mocked(db.query.scheduleItems.findMany).mockResolvedValue([])
    vi.mocked(db.query.scheduleTodos.findMany).mockResolvedValue([])
    vi.mocked(db.query.scheduleTodos.findFirst).mockResolvedValue(todo as never)

    await expect(queries.findScheduleByLearnerId('learner-1')).resolves.toBe(schedule)
    await expect(queries.findActiveItemsByScheduleId('schedule-1')).resolves.toEqual([])
    await expect(
      queries.findTodosInRange('learner-1', '2026-10-01', '2026-10-31'),
    ).resolves.toEqual([])
    await expect(queries.findTodoById('todo-1', 'learner-1')).resolves.toEqual(todo)

    expect(db.query.dailySchedules.findFirst).toHaveBeenCalledWith({
      where: { learnerId: 'learner-1' },
    })
    expect(db.query.scheduleItems.findMany).toHaveBeenCalledWith({
      where: { scheduleId: 'schedule-1', archivedAt: { isNull: true } },
      orderBy: { position: 'asc', createdAt: 'asc' },
    })
    expect(db.query.scheduleTodos.findMany).toHaveBeenCalledWith({
      where: {
        learnerId: 'learner-1',
        scheduledDate: { gte: '2026-10-01', lte: '2026-10-31' },
      },
      orderBy: { scheduledDate: 'asc', position: 'asc', createdAt: 'asc' },
    })
  })

  it('skips the database for an empty record id list', async () => {
    await expect(queries.findRecordsByTodoIds([])).resolves.toEqual([])
    expect(db.select).not.toHaveBeenCalled()
  })

  it('selects completion records by schedule todo id', async () => {
    const records = [{ id: 'record-1', scheduleTodoId: 'todo-1', durationMinutes: 30 }]
    const where = vi.fn().mockResolvedValue(records)
    const from = vi.fn().mockReturnValue({ where })
    vi.mocked(db.select).mockReturnValue({ from } as never)
    await expect(queries.findRecordsByTodoIds(['todo-1'])).resolves.toEqual(records)
    expect(db.select).toHaveBeenCalledWith({
      id: learningRecords.id,
      scheduleTodoId: learningRecords.scheduleTodoId,
      durationMinutes: learningRecords.durationMinutes,
    })
    expect(from).toHaveBeenCalledWith(learningRecords)
  })

  it('creates a schedule and its plan items atomically', async () => {
    const returning = vi.fn().mockResolvedValue([schedule])
    const values = vi.fn((value) =>
      value === schedule ? { returning } : Promise.resolve(undefined),
    )
    const insert = vi.fn().mockReturnValue({ values })
    vi.mocked(db.transaction).mockImplementation(async (callback) => callback({ insert } as never))
    const planItem = {
      id: 'item-1',
      scheduleId: schedule.id,
      sourceType: 'goal' as const,
      goalId: 'goal-1',
      trackId: null,
      titleSnapshot: 'Read',
      plannedDurationMinutes: 30,
      position: 0,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    }

    await expect(queries.createScheduleWithItems(schedule, [planItem])).resolves.toBe(schedule)
    expect(insert).toHaveBeenNthCalledWith(1, dailySchedules)
    expect(insert).toHaveBeenNthCalledWith(2, scheduleItems)
    expect(values).toHaveBeenNthCalledWith(1, schedule)
    expect(values).toHaveBeenNthCalledWith(2, [planItem])
  })

  it('replaces future incomplete plan instances in one transaction', async () => {
    const where = vi.fn().mockResolvedValue(undefined)
    const set = vi.fn().mockReturnValue({ where })
    const update = vi.fn().mockReturnValue({ set })
    const recordWhere = vi.fn().mockReturnValue({})
    const from = vi.fn().mockReturnValue({ where: recordWhere })
    const select = vi.fn().mockReturnValue({ from })
    const itemValues = vi.fn().mockResolvedValue(undefined)
    const insert = vi.fn().mockReturnValue({ values: itemValues })
    vi.mocked(db.transaction).mockImplementation(async (callback) =>
      callback({ update, select, insert } as never),
    )
    const planItem = {
      id: 'item-2',
      scheduleId: schedule.id,
      sourceType: 'goal' as const,
      goalId: 'goal-1',
      trackId: null,
      titleSnapshot: 'Read',
      plannedDurationMinutes: 45,
      position: 0,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    }

    await queries.replaceScheduleItems(schedule.id, '2026-10-08', 'Asia/Makassar', [planItem])
    expect(update).toHaveBeenNthCalledWith(1, dailySchedules)
    expect(update).toHaveBeenNthCalledWith(2, scheduleItems)
    expect(update).toHaveBeenNthCalledWith(3, scheduleTodos)
    expect(set).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ startsOn: '2026-10-08', timezone: 'Asia/Makassar' }),
    )
    expect(from).toHaveBeenCalledWith(learningRecords)
    expect(insert).toHaveBeenCalledWith(scheduleItems)
    expect(itemValues).toHaveBeenCalledWith([planItem])
  })

  it('creates generated and one-off todos', async () => {
    const onConflictDoNothing = vi.fn().mockResolvedValue(undefined)
    const returning = vi.fn().mockResolvedValue([todo])
    const values = vi
      .fn()
      .mockReturnValueOnce({ onConflictDoNothing })
      .mockReturnValueOnce({ returning })
    vi.mocked(db.insert).mockReturnValue({ values } as never)

    await queries.createTodos([todo])
    await expect(queries.createTodo(todo)).resolves.toEqual(todo)
    expect(db.insert).toHaveBeenNthCalledWith(1, scheduleTodos)
    expect(db.insert).toHaveBeenNthCalledWith(2, scheduleTodos)
    expect(onConflictDoNothing).toHaveBeenCalledOnce()
  })

  it('does not issue inserts or updates for empty collections', async () => {
    await queries.createTodos([])
    await expect(queries.cancelTodos([], 'removed')).resolves.toBe(0)
    await queries.updateTodoPositions([])
    expect(db.insert).not.toHaveBeenCalled()
    expect(db.update).not.toHaveBeenCalled()
    expect(db.transaction).not.toHaveBeenCalled()
  })

  it('cancels todos and returns the affected count', async () => {
    const returning = vi.fn().mockResolvedValue([{ id: 'todo-1' }, { id: 'todo-2' }])
    const where = vi.fn().mockReturnValue({ returning })
    const set = vi.fn().mockReturnValue({ where })
    vi.mocked(db.update).mockReturnValue({ set } as never)
    await expect(queries.cancelTodos(['todo-1', 'todo-2'], 'day_cleared')).resolves.toBe(2)
    expect(db.update).toHaveBeenCalledWith(scheduleTodos)
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ cancellationReason: 'day_cleared' }))
  })

  it('updates ordered positions atomically', async () => {
    const where = vi.fn().mockResolvedValue(undefined)
    const set = vi.fn().mockReturnValue({ where })
    const update = vi.fn().mockReturnValue({ set })
    vi.mocked(db.transaction).mockImplementation(async (callback) => callback({ update } as never))
    await queries.updateTodoPositions([
      { id: 'todo-1', position: 1 },
      { id: 'todo-2', position: 0 },
    ])
    expect(update).toHaveBeenCalledTimes(2)
    expect(set).toHaveBeenNthCalledWith(1, expect.objectContaining({ position: 1 }))
    expect(set).toHaveBeenNthCalledWith(2, expect.objectContaining({ position: 0 }))
  })

  it('finds an active todo by date and preferred source', async () => {
    vi.mocked(db.query.scheduleTodos.findFirst).mockResolvedValue(todo as never)
    await expect(
      queries.findMatchingTodo({
        learnerId: 'learner-1',
        scheduledDate: '2026-10-07',
        goalId: 'goal-1',
        preferredTodoId: 'todo-1',
      }),
    ).resolves.toEqual(todo)
    expect(db.query.scheduleTodos.findFirst).toHaveBeenCalledWith({
      where: {
        learnerId: 'learner-1',
        scheduledDate: '2026-10-07',
        cancelledAt: { isNull: true },
        goalId: 'goal-1',
        id: 'todo-1',
      },
      orderBy: { position: 'asc', createdAt: 'asc' },
    })
  })
})
