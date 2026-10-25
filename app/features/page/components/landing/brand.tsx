import { Rocket } from 'lucide-react'
import { Link } from 'react-router'

interface BrandProps {
  compact?: boolean
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Rocket className="size-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-bold tracking-tight text-foreground ${compact ? 'text-base' : 'text-lg'}`}
        >
          Starter
        </span>
        <span className="text-[11px] text-muted-foreground">Full-stack boilerplate</span>
      </span>
    </Link>
  )
}
