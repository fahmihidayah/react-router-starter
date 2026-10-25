'use client'

import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { cn } from '~/lib/utils'
import { getLocale } from '~/paraglide/runtime.js'

interface DatePickerProps {
  id: string
  name: string
  placeholder?: string
  invalid?: boolean
  describedBy?: string
  defaultValue?: string
  defaultMonth?: Date
  startMonth?: Date
  endMonth?: Date
  captionLayout?: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years'
  onValueChange?: (value: string) => void
}

function localDate(value?: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function DatePicker({
  id,
  name,
  placeholder = 'Pick a date',
  invalid,
  describedBy,
  defaultValue,
  defaultMonth,
  startMonth,
  endMonth,
  captionLayout = 'label',
  onValueChange,
}: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(() => localDate(defaultValue))
  const [open, setOpen] = useState(false)
  const locale = getLocale() === 'id' ? idLocale : enUS

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <input type="hidden" name={name} value={date ? format(date, 'yyyy-MM-dd') : ''} />
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <CalendarIcon />
          {date ? format(date, 'PPP', { locale }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          locale={locale}
          mode="single"
          selected={date}
          defaultMonth={date || defaultMonth}
          startMonth={startMonth}
          endMonth={endMonth}
          captionLayout={captionLayout}
          fixedWeeks
          onSelect={(selected) => {
            setDate(selected)
            onValueChange?.(selected ? format(selected, 'yyyy-MM-dd') : '')
            if (selected) setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
