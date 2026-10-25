import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as learnerQueries from '~/features/learners/queries'
import * as scheduleService from '~/features/schedules/services'
import * as goalQueries from '../queries'
import * as service from './goal.service'

vi.mock('../queries', () => ({
  findByLearnerId: vi.fn(),
  findGroupsByLearnerId: vi.fn(),
  findGroupByName: vi.fn(),
  createGroup: vi.fn(),
  renameGroup: vi.fn(),
  deleteGroup: vi.fn(),
  moveGoalToGroup: vi.fn(),
  findEntriesByGoalIds: vi.fn(),
  findById: vi.fn(),
  findByIdForDetail: vi.fn(),
  create: vi.fn(),
  saveProgressEntry: vi.fn(),
  deleteProgressEntry: vi.fn(),
  deleteById: vi.fn(),
}))
vi.mock('~/features/learners/queries', () => ({
  canContribute: vi.fn(),
  findByIdForUser: vi.fn(),
}))
vi.mock('~/features/schedules/services', () => ({ findMatchingTodoId: vi.fn() }))

const now = new Date('2026-10-03T00:00:00.000Z')
const goal = {
  id: 'goal-1',
  learnerId: 'learner-1',
  groupId: null,
  title: 'Read Arabic books',
  description: null,
  targetValue: 10,
  unit: 'pages',
  startDate: new Date('2026-01-01T00:00:00.000Z'),
  endDate: new Date('2027-01-01T00:00:00.000Z'),
  createdAt: now,
  updatedAt: now,
}

describe('goal service learning records', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(scheduleService.findMatchingTodoId).mockResolvedValue(null)
  })

  it('creates shared goal groups for contributing learner members', async () => {
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(true)
    vi.mocked(goalQueries.findGroupByName).mockResolvedValue(undefined)
    vi.mocked(goalQueries.findGroupsByLearnerId).mockResolvedValue([])
    vi.mocked(goalQueries.createGroup).mockImplementation(async (value) => value as never)

    const result = await service.createGroupForLearner('learner-1', 'teacher-1', 'Reading')
    expect(result).toMatchObject({
      learnerId: 'learner-1',
      name: 'Reading',
      createdByUserId: 'teacher-1',
      sourceTemplateId: null,
    })
  })

  it('does not create goal groups for viewers', async () => {
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(false)
    await expect(
      service.createGroupForLearner('learner-1', 'viewer-1', 'Private'),
    ).resolves.toBeUndefined()
    expect(goalQueries.createGroup).not.toHaveBeenCalled()
  })

  it('stores goal progress as a universal learning record', async () => {
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(true)
    vi.mocked(goalQueries.findById).mockResolvedValue(goal)
    vi.mocked(scheduleService.findMatchingTodoId).mockResolvedValue('todo-1')
    vi.mocked(goalQueries.saveProgressEntry).mockImplementation(async (value) => value as never)

    const record = await service.saveEntryForLearner('learner-1', 'user-1', 'goal-1', {
      value: 2,
      note: 'Morning reading',
      activityDate: '2026-10-07',
      scheduleTodoId: '4aa1ee2c-3042-4ce7-8f4b-816b33d9f821',
    })

    expect(record).toMatchObject({
      learnerId: 'learner-1',
      goalId: 'goal-1',
      trackId: null,
      scheduleTodoId: 'todo-1',
      activityDate: new Date('2026-10-07T00:00:00.000Z'),
      title: 'Read Arabic books',
      durationMinutes: null,
      value: 2,
      unit: 'pages',
      note: 'Morning reading',
    })
    expect(scheduleService.findMatchingTodoId).toHaveBeenCalledWith({
      learnerId: 'learner-1',
      scheduledDate: '2026-10-07',
      goalId: 'goal-1',
      preferredTodoId: '4aa1ee2c-3042-4ce7-8f4b-816b33d9f821',
    })
  })

  it('sums only measured goal records', async () => {
    vi.mocked(goalQueries.findByLearnerId).mockResolvedValue([goal])
    vi.mocked(goalQueries.findEntriesByGoalIds).mockResolvedValue([
      {
        id: 'record-1',
        learnerId: 'learner-1',
        goalId: 'goal-1',
        trackId: null,
        scheduleTodoId: null,
        recordedByUserId: 'user-1',
        activityDate: now,
        title: goal.title,
        durationMinutes: null,
        value: 2,
        unit: goal.unit,
        note: null,
        createdAt: now,
        updatedAt: now,
        recordedByName: 'User',
      },
    ])

    const [result] = await service.findWithProgress('learner-1')
    expect(result.currentValue).toBe(2)
  })

  it('loads goal details for users who can access the learner', async () => {
    vi.mocked(goalQueries.findByIdForDetail).mockResolvedValue(goal)
    vi.mocked(learnerQueries.findByIdForUser).mockResolvedValue({
      id: 'learner-1',
      name: 'Aisha',
    } as never)
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(true)
    vi.mocked(goalQueries.findEntriesByGoalIds).mockResolvedValue([])

    await expect(service.findDetailForUser('goal-1', 'teacher-1')).resolves.toMatchObject({
      learner: { id: 'learner-1', name: 'Aisha' },
      goal: { id: 'goal-1', currentValue: 0, entries: [] },
      canManage: true,
    })
  })

  it('does not expose goal details without learner access', async () => {
    vi.mocked(goalQueries.findByIdForDetail).mockResolvedValue(goal)
    vi.mocked(learnerQueries.findByIdForUser).mockResolvedValue(undefined)

    await expect(service.findDetailForUser('goal-1', 'stranger-1')).resolves.toBeUndefined()
    expect(goalQueries.findEntriesByGoalIds).not.toHaveBeenCalled()
  })
})
