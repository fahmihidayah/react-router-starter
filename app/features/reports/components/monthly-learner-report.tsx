import {
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Info,
  Target,
} from 'lucide-react'
import { useSearchParams } from 'react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { MonthPicker } from '~/components/ui/month-picker'
import type { MonthlyLearnerReport, MonthlyReportItem } from '~/features/reports/types'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'

function displayMonth(month: string): string {
  return new Intl.DateTimeFormat(getLocale(), {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${month}-01T00:00:00.000Z`))
}

function shiftedMonth(month: string, amount: number): string {
  const date = new Date(`${month}-01T00:00:00.000Z`)
  date.setUTCMonth(date.getUTCMonth() + amount)
  return date.toISOString().slice(0, 7)
}

function ReportChart({
  title,
  description,
  items,
  kind,
}: {
  title: string
  description: string
  items: MonthlyReportItem[]
  kind: 'goal' | 'track'
}) {
  const maximum = Math.max(1, ...items.map((item) => item.recordCount))
  const Icon = kind === 'goal' ? Target : BookOpenCheck
  const color = kind === 'goal' ? 'bg-chart-1' : 'bg-chart-4'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-5 text-primary" /> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            {m.report_no_items()}
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((item) => {
              const width = (item.recordCount / maximum) * 100
              const itemName = item.id === 'uncategorized' ? m.report_uncategorized() : item.name
              return (
                <div key={item.id}>
                  <div className="mb-2 flex items-start justify-between gap-4 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium" title={itemName}>
                        {itemName}
                        {item.archived ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {m.report_archived()}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {m.report_active_days({ count: item.activeDays })}
                        {item.durationMinutes > 0
                          ? ` · ${m.report_minutes({ count: item.durationMinutes })}`
                          : null}
                        {item.value !== undefined && item.unit && item.recordCount > 0
                          ? ` · ${item.value} ${item.unit}`
                          : null}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {m.report_records({ count: item.recordCount })}
                    </span>
                  </div>
                  <div
                    className="h-3 overflow-hidden rounded-full bg-muted"
                    role="img"
                    aria-label={m.report_bar_label({
                      name: itemName,
                      count: item.recordCount,
                    })}
                  >
                    <div
                      className={`h-full rounded-full ${color} transition-[width] duration-500`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function MonthlyLearnerReportView({ report }: { report: MonthlyLearnerReport }) {
  const [searchParams, setSearchParams] = useSearchParams()

  function selectMonth(month: string) {
    const next = new URLSearchParams(searchParams)
    next.set('tab', 'overview')
    next.set('month', month)
    setSearchParams(next, { preventScrollReset: true })
  }

  const previousMonth = shiftedMonth(report.month, -1)
  const nextMonth = shiftedMonth(report.month, 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{m.report_title()}</h2>
          <p className="text-sm text-muted-foreground">{m.report_description()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={previousMonth < report.minimumMonth}
            aria-label={m.report_previous_month()}
            onClick={() => selectMonth(previousMonth)}
          >
            <ChevronLeft />
          </Button>
          <MonthPicker
            value={report.month}
            min={report.minimumMonth}
            max={report.maximumMonth}
            locale={getLocale()}
            label={m.report_choose_month()}
            previousYearLabel={m.report_previous_year()}
            nextYearLabel={m.report_next_year()}
            onValueChange={selectMonth}
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={nextMonth > report.maximumMonth}
            aria-label={m.report_next_month()}
            onClick={() => selectMonth(nextMonth)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{m.report_tracking_consistency()}</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{report.trackingPercentage}%</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {m.report_active_days_of_eligible({
              active: report.activeDays,
              eligible: report.eligibleDays,
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{m.report_total_records()}</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{report.totalRecords}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {m.report_goals_and_activities()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{m.report_period()}</CardDescription>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="size-5 text-primary" /> {displayMonth(report.month)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {m.report_period_days({ count: report.eligibleDays })}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>{m.report_consistency_explanation()}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportChart
          title={m.report_goals_title()}
          description={m.report_goals_description()}
          items={report.goalItems}
          kind="goal"
        />
        <ReportChart
          title={m.report_activities_title()}
          description={m.report_activities_description()}
          items={report.trackItems}
          kind="track"
        />
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <BarChart3 className="size-4" /> {m.report_chart_scale_note()}
      </p>
    </div>
  )
}
