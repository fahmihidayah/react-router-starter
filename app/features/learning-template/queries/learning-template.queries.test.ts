import { beforeEach, describe, expect, it, vi } from 'vitest'
import { auditLogs, auditLogTemplates, goalGroups, goals, learningTemplates } from '~/db/schema'
import { db } from '~/lib/database'
import { applyWithAudit, create } from './index'

vi.mock('~/lib/database', () => ({
  db: { insert: vi.fn(), transaction: vi.fn() },
}))

describe('learning template queries', () => {
  beforeEach(() => vi.resetAllMocks())

  it('creates and returns a template', async () => {
    const template = {
      id: 'template-1',
      ownerUserId: 'user-1',
      title: 'Reading',
      visibility: 'private' as const,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const returning = vi.fn().mockResolvedValue([template])
    const values = vi.fn().mockReturnValue({ returning })
    vi.mocked(db.insert).mockReturnValue({ values } as never)

    await expect(create(template)).resolves.toEqual(template)
    expect(db.insert).toHaveBeenCalledWith(learningTemplates)
    expect(values).toHaveBeenCalledWith(template)
  })

  it('applies goals and both audit rows in one transaction', async () => {
    const insert = vi.fn()
    const values = vi.fn().mockResolvedValue(undefined)
    insert.mockReturnValue({ values })
    vi.mocked(db.transaction).mockImplementation(async (callback) => callback({ insert } as never))
    const now = new Date()
    const input = {
      goalGroup: {
        id: 'group-1',
        learnerId: 'learner-1',
        name: 'Reading',
        position: 0,
        sourceTemplateId: 'template-1',
        sourceTemplateTitle: 'Reading',
        createdByUserId: 'user-1',
        createdAt: now,
        updatedAt: now,
      },
      goals: [
        {
          id: 'goal-1',
          learnerId: 'learner-1',
          groupId: 'group-1',
          title: 'Read',
          description: null,
          targetValue: 5,
          unit: 'books',
          startDate: now,
          endDate: now,
          createdAt: now,
          updatedAt: now,
        },
      ],
      auditLog: {
        id: 'audit-1',
        actorId: 'user-1',
        entityType: 'learning-template-application',
        entityId: 'template-1',
        createdAt: now,
      },
      templateAudit: {
        auditLogId: 'audit-1',
        templateId: 'template-1',
        learnerId: 'learner-1',
        goalGroupId: 'group-1',
        createdGoalIds: ['goal-1'],
        appliedStartDate: now,
      },
    }

    await applyWithAudit(input)

    expect(insert).toHaveBeenNthCalledWith(1, goalGroups)
    expect(insert).toHaveBeenNthCalledWith(2, goals)
    expect(insert).toHaveBeenNthCalledWith(3, auditLogs)
    expect(insert).toHaveBeenNthCalledWith(4, auditLogTemplates)
    expect(values).toHaveBeenNthCalledWith(1, input.goalGroup)
    expect(values).toHaveBeenNthCalledWith(2, input.goals)
    expect(values).toHaveBeenNthCalledWith(3, input.auditLog)
    expect(values).toHaveBeenNthCalledWith(4, input.templateAudit)
  })
})
