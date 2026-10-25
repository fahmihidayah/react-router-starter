import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userContext } from '~/features/users/contexts'
import type { ActionArgs } from '~/lib/types'
import * as goalService from '../services'
import { createGoalAction, saveProgressEntryAction } from './goal-actions'

vi.mock('../services', () => ({ createForLearner: vi.fn(), saveEntryForLearner: vi.fn() }))

function args(data: Record<string, string>): ActionArgs {
  const formData = new FormData()
  for (const [key, value] of Object.entries(data)) formData.set(key, value)

  return {
    request: new Request('http://localhost/track-app/learners/learner-1', {
      method: 'POST',
      body: formData,
    }),
    params: { id: 'learner-1' },
    context: {
      get: vi.fn((context) => (context === userContext ? { user: { id: 'user-1' } } : undefined)),
    } as never,
  }
}

const validGoal = {
  title: 'Read every day',
  description: '',
  targetValue: '10',
  unit: 'pages',
  startDate: '2026-10-04',
  durationValue: '28',
  durationUnit: 'days',
}

describe('createGoalAction', () => {
  beforeEach(() => vi.resetAllMocks())

  it('creates an ungrouped goal when groupId is absent', async () => {
    vi.mocked(goalService.createForLearner).mockResolvedValue({ id: 'goal-1' } as never)

    const result = await createGoalAction(args(validGoal), 'learner-1')

    expect(goalService.createForLearner).toHaveBeenCalledWith('learner-1', 'user-1', {
      title: validGoal.title,
      description: validGoal.description,
      targetValue: 10,
      unit: validGoal.unit,
      startDate: validGoal.startDate,
      endDate: '2026-10-31',
      groupId: undefined,
    })
    expect(result).toBeInstanceOf(Response)
    expect((result as Response).headers.get('location')).toBe(
      '/track-app/learners/learner-1?tab=goals',
    )
  })

  it('creates a goal in the selected group', async () => {
    vi.mocked(goalService.createForLearner).mockResolvedValue({ id: 'goal-1' } as never)

    await createGoalAction(args({ ...validGoal, groupId: 'group-1' }), 'learner-1')

    expect(goalService.createForLearner).toHaveBeenCalledWith(
      'learner-1',
      'user-1',
      expect.objectContaining({ groupId: 'group-1' }),
    )
  })

  it('calculates the end date from a duration in months', async () => {
    vi.mocked(goalService.createForLearner).mockResolvedValue({ id: 'goal-1' } as never)

    await createGoalAction(
      args({ ...validGoal, startDate: '2026-10-06', durationValue: '2', durationUnit: 'months' }),
      'learner-1',
    )

    expect(goalService.createForLearner).toHaveBeenCalledWith(
      'learner-1',
      'user-1',
      expect.objectContaining({ startDate: '2026-10-06', endDate: '2026-12-05' }),
    )
  })
})

describe('saveProgressEntryAction', () => {
  beforeEach(() => vi.resetAllMocks())

  it('requires an amount', async () => {
    const result = await saveProgressEntryAction(
      args({ value: '', durationMinutes: '', note: '' }),
      'learner-1',
      'goal-1',
    )

    expect(result).toMatchObject({ success: false, operation: 'entry', goalId: 'goal-1' })
    expect(result).toHaveProperty('errors.value')
    expect(goalService.saveEntryForLearner).not.toHaveBeenCalled()
  })

  it('allows duration and note to be omitted', async () => {
    vi.mocked(goalService.saveEntryForLearner).mockResolvedValue({ id: 'entry-1' } as never)

    const result = await saveProgressEntryAction(
      args({ value: '4', durationMinutes: '', note: '' }),
      'learner-1',
      'goal-1',
      '/track-app/goals/goal-1',
    )

    expect(goalService.saveEntryForLearner).toHaveBeenCalledWith('learner-1', 'user-1', 'goal-1', {
      value: 4,
      durationMinutes: undefined,
      note: '',
    })
    expect((result as Response).headers.get('location')).toBe('/track-app/goals/goal-1')
  })

  it('preserves Pomodoro mode when goal progress validation fails', async () => {
    const result = await saveProgressEntryAction(
      args({ entryMode: 'pomodoro', value: '', durationMinutes: '25', note: '' }),
      'learner-1',
      'goal-1',
    )

    expect(result).toMatchObject({
      success: false,
      operation: 'entry',
      goalId: 'goal-1',
      entryMode: 'pomodoro',
    })
    expect(goalService.saveEntryForLearner).not.toHaveBeenCalled()
  })
})
