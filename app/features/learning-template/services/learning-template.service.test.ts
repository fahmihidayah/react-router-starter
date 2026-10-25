import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as goalQueries from '~/features/goals/queries'
import * as learnerQueries from '~/features/learners/queries'
import * as queries from '../queries'
import * as service from './learning-template.service'

vi.mock('../queries', () => ({
  findCatalogForUser: vi.fn(),
  findByIdAccessible: vi.fn(),
  findByIdOwned: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  addGoal: vi.fn(),
  updateGoal: vi.fn(),
  updateGoalPositions: vi.fn(),
  deleteGoal: vi.fn(),
  archive: vi.fn(),
  wasAppliedToLearner: vi.fn(),
  applyWithAudit: vi.fn(),
}))
vi.mock('~/features/goals/queries', () => ({ findGroupsByLearnerId: vi.fn() }))
vi.mock('~/features/learners/queries', () => ({
  findByIdForUser: vi.fn(),
  canContribute: vi.fn(),
}))

const now = new Date('2026-10-02T00:00:00.000Z')
const template = {
  id: 'template-1',
  ownerUserId: 'owner-1',
  title: 'Reading',
  visibility: 'public' as const,
  archivedAt: null,
  createdAt: now,
  updatedAt: now,
  ownerName: 'Owner',
  goals: [
    {
      id: 'template-goal-1',
      templateId: 'template-1',
      title: 'Read',
      description: null,
      targetValue: 3,
      unit: 'books',
      durationDays: 7,
      position: 0,
      createdAt: now,
      updatedAt: now,
    },
  ],
}

describe('learning template service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(goalQueries.findGroupsByLearnerId).mockResolvedValue([])
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(true)
  })

  it('creates private templates for the current user', async () => {
    vi.mocked(queries.create).mockImplementation(async (value) => value as never)
    const result = await service.createForUser(
      { title: 'Reading', visibility: 'private' },
      'user-1',
    )
    expect(result.ownerUserId).toBe('user-1')
    expect(result.visibility).toBe('private')
  })

  it('does not add goals to a template owned by someone else', async () => {
    vi.mocked(queries.findByIdOwned).mockResolvedValue(undefined)
    await expect(
      service.addGoalForUser('template-1', 'other', {
        title: 'Read',
        description: '',
        targetValue: 1,
        unit: 'book',
        durationDays: 7,
      }),
    ).resolves.toBeUndefined()
    expect(queries.addGoal).not.toHaveBeenCalled()
  })

  it('reorders goals only inside an owned template', async () => {
    vi.mocked(queries.findByIdOwned).mockResolvedValue({
      ...template,
      goals: [template.goals[0], { ...template.goals[0], id: 'template-goal-2', position: 1 }],
    })
    await expect(
      service.moveGoalForUser('template-1', 'template-goal-2', 'owner-1', 'up'),
    ).resolves.toBe(true)
    expect(queries.updateGoalPositions).toHaveBeenCalledWith('template-1', [
      { id: 'template-goal-2', position: 0 },
      { id: 'template-goal-1', position: 1 },
    ])
  })

  it('copies goals with calculated dates and records linked audit data', async () => {
    vi.mocked(queries.findByIdAccessible).mockResolvedValue(template)
    vi.mocked(learnerQueries.findByIdForUser).mockResolvedValue({ id: 'learner-1' } as never)
    vi.mocked(queries.wasAppliedToLearner).mockResolvedValue(false)

    await expect(
      service.applyForUser('template-1', 'user-1', {
        learnerId: 'learner-1',
        startDate: '2026-10-10',
        confirmDuplicate: false,
      }),
    ).resolves.toEqual({ status: 'applied', goalCount: 1 })

    expect(queries.applyWithAudit).toHaveBeenCalledOnce()
    const applied = vi.mocked(queries.applyWithAudit).mock.calls[0][0]
    expect(applied.goals[0].startDate).toEqual(new Date('2026-10-10T00:00:00.000Z'))
    expect(applied.goals[0].endDate).toEqual(new Date('2026-10-16T00:00:00.000Z'))
    expect(applied.goals[0].groupId).toBe(applied.goalGroup.id)
    expect(applied.goalGroup).toMatchObject({
      learnerId: 'learner-1',
      name: 'Reading',
      sourceTemplateId: 'template-1',
      sourceTemplateTitle: 'Reading',
      createdByUserId: 'user-1',
    })
    expect(applied.auditLog.actorId).toBe('user-1')
    expect(applied.templateAudit.auditLogId).toBe(applied.auditLog.id)
    expect(applied.templateAudit.createdGoalIds).toEqual([applied.goals[0].id])
    expect(applied.templateAudit.goalGroupId).toBe(applied.goalGroup.id)
  })

  it('requires confirmation before applying a duplicate', async () => {
    vi.mocked(queries.findByIdAccessible).mockResolvedValue(template)
    vi.mocked(learnerQueries.findByIdForUser).mockResolvedValue({ id: 'learner-1' } as never)
    vi.mocked(queries.wasAppliedToLearner).mockResolvedValue(true)
    await expect(
      service.applyForUser('template-1', 'user-1', {
        learnerId: 'learner-1',
        startDate: '2026-10-10',
        confirmDuplicate: false,
      }),
    ).resolves.toEqual({ status: 'duplicate' })
    expect(queries.applyWithAudit).not.toHaveBeenCalled()
  })

  it('rejects inaccessible templates or learners', async () => {
    vi.mocked(queries.findByIdAccessible).mockResolvedValue(undefined)
    vi.mocked(learnerQueries.findByIdForUser).mockResolvedValue(undefined)
    vi.mocked(learnerQueries.canContribute).mockResolvedValue(false)
    await expect(
      service.applyForUser('missing', 'user-1', {
        learnerId: 'missing',
        startDate: '2026-10-10',
        confirmDuplicate: false,
      }),
    ).resolves.toEqual({ status: 'not-found' })
  })
})
