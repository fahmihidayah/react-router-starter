import { describe, expect, it } from 'vitest'
import type { TActivityTrack } from '~/db/schema'
import type { LearningActivityWithDetails } from '../types'
import { groupActivitiesByTrack } from './activity-track-groups'

const now = new Date('2026-10-04T00:00:00.000Z')
const track = {
  id: 'track-1',
  learnerId: 'learner-1',
  name: 'Writing',
  archivedAt: null,
  createdAt: now,
  updatedAt: now,
} satisfies TActivityTrack

function activity(id: string, trackId: string | null): LearningActivityWithDetails {
  return {
    id,
    learnerId: 'learner-1',
    goalId: null,
    trackId,
    scheduleTodoId: null,
    recordedByUserId: 'user-1',
    recordedByName: 'User',
    trackName: trackId ? 'Writing' : null,
    activityDate: now,
    title: id,
    durationMinutes: null,
    value: null,
    unit: null,
    note: null,
    createdAt: now,
    updatedAt: now,
  }
}

describe('groupActivitiesByTrack', () => {
  it('places records in their active topic and preserves ungrouped or archived records', () => {
    const result = groupActivitiesByTrack(
      [track],
      [activity('active', track.id), activity('ungrouped', null), activity('archived', 'track-2')],
    )

    expect(result.groups[0].activities.map(({ id }) => id)).toEqual(['active'])
    expect(result.previous.map(({ id }) => id)).toEqual(['ungrouped', 'archived'])
  })
})
