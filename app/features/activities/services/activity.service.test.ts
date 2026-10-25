import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as learnerQueries from '~/features/learners/queries'
import * as scheduleService from '~/features/schedules/services'
import * as activityQueries from '../queries'
import * as service from './activity.service'

vi.mock('../queries', () => ({
  findActivitiesByLearnerId: vi.fn(),
  findRecordsByLearnerIds: vi.fn(),
  findRecentRecordsByLearnerIds: vi.fn(),
  findRecordsByLearnerIdsFromDate: vi.fn(),
  findRecordContextsByLearnerIdsOnDate: vi.fn(),
  findTracksByLearnerId: vi.fn(),
  findAllTracksByLearnerId: vi.fn(),
  findTrackById: vi.fn(),
  findTrackByIdForDetail: vi.fn(),
  findActivitiesByTrackId: vi.fn(),
  findActiveTrackByName: vi.fn(),
  createRecord: vi.fn(),
  deleteRecord: vi.fn(),
  createTrack: vi.fn(),
  renameTrack: vi.fn(),
  archiveTrack: vi.fn(),
}))
vi.mock('~/features/learners/queries', () => ({
  canContribute: vi.fn(),
  findByIdForUser: vi.fn(),
}))
vi.mock('~/features/schedules/services', () => ({ findMatchingTodoId: vi.fn() }))

