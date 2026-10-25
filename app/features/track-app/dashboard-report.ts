import type { DashboardGoalItem, DashboardLearner } from './types'

function dateKey(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10)
}

export function hasEntryOnDate(entries: { activityDate: Date | string }[], date: string) {
  return entries.some((entry) => dateKey(entry.activityDate) === date)
}

export function isDateWithinPeriod(date: string, startDate: Date | string, endDate: Date | string) {
  return dateKey(startDate) <= date && dateKey(endDate) >= date
}

export function buildDashboardGoalReport(learners: DashboardLearner[], today: string) {
  const manageableLearners = learners.filter((learner) => learner.role !== 'viewer')
  const expectedGoals = manageableLearners.flatMap((learner) =>
    learner.goals.filter(
      (goal) =>
        isDateWithinPeriod(today, goal.startDate, goal.endDate) &&
        (goal.currentValue < goal.targetValue || hasEntryOnDate(goal.entries, today)),
    ),
  )
  const updatedGoals = expectedGoals.filter((goal) => hasEntryOnDate(goal.entries, today)).length
  const attentionItems: DashboardGoalItem[] = manageableLearners
    .flatMap((learner) =>
      learner.goals
        .filter(
          (goal) =>
            goal.currentValue < goal.targetValue &&
            isDateWithinPeriod(today, goal.startDate, goal.endDate) &&
            !hasEntryOnDate(goal.entries, today),
        )
        .map((goal) => ({ learner, goal })),
    )
    .sort((a, b) => new Date(a.goal.endDate).getTime() - new Date(b.goal.endDate).getTime())

  return {
    expectedGoalCount: expectedGoals.length,
    updatedGoalCount: updatedGoals,
    attentionItems,
    learnersNeedingAttention: new Set(attentionItems.map((item) => item.learner.id)).size,
  }
}
