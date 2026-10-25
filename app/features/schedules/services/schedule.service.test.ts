import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TDailySchedule, TGoal, TScheduleItem, TScheduleTodo } from '~/db/schema'
import * as activityQueries from '~/features/activities/queries'
import * as goalQueries from '~/features/goals/queries'
import * as learnerQueries from '~/features/learners/queries'
import * as scheduleQueries from '../queries'
import * as service from './schedule.service'

vi.mock('~/features/activities/queries', () => ({ findAllTracksByLearnerId: vi.fn() }))
vi.mock('~/features/goals/queries', () => ({ findByLearnerId: vi.fn() }))
vi.mock('~/features/learners/queries', () => ({
  canContribute: vi.fn(),
  findByIdForUser: vi.fn(),
}))
vi.mock('../queries', () => ({
  cancelTodos: vi.fn(),
  createScheduleWithItems: vi.fn(),
  createTodo: vi.fn(),
  createTodos: vi.fn(),
  findActiveItemsByScheduleId: vi.fn(),
  findMatchingTodo: vi.fn(),
  findRecordsByTodoIds: vi.fn(),
  findScheduleByLearnerId: vi.fn(),
  findTodoById: vi.fn(),
  findTodosInRange: vi.fn(),
  replaceScheduleItems: vi.fn(),
  updateTodoPositions: vi.fn(),
}))

const now = new Date('2026-10-07T00:00:00.000Z')
const schedule: TDailySchedule = {
  id: 'schedule-1',
  learnerId: 'learner-1',
  startsOn: '2026-10-06',
  timezone: 'Asia/Jakarta',
  pausedAt: null,
  createdByUserId: 'user-1',
  createdAt: now,
  updatedAt: now,
}
const goal: TGoal = {
  id: 'goal-1',
  learnerId: 'learner-1',
  groupId: null,
  title: 'Read Atomic Habits',
  description: null,
  targetValue: 10,
  unit: 'pages',
  startDate: new Date('2026-10-07T00:00:00.000Z'),
  endDate: new Date('2026-10-08T00:00:00.000Z'),
  createdAt: now,
  updatedAt: now,
}
const track = {
  id: 'track-1',
  learnerId: 'learner-1',
  name: 'Exercise',
  archivedAt: null,
  createdAt: now,
  updatedAt: now,
}