describe('activity service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(scheduleService.findMatchingTodoId).mockResolvedValue(null)
  })

  it('creates an activity inside an accessible learner topic', async () => {
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(true)
    vi.mocked(activityQueries.findTrackById).mockResolvedValue({
      id: '3d733783-98d5-4fc7-b31c-2120fdc58c42',
      learnerId: 'learner-1',
      name: 'Reading',
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.mocked(scheduleService.findMatchingTodoId).mockResolvedValue('todo-1')
    vi.mocked(activityQueries.createRecord).mockImplementation(async (value) => value as never)

    const result = await service.createForLearner('learner-1', 'user-1', {
      title: 'Read an Arabic book',
      activityDate: '2026-10-03',
      trackId: '3d733783-98d5-4fc7-b31c-2120fdc58c42',
      durationMinutes: 30,
      value: 30,
      unit: 'minutes',
      note: '',
      scheduleTodoId: '4aa1ee2c-3042-4ce7-8f4b-816b33d9f821',
    })

    expect(result?.learnerId).toBe('learner-1')
    expect(result?.trackId).toBe('3d733783-98d5-4fc7-b31c-2120fdc58c42')
    expect(result?.durationMinutes).toBe(30)
    expect(result?.scheduleTodoId).toBe('todo-1')
    expect(result?.activityDate).toEqual(new Date('2026-10-03T00:00:00.000Z'))
    expect(scheduleService.findMatchingTodoId).toHaveBeenCalledWith({
      learnerId: 'learner-1',
      scheduledDate: '2026-10-03',
      trackId: '3d733783-98d5-4fc7-b31c-2120fdc58c42',
      preferredTodoId: '4aa1ee2c-3042-4ce7-8f4b-816b33d9f821',
    })
  })

  it('does not create an activity under another learner track', async () => {
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(true)
    vi.mocked(activityQueries.findTrackById).mockResolvedValue(undefined)

    await expect(
      service.createForLearner('learner-1', 'user-1', {
        title: 'Solved problem X',
        activityDate: '2026-10-03',
        trackId: '3d733783-98d5-4fc7-b31c-2120fdc58c42',
        note: '',
      }),
    ).resolves.toBeUndefined()
    expect(activityQueries.createRecord).not.toHaveBeenCalled()
  })

  it('does not create tracks for inaccessible learners', async () => {
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(false)

    await expect(
      service.createTrackForLearner('learner-1', 'user-1', { name: 'Jenkins' }),
    ).resolves.toBeUndefined()
    expect(activityQueries.createTrack).not.toHaveBeenCalled()
  })

  it('loads topic history only through an accessible learner', async () => {
    const track = {
      id: 'track-1',
      learnerId: 'learner-1',
      name: 'Writing',
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    vi.mocked(activityQueries.findTrackByIdForDetail).mockResolvedValue(track)
    vi.mocked(learnerQueries.findByIdForUser).mockResolvedValue({
      id: 'learner-1',
      name: 'Aisha',
    } as never)
    vi.mocked(activityQueries.findActivitiesByTrackId).mockResolvedValue([])
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(true)

    await expect(service.findTrackDetailForUser('track-1', 'teacher-1')).resolves.toMatchObject({
      track,
      learner: { id: 'learner-1' },
      activities: [],
      canManage: true,
    })
  })

  it('does not expose a topic when its learner is inaccessible', async () => {
    vi.mocked(activityQueries.findTrackByIdForDetail).mockResolvedValue({
      id: 'track-1',
      learnerId: 'learner-1',
    } as never)
    vi.mocked(learnerQueries.findByIdForUser).mockResolvedValue(undefined)

    await expect(service.findTrackDetailForUser('track-1', 'stranger-1')).resolves.toBeUndefined()
    expect(activityQueries.findActivitiesByTrackId).not.toHaveBeenCalled()
  })

  it('summarizes distinct updated goals and added activities for today', async () => {
    vi.mocked(activityQueries.findRecordContextsByLearnerIdsOnDate).mockResolvedValue([
      { learnerId: 'learner-1', goalId: 'goal-1' },
      { learnerId: 'learner-1', goalId: 'goal-1' },
      { learnerId: 'learner-1', goalId: 'goal-2' },
      { learnerId: 'learner-1', goalId: null },
      { learnerId: 'learner-1', goalId: null },
    ])

    const summaries = await service.findTodaySummaries(['learner-1', 'learner-2'], '2026-10-04')

    expect(activityQueries.findRecordContextsByLearnerIdsOnDate).toHaveBeenCalledWith(
      ['learner-1', 'learner-2'],
      new Date('2026-10-04T00:00:00.000Z'),
    )
    expect(summaries.get('learner-1')).toEqual({ goalsUpdated: 2, activitiesAdded: 2 })
    expect(summaries.get('learner-2')).toEqual({ goalsUpdated: 0, activitiesAdded: 0 })
  })

  it('builds a seven-day dashboard report and limits recent history to ten records', async () => {
    vi.mocked(activityQueries.findRecentRecordsByLearnerIds).mockResolvedValue([])
    vi.mocked(activityQueries.findRecordsByLearnerIdsFromDate).mockResolvedValue([
      {
        learnerId: 'learner-1',
        goalId: 'goal-1',
        activityDate: new Date('2026-10-02T00:00:00.000Z'),
      },
      {
        learnerId: 'learner-1',
        goalId: null,
        activityDate: new Date('2026-10-02T00:00:00.000Z'),
      },
      {
        learnerId: 'learner-2',
        goalId: null,
        activityDate: new Date('2026-10-04T00:00:00.000Z'),
      },
    ] as never)

    const report = await service.findDashboardReport(['learner-1', 'learner-2'], '2026-10-04')

    expect(activityQueries.findRecentRecordsByLearnerIds).toHaveBeenCalledWith(
      ['learner-1', 'learner-2'],
      10,
    )
    expect(activityQueries.findRecordsByLearnerIdsFromDate).toHaveBeenCalledWith(
      ['learner-1', 'learner-2'],
      new Date('2026-09-28T00:00:00.000Z'),
    )
    expect(report.weekly).toHaveLength(7)
    expect(report.weekly.at(-3)).toEqual({
      date: '2026-10-02',
      activityCount: 1,
      goalUpdateCount: 1,
      activeLearnerCount: 1,
    })
    expect(report.weekly.at(-1)).toEqual({
      date: '2026-10-04',
      activityCount: 1,
      goalUpdateCount: 0,
      activeLearnerCount: 1,
    })
  })
})
