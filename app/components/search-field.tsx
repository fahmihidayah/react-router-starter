import { Search, X } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

export function SearchField({
  value,
  onChange,
  label,
  placeholder,
  clearLabel,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder: string
  clearLabel: string
}) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        placeholder={placeholder}
        className="pr-10 pl-9 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onChange('')}
          aria-label={clearLabel}
          className="absolute top-1/2 right-0.5 -translate-y-1/2"
        >
          <X />
        </Button>
      ) : null}
    </div>
  )
}
