'use client'

import { GlobeIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { cn } from '~/lib/utils'
import { getLocale, locales, setLocale } from '~/paraglide/runtime'

type TLocale = (typeof locales)[number]

const localeNames: Record<TLocale, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const currentLocale = getLocale()

  const handleLocaleChange = (value: string) => {
    setLocale(value as TLocale)
  }

  return (
    <Select value={currentLocale} onValueChange={handleLocaleChange}>
      <SelectTrigger className={cn('w-fit gap-2', className)} size="sm">
        <GlobeIcon className="size-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {localeNames[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