function item(overrides: Partial<TScheduleItem> = {}): TScheduleItem {
  return {
    id: 'item-1',
    scheduleId: schedule.id,
    sourceType: 'goal',
    goalId: goal.id,
    trackId: null,
    titleSnapshot: goal.title,
    plannedDurationMinutes: 60,
    position: 0,
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function todo(overrides: Partial<TScheduleTodo> = {}): TScheduleTodo {
  return {
    id: 'todo-1',
    scheduleId: schedule.id,
    scheduleItemId: 'item-1',
    learnerId: schedule.learnerId,
    scheduledDate: '2026-10-07',
    sourceType: 'goal',
    goalId: goal.id,
    trackId: null,
    titleSnapshot: goal.title,
    plannedDurationMinutes: 60,
    position: 0,
    cancelledAt: null,
    cancellationReason: null,
    createdByUserId: schedule.createdByUserId,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

describe('schedule service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(goalQueries.findByLearnerId).mockResolvedValue([goal])
    vi.mocked(activityQueries.findAllTracksByLearnerId).mockResolvedValue([track])
    vi.mocked(scheduleQueries.findRecordsByTodoIds).mockResolvedValue([])
    vi.mocked(scheduleQueries.findTodosInRange).mockResolvedValue([])
    vi.mocked(scheduleQueries.createScheduleWithItems).mockResolvedValue(schedule)
  })

  it('does not expose a schedule without learner access', async () => {
    vi.mocked(learnerQueries.findByIdForUser).mockResolvedValue(undefined)
    await expect(
      service.findRangeForUser('learner-1', 'stranger-1', '2026-10-07', '2026-10-08'),
    ).resolves.toBeUndefined()
    expect(scheduleQueries.findScheduleByLearnerId).not.toHaveBeenCalled()
  })

  it('returns an empty range when the learner has no repeating plan', async () => {
    vi.mocked(learnerQueries.findByIdForUser).mockResolvedValue({ id: 'learner-1' } as never)
    vi.mocked(scheduleQueries.findScheduleByLearnerId).mockResolvedValue(undefined)
    await expect(
      service.findRangeForUser('learner-1', 'user-1', '2026-10-07', '2026-10-07'),
    ).resolves.toEqual({ schedule: undefined, planItems: [], todos: [] })
  })

  it('creates valid daily occurrences and calculates completion from learning records', async () => {
    const trackItem = item({
      id: 'item-2',
      sourceType: 'activity_track',
      goalId: null,
      trackId: track.id,
      titleSnapshot: track.name,
      plannedDurationMinutes: 25,
      position: 1,
    })
    const goalTodo = todo()
    const trackTodo = todo({
      id: 'todo-2',
      scheduleItemId: trackItem.id,
      sourceType: 'activity_track',
      goalId: null,
      trackId: track.id,
      titleSnapshot: track.name,
      plannedDurationMinutes: 25,
      position: 1,
    })
    vi.mocked(learnerQueries.findByIdForUser).mockResolvedValue({ id: 'learner-1' } as never)
    vi.mocked(scheduleQueries.findScheduleByLearnerId).mockResolvedValue(schedule)
    vi.mocked(scheduleQueries.findActiveItemsByScheduleId).mockResolvedValue([item(), trackItem])
    vi.mocked(scheduleQueries.findTodosInRange)
      .mockResolvedValueOnce([goalTodo])
      .mockResolvedValueOnce([goalTodo, trackTodo])
    vi.mocked(scheduleQueries.findRecordsByTodoIds).mockResolvedValue([
      { id: 'record-1', scheduleTodoId: goalTodo.id, durationMinutes: 45 },
    ])

    const result = await service.findRangeForUser('learner-1', 'user-1', '2026-10-06', '2026-10-09')

    const generated = vi.mocked(scheduleQueries.createTodos).mock.calls[0][0]
    expect(generated).toHaveLength(5)
    expect(
      generated.filter((value) => value.goalId === goal.id).map((value) => value.scheduledDate),
    ).toEqual(['2026-10-08'])
    expect(result?.todos[0]).toMatchObject({ completed: true, actualDurationMinutes: 45 })
    expect(result?.todos[1]).toMatchObject({ completed: false, actualDurationMinutes: 0 })
  })

  it('creates a new repeating plan with resolved source snapshots', async () => {
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(true)
    vi.mocked(scheduleQueries.findScheduleByLearnerId).mockResolvedValue(undefined)
    const result = await service.savePlanForLearner('learner-1', 'user-1', {
      startsOn: '2026-10-07',
      timezone: 'Asia/Jakarta',
      items: [
        { sourceType: 'goal', sourceId: goal.id, plannedDurationMinutes: 60 },
        { sourceType: 'activity_track', sourceId: track.id, plannedDurationMinutes: 25 },
      ],
    })
    expect(result).toBe('saved')
    expect(scheduleQueries.createScheduleWithItems).toHaveBeenCalledWith(
      expect.objectContaining({ learnerId: 'learner-1', startsOn: '2026-10-07' }),
      [
        expect.objectContaining({ goalId: goal.id, titleSnapshot: goal.title, position: 0 }),
        expect.objectContaining({ trackId: track.id, titleSnapshot: track.name, position: 1 }),
      ],
    )
  })

  it('replaces future plan items while preserving timezone', async () => {
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(true)
    vi.mocked(scheduleQueries.findScheduleByLearnerId).mockResolvedValue(schedule)
    await expect(
      service.savePlanForLearner('learner-1', 'user-1', {
        startsOn: '2026-10-08',
        timezone: 'Asia/Makassar',
        items: [{ sourceType: 'goal', sourceId: goal.id, plannedDurationMinutes: 40 }],
      }),
    ).resolves.toBe('saved')
    expect(scheduleQueries.replaceScheduleItems).toHaveBeenCalledWith(
      schedule.id,
      '2026-10-08',
      'Asia/Makassar',
      [expect.objectContaining({ plannedDurationMinutes: 40 })],
    )
  })

  it('rejects viewers, duplicates, missing goals, and archived tracks', async () => {
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(false)
    const data = {
      startsOn: '2026-10-07',
      timezone: 'Asia/Jakarta',
      items: [{ sourceType: 'goal' as const, sourceId: goal.id, plannedDurationMinutes: 30 }],
    }
    await expect(service.savePlanForLearner('learner-1', 'viewer-1', data)).resolves.toBe(
      'forbidden',
    )
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(true)
    await expect(
      service.savePlanForLearner('learner-1', 'user-1', {
        ...data,
        items: [data.items[0], data.items[0]],
      }),
    ).resolves.toBe('duplicate-source')
    vi.mocked(goalQueries.findByLearnerId).mockResolvedValue([])
    await expect(service.savePlanForLearner('learner-1', 'user-1', data)).resolves.toBe(
      'invalid-source',
    )
    vi.mocked(activityQueries.findAllTracksByLearnerId).mockResolvedValue([
      { ...track, archivedAt: now },
    ])
    await expect(
      service.savePlanForLearner('learner-1', 'user-1', {
        ...data,
        items: [{ sourceType: 'activity_track', sourceId: track.id, plannedDurationMinutes: 30 }],
      }),
    ).resolves.toBe('invalid-source')
  })

  it('adds a one-day todo after creating an empty schedule', async () => {
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(true)
    vi.mocked(scheduleQueries.findScheduleByLearnerId).mockResolvedValue(undefined)
    await expect(
      service.addTodoForLearner('learner-1', 'user-1', {
        scheduledDate: '2026-10-07',
        sourceType: 'activity_track',
        sourceId: track.id,
        plannedDurationMinutes: 25,
      }),
    ).resolves.toBe('saved')
    expect(scheduleQueries.createScheduleWithItems).toHaveBeenCalledWith(
      expect.objectContaining({ startsOn: '2026-10-07' }),
      [],
    )
    expect(scheduleQueries.createTodo).toHaveBeenCalledWith(
      expect.objectContaining({ trackId: track.id, position: 0, plannedDurationMinutes: 25 }),
    )
  })

  it('rejects a duplicate source on the same day', async () => {
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(true)
    vi.mocked(scheduleQueries.findScheduleByLearnerId).mockResolvedValue(schedule)
    vi.mocked(scheduleQueries.findTodosInRange).mockResolvedValue([todo()])
    await expect(
      service.addTodoForLearner('learner-1', 'user-1', {
        scheduledDate: '2026-10-07',
        sourceType: 'goal',
        sourceId: goal.id,
        plannedDurationMinutes: 30,
      }),
    ).resolves.toBe('duplicate-source')
    expect(scheduleQueries.createTodo).not.toHaveBeenCalled()
  })

  it('protects past and completed todos from removal', async () => {
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(true)
    vi.mocked(scheduleQueries.findTodoById).mockResolvedValue(todo({ scheduledDate: '2026-10-06' }))
    await expect(
      service.removeTodoForLearner('learner-1', 'user-1', 'todo-1', '2026-10-07'),
    ).resolves.toBe('past')
    vi.mocked(scheduleQueries.findTodoById).mockResolvedValue(todo())
    vi.mocked(scheduleQueries.findRecordsByTodoIds).mockResolvedValue([
      { id: 'record-1', scheduleTodoId: 'todo-1', durationMinutes: 10 },
    ])
    await expect(
      service.removeTodoForLearner('learner-1', 'user-1', 'todo-1', '2026-10-07'),
    ).resolves.toBe('has-records')
  })

  it('clears only incomplete todos for a day', async () => {
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(true)
    vi.mocked(scheduleQueries.findTodosInRange).mockResolvedValue([
      todo(),
      todo({ id: 'todo-2', position: 1 }),
    ])
    vi.mocked(scheduleQueries.findRecordsByTodoIds).mockResolvedValue([
      { id: 'record-1', scheduleTodoId: 'todo-1', durationMinutes: 10 },
    ])
    await expect(
      service.clearDayForLearner('learner-1', 'user-1', '2026-10-07', '2026-10-07'),
    ).resolves.toBe('saved')
    expect(scheduleQueries.cancelTodos).toHaveBeenCalledWith(['todo-2'], 'day_cleared')
  })

  it('moves a todo by swapping adjacent positions', async () => {
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(true)
    vi.mocked(scheduleQueries.findTodoById).mockResolvedValue(todo())
    vi.mocked(scheduleQueries.findTodosInRange).mockResolvedValue([
      todo(),
      todo({ id: 'todo-2', position: 1 }),
    ])
    await expect(
      service.moveTodoForLearner('learner-1', 'user-1', 'todo-1', 'down', '2026-10-07'),
    ).resolves.toBe('saved')
    expect(scheduleQueries.updateTodoPositions).toHaveBeenCalledWith([
      { id: 'todo-1', position: 1 },
      { id: 'todo-2', position: 0 },
    ])
  })

  it('returns the matching todo id used by learning record services', async () => {
    vi.mocked(scheduleQueries.findMatchingTodo).mockResolvedValue(todo())
    await expect(
      service.findMatchingTodoId({
        learnerId: 'learner-1',
        scheduledDate: '2026-10-07',
        goalId: goal.id,
      }),
    ).resolves.toBe('todo-1')
  })
})
