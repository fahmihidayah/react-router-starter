const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/

export function isDateKey(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false
  return new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value
}

export function dateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).formatToParts(date)
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

export function addDays(date: string, amount: number): string {
  const value = new Date(`${date}T00:00:00.000Z`)
  value.setUTCDate(value.getUTCDate() + amount)
  return value.toISOString().slice(0, 10)
}

export function enumerateDates(start: string, end: string): string[] {
  const dates: string[] = []
  for (let date = start; date <= end; date = addDays(date, 1)) dates.push(date)
  return dates
}

export function monthRange(date: string): { start: string; end: string } {
  const value = new Date(`${date.slice(0, 7)}-01T00:00:00.000Z`)
  const start = value.toISOString().slice(0, 10)
  value.setUTCMonth(value.getUTCMonth() + 1)
  value.setUTCDate(0)
  return { start, end: value.toISOString().slice(0, 10) }
}

export function weekRange(date: string): { start: string; end: string } {
  const value = new Date(`${date}T00:00:00.000Z`)
  const day = value.getUTCDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const start = addDays(date, mondayOffset)
  return { start, end: addDays(start, 6) }
}
