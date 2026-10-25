import { CheckCircle2, Circle } from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import type { ScheduleTodoWithProgress } from '../types'
import { addDays, enumerateDates } from '../utils/date-range'

function monthTitle(date: string): string {
  return new Intl.DateTimeFormat(getLocale(), {
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00.000Z`))
}

function weekdayLabels(): string[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(2024, 0, index + 1))
    return new Intl.DateTimeFormat(getLocale(), { weekday: 'short', timeZone: 'UTC' }).format(date)
  })
}

export function ScheduleMonthView({
  learnerId,
  start,
  end,
  today,
  todos,
}: {
  learnerId: string
  start: string
  end: string
  today: string
  todos: ScheduleTodoWithProgress[]
}) {
  const dates = enumerateDates(start, end)
  const completed = todos.filter((todo) => todo.completed).length
  const percent = todos.length === 0 ? 0 : Math.round((completed / todos.length) * 100)
  const firstDay = new Date(`${start}T00:00:00.000Z`).getUTCDay()
  const mondayOffset = firstDay === 0 ? 6 : firstDay - 1

  return (
    <div className="space-y-5">
      <Card className="gap-4">
        <CardHeader>
          <CardTitle>{monthTitle(start)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {m.schedule_month_progress({ completed, total: todos.length, percent })}
            </p>
            <span className="text-2xl font-bold">{percent}%</span>
          </div>
          <Progress value={percent} />
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="grid grid-cols-7 border-b bg-muted/40">
          {weekdayLabels().map((label) => (
            <div key={label} className="p-2 text-center text-xs font-medium text-muted-foreground">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: mondayOffset }, (_, index) =>
            addDays(start, index - mondayOffset),
          ).map((date) => (
            <div key={date} className="min-h-24 border-r border-b bg-muted/10" />
          ))}
          {dates.map((date) => {
            const dayTodos = todos.filter((todo) => todo.scheduledDate === date)
            const dayCompleted = dayTodos.filter((todo) => todo.completed).length
            const dayNumber = Number(date.slice(-2))
            return (
              <Link
                key={date}
                to={`/track-app/schedule?learnerId=${learnerId}&date=${date}&view=today`}
                aria-label={m.schedule_open_day({ date })}
                className={`min-h-24 border-r border-b p-2 transition-colors hover:bg-muted/40 ${
                  date === today ? 'bg-primary/5 ring-1 ring-inset ring-primary' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-semibold">{dayNumber}</span>
                  {dayTodos.length > 0 ? (
                    <span className="text-[0.65rem] text-muted-foreground">
                      {dayCompleted}/{dayTodos.length}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 space-y-1">
                  {dayTodos.slice(0, 3).map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-1 text-[0.65rem] sm:text-xs"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="size-3 shrink-0 text-emerald-600" />
                      ) : (
                        <Circle className="size-3 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate">{todo.titleSnapshot}</span>
                    </div>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
