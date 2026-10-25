import type { TActivityTrack } from '~/db/schema'
import type { LearningActivityWithDetails } from '~/features/activities/types'
import type { GoalWithProgress } from '~/features/goals/types'
import type { MonthlyLearnerReport, MonthlyReportItem } from '../types'

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function monthKey(date: Date): string {
  return dateKey(date).slice(0, 7)
}

function monthStart(month: string): Date {
  return new Date(`${month}-01T00:00:00.000Z`)
}

function nextMonth(start: Date): Date {
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1))
}

function daysInclusive(start: Date, end: Date): number {
  if (end < start) return 0
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1
}

function isInPeriod(date: Date, start: Date, end: Date): boolean {
  return date >= start && date < end
}

function itemActiveDays(dates: Date[]): number {
  return new Set(dates.map(dateKey)).size
}

export function resolveReportMonth(
  requestedMonth: string | null,
  today: string,
  learnerCreatedAt: Date,
): { month: string; minimumMonth: string; maximumMonth: string } {
  const minimumMonth = monthKey(learnerCreatedAt)
  const maximumMonth = today.slice(0, 7)
  const validRequestedMonth =
    requestedMonth && MONTH_PATTERN.test(requestedMonth) ? requestedMonth : maximumMonth
  const month =
    validRequestedMonth < minimumMonth
      ? minimumMonth
      : validRequestedMonth > maximumMonth
        ? maximumMonth
        : validRequestedMonth

  return { month, minimumMonth, maximumMonth }
}

type BuildMonthlyReportInput = {
  requestedMonth: string | null
  today: string
  learnerCreatedAt: Date
  goals: GoalWithProgress[]
  activities: LearningActivityWithDetails[]
  tracks: TActivityTrack[]
}

export function buildMonthlyLearnerReport({
  requestedMonth,
  today,
  learnerCreatedAt,
  goals,
  activities,
  tracks,
}: BuildMonthlyReportInput): MonthlyLearnerReport {
  const { month, minimumMonth, maximumMonth } = resolveReportMonth(
    requestedMonth,
    today,
    learnerCreatedAt,
  )
  const periodStart = monthStart(month)
  const periodEnd = nextMonth(periodStart)
  const todayDate = new Date(`${today}T00:00:00.000Z`)
  const learnerStart = new Date(`${dateKey(learnerCreatedAt)}T00:00:00.000Z`)
  const eligibleStart = learnerStart > periodStart ? learnerStart : periodStart
  const lastDayOfMonth = new Date(periodEnd.getTime() - 86_400_000)
  const eligibleEnd = todayDate < lastDayOfMonth ? todayDate : lastDayOfMonth
  const eligibleDays = daysInclusive(eligibleStart, eligibleEnd)

  const goalItems = goals.flatMap<MonthlyReportItem>((goal) => {
    const entries = goal.entries.filter((entry) =>
      isInPeriod(entry.activityDate, periodStart, periodEnd),
    )
    const overlapsMonth = goal.startDate < periodEnd && goal.endDate >= periodStart
    if (!overlapsMonth && entries.length === 0) return []

    return [
      {
        id: goal.id,
        name: goal.title,
        recordCount: entries.length,
        activeDays: itemActiveDays(entries.map((entry) => entry.activityDate)),
        durationMinutes: entries.reduce((total, entry) => total + (entry.durationMinutes ?? 0), 0),
        value: entries.reduce((total, entry) => total + entry.value, 0),
        unit: goal.unit,
      },
    ]
  })

  const monthlyActivities = activities.filter((activity) =>
    isInPeriod(activity.activityDate, periodStart, periodEnd),
  )
  const activitiesByTrack = new Map<string, LearningActivityWithDetails[]>()
  for (const activity of monthlyActivities) {
    const id = activity.trackId ?? 'uncategorized'
    const current = activitiesByTrack.get(id) ?? []
    current.push(activity)
    activitiesByTrack.set(id, current)
  }

  const trackItems = tracks.flatMap<MonthlyReportItem>((track) => {
    const existedDuringMonth =
      track.createdAt < periodEnd && (!track.archivedAt || track.archivedAt >= periodStart)
    const records = activitiesByTrack.get(track.id) ?? []
    activitiesByTrack.delete(track.id)
    if (!existedDuringMonth && records.length === 0) return []

    return [
      {
        id: track.id,
        name: track.name,
        recordCount: records.length,
        activeDays: itemActiveDays(records.map((record) => record.activityDate)),
        durationMinutes: records.reduce(
          (total, record) => total + (record.durationMinutes ?? 0),
          0,
        ),
        archived: Boolean(track.archivedAt),
      },
    ]
  })

  for (const [trackId, records] of activitiesByTrack) {
    trackItems.push({
      id: trackId,
      name: records[0]?.trackName ?? 'Uncategorized',
      recordCount: records.length,
      activeDays: itemActiveDays(records.map((record) => record.activityDate)),
      durationMinutes: records.reduce((total, record) => total + (record.durationMinutes ?? 0), 0),
      archived: trackId !== 'uncategorized',
    })
  }

  const allDates = [
    ...goals.flatMap((goal) =>
      goal.entries
        .filter((entry) => isInPeriod(entry.activityDate, periodStart, periodEnd))
        .map((entry) => entry.activityDate),
    ),
    ...monthlyActivities.map((activity) => activity.activityDate),
  ]
  const activeDays = itemActiveDays(allDates)
  const totalRecords =
    goalItems.reduce((total, item) => total + item.recordCount, 0) + monthlyActivities.length

  return {
    month,
    minimumMonth,
    maximumMonth,
    eligibleDays,
    activeDays,
    trackingPercentage:
      eligibleDays === 0 ? 0 : Math.min(100, Math.round((activeDays / eligibleDays) * 100)),
    totalRecords,
    goalItems,
    trackItems,
  }
}
