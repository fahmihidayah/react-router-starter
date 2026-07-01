'use client'

import { GlobeIcon } from 'lucide-react'
import { getLocale, locales, setLocale } from '~/paraglide/runtime'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

type TLocale = (typeof locales)[number]

const localeNames: Record<TLocale, string> = {
  en: 'English',
  de: 'Deutsch',
}

export function LanguageSwitcher() {
  const currentLocale = getLocale()

  const handleLocaleChange = (value: string) => {
    setLocale(value as TLocale)
  }

  return (
    <Select value={currentLocale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-fit gap-2" size="sm">
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
