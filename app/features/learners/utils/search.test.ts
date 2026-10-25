import { describe, expect, it } from 'vitest'
import type { LearnerGroupWithToday, LearnerListItemWithToday } from '../types'
import { filterOrganizedLearners } from './search'

function learner(id: string, name: string, groupId: string | null) {
  return {
    id,
    name,
    groupId,
    avatar: null,
    dateOfBirth: null,
    role: 'owner',
    goalsUpdatedToday: 0,
    activitiesAddedToday: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  } satisfies LearnerListItemWithToday
}

const groupedLearner = learner('learner-1', 'Álya Putri', 'group-1')
const ungroupedLearner = learner('learner-2', 'Bima', null)
const groups = [
  {
    id: 'group-1',
    ownerUserId: 'user-1',
    name: 'Class A',
    position: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    learners: [groupedLearner],
  },
] satisfies LearnerGroupWithToday[]

describe('filterOrganizedLearners', () => {
  it('matches learner names case-insensitively and without diacritics', () => {
    const result = filterOrganizedLearners(groups, [ungroupedLearner], '  ALYA ')

    expect(result.groups).toHaveLength(1)
    expect(result.groups[0].learners.map(({ id }) => id)).toEqual(['learner-1'])
    expect(result.ungrouped).toEqual([])
  })

  it('removes groups that contain no matching learners', () => {
    const result = filterOrganizedLearners(groups, [ungroupedLearner], 'bima')

    expect(result.groups).toEqual([])
    expect(result.ungrouped.map(({ id }) => id)).toEqual(['learner-2'])
  })

  it('returns the original collections for a blank query', () => {
    const result = filterOrganizedLearners(groups, [ungroupedLearner], '   ')

    expect(result.groups).toBe(groups)
  })
})
