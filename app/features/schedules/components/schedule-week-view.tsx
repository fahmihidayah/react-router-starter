import { CheckCircle2, Circle, Clock3 } from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import type { ScheduleTodoWithProgress } from '../types'
import { enumerateDates } from '../utils/date-range'

function dayLabel(date: string): string {
  return new Intl.DateTimeFormat(getLocale(), {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    weekday: 'short',
  }).format(new Date(`${date}T00:00:00.000Z`))
}

export function ScheduleWeekView({
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

  return (
    <div className="space-y-5">
      <Card className="gap-4">
        <CardHeader>
          <CardTitle>{m.schedule_week()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {m.schedule_week_progress({ completed, total: todos.length, percent })}
            </p>
            <span className="text-2xl font-bold">{percent}%</span>
          </div>
          <Progress value={percent} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dates.map((date) => {
          const dayTodos = todos.filter((todo) => todo.scheduledDate === date)
          const dayCompleted = dayTodos.filter((todo) => todo.completed).length
          const dayPercent =
            dayTodos.length === 0 ? 0 : Math.round((dayCompleted / dayTodos.length) * 100)
          return (
            <Card key={date} className={date === today ? 'border-primary shadow-md' : undefined}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>{dayLabel(date)}</span>
                  <span className="text-xs font-normal text-muted-foreground">{dayPercent}%</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dayTodos.length > 0 ? (
                  <ul className="space-y-2">
                    {dayTodos.map((todo) => (
                      <li key={todo.id} className="flex items-start gap-2 text-sm">
                        {todo.completed ? (
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        ) : (
                          <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="min-w-0 flex-1 truncate">{todo.titleSnapshot}</span>
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                          <Clock3 className="size-3" /> {todo.plannedDurationMinutes}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">{m.schedule_empty_day_title()}</p>
                )}
                <Link
                  className="inline-flex text-sm font-medium text-primary hover:underline"
                  to={`/track-app/schedule?learnerId=${learnerId}&date=${date}&view=today`}
                >
                  {m.schedule_open_day({ date: dayLabel(date) })}
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
