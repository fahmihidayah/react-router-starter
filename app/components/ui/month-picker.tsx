'use client'

import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { cn } from '~/lib/utils'

const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/

type MonthPickerProps = {
  value: string
  onValueChange: (value: string) => void
  min?: string
  max?: string
  locale?: string
  label?: string
  previousYearLabel?: string
  nextYearLabel?: string
  disabled?: boolean
  className?: string
}

function parseMonth(value: string) {
  const match = MONTH_PATTERN.exec(value)
  if (!match) return null

  return {
    year: Number(match[1]),
    monthIndex: Number(match[2]) - 1,
  }
}

function monthValue(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

function monthDate(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex, 1))
}

export function MonthPicker({
  value,
  onValueChange,
  min,
  max,
  locale = 'en',
  label = 'Choose month',
  previousYearLabel = 'Previous year',
  nextYearLabel = 'Next year',
  disabled,
  className,
}: MonthPickerProps) {
  const selected = parseMonth(value)
  const minimum = min ? parseMonth(min) : null
  const maximum = max ? parseMonth(max) : null
  const initialYear = selected?.year ?? minimum?.year ?? maximum?.year ?? new Date().getFullYear()
  const [open, setOpen] = useState(false)
  const [displayedYear, setDisplayedYear] = useState(initialYear)
  const selectedYear = selected?.year
  const minimumYear = minimum?.year
  const maximumYear = maximum?.year

  useEffect(() => {
    if (selectedYear !== undefined) setDisplayedYear(selectedYear)
  }, [selectedYear])

  const monthNames = useMemo(
    () =>
      Array.from({ length: 12 }, (_, monthIndex) => ({
        short: new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(
          monthDate(displayedYear, monthIndex),
        ),
        long: new Intl.DateTimeFormat(locale, {
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        }).format(monthDate(displayedYear, monthIndex)),
      })),
    [displayedYear, locale],
  )

  const selectedLabel = selected
    ? new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(monthDate(selected.year, selected.monthIndex))
    : label

  function selectMonth(monthIndex: number) {
    const nextValue = monthValue(displayedYear, monthIndex)
    if ((min && nextValue < min) || (max && nextValue > max)) return

    onValueChange(nextValue)
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen && selected) setDisplayedYear(selected.year)
        setOpen(nextOpen)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={label}
          aria-expanded={open}
          className={cn('min-w-44 justify-start px-3 font-normal', className)}
        >
          <CalendarDays className="text-muted-foreground" />
          <span className="flex-1 text-left capitalize">{selectedLabel}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <div className="mb-3 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={minimumYear !== undefined && displayedYear <= minimumYear}
            aria-label={previousYearLabel}
            onClick={() => setDisplayedYear((year) => year - 1)}
          >
            <ChevronLeft />
          </Button>
          <p className="text-sm font-medium tabular-nums" aria-live="polite">
            {displayedYear}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={maximumYear !== undefined && displayedYear >= maximumYear}
            aria-label={nextYearLabel}
            onClick={() => setDisplayedYear((year) => year + 1)}
          >
            <ChevronRight />
          </Button>
        </div>

        <fieldset className="grid grid-cols-3 gap-1">
          <legend className="sr-only">{label}</legend>
          {monthNames.map((month, monthIndex) => {
            const optionValue = monthValue(displayedYear, monthIndex)
            const isSelected = optionValue === value
            const isDisabled = Boolean((min && optionValue < min) || (max && optionValue > max))

            return (
              <Button
                key={optionValue}
                type="button"
                variant={isSelected ? 'default' : 'ghost'}
                disabled={isDisabled}
                aria-label={month.long}
                aria-pressed={isSelected}
                className="h-10 capitalize"
                onClick={() => selectMonth(monthIndex)}
              >
                {month.short}
              </Button>
            )
          })}
        </fieldset>
      </PopoverContent>
    </Popover>
  )
}
