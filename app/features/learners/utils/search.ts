import { matchesSearchQuery } from '~/utils/search'
import type { LearnerGroupWithToday, LearnerListItemWithToday } from '../types'

export function filterOrganizedLearners(
  groups: LearnerGroupWithToday[],
  ungrouped: LearnerListItemWithToday[],
  query: string,
) {
  if (!query.trim()) return { groups, ungrouped }

  return {
    groups: groups
      .map((group) => ({
        ...group,
        learners: group.learners.filter((learner) => matchesSearchQuery(query, [learner.name])),
      }))
      .filter((group) => group.learners.length > 0),
    ungrouped: ungrouped.filter((learner) => matchesSearchQuery(query, [learner.name])),
  }
}
