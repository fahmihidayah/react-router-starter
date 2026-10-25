export const goalDurationUnits = ['days', 'months'] as const

export type GoalDurationUnit = (typeof goalDurationUnits)[number]

function parseDateValue(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new RangeError('Invalid start date')

  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    throw new RangeError('Invalid start date')
  }

  return date
}

export function isGoalDateValue(value: string): boolean {
  try {
    parseDateValue(value)
    return true
  } catch {
    return false
  }
}

function formatDateValue(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Calculates an inclusive goal period, so one day starts and ends on the same date. */
export function calculateGoalEndDate(
  startDate: string,
  duration: number,
  unit: GoalDurationUnit,
): string {
  if (!Number.isInteger(duration) || duration < 1) throw new RangeError('Invalid goal duration')

  const endDate = parseDateValue(startDate)

  if (unit === 'days') {
    endDate.setUTCDate(endDate.getUTCDate() + duration - 1)
    return formatDateValue(endDate)
  }

  const originalDay = endDate.getUTCDate()
  endDate.setUTCDate(1)
  endDate.setUTCMonth(endDate.getUTCMonth() + duration)
  const lastDayOfTargetMonth = new Date(
    Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth() + 1, 0),
  ).getUTCDate()
  endDate.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth))
  endDate.setUTCDate(endDate.getUTCDate() - 1)

  return formatDateValue(endDate)
}
