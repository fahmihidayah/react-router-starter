import { Globe } from 'lucide-react'
import { cn } from '~/lib/utils'
import * as m from '~/paraglide/messages.js'
import { getLocale, setLocale } from '~/paraglide/runtime'

export function LanguageToggle() {
  const locale = getLocale()

  return (
    <fieldset className="flex items-center gap-2 text-[12px] text-[#68738B] sm:text-[13px]">
      <legend className="sr-only">{m.landing_language_label()}</legend>
      <Globe className="size-[17px] text-[#62708B]" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setLocale('id')}
        className={cn(
          'cursor-pointer transition-colors hover:text-[#2F39A9]',
          locale === 'id' && 'font-extrabold text-[#2F39A9]',
        )}
        aria-pressed={locale === 'id'}
      >
        <span className="sm:hidden">ID</span>
        <span className="hidden sm:inline">Bahasa Indonesia</span>
      </button>
      <span className="text-[#CBD1DE]" aria-hidden="true">
        /
      </span>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={cn(
          'cursor-pointer transition-colors hover:text-[#2F39A9]',
          locale === 'en' && 'font-extrabold text-[#2F39A9]',
        )}
        aria-pressed={locale === 'en'}
      >
        <span className="sm:hidden">EN</span>
        <span className="hidden sm:inline">English</span>
      </button>
    </fieldset>
  )
}
