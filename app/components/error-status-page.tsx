import { ArrowLeft, CircleAlert, Home, LockKeyhole, MapPinOff, ShieldX } from 'lucide-react'
import { Link } from 'react-router'
import { LanguageSwitcher } from '~/components/language-switcher'
import { Button } from '~/components/ui/button'
import * as m from '~/paraglide/messages.js'

export type ErrorStatus = 400 | 401 | 403 | 404 | 500

interface ErrorStatusPageProps {
  status: ErrorStatus
  technicalDetails?: string
}

const content = {
  400: {
    eyebrow: m.error_400_eyebrow,
    title: m.error_400_title,
    description: m.error_400_description,
    help: m.error_400_help,
    icon: CircleAlert,
  },
  401: {
    eyebrow: m.error_401_eyebrow,
    title: m.error_401_title,
    description: m.error_401_description,
    help: m.error_401_help,
    icon: LockKeyhole,
  },
  403: {
    eyebrow: m.error_403_eyebrow,
    title: m.error_403_title,
    description: m.error_403_description,
    help: m.error_403_help,
    icon: ShieldX,
  },
  404: {
    eyebrow: m.error_404_eyebrow,
    title: m.error_404_title,
    description: m.error_404_description,
    help: m.error_404_help,
    icon: MapPinOff,
  },
  500: {
    eyebrow: m.error_500_eyebrow,
    title: m.error_500_title,
    description: m.error_500_description,
    help: m.error_500_help,
    icon: ShieldX,
  },
} as const

export function getErrorStatus(status: number): ErrorStatus | undefined {
  if (status === 400 || status === 401 || status === 403 || status === 404) return status
  return undefined
}

export function ErrorStatusPage({ status, technicalDetails }: ErrorStatusPageProps) {
  const page = content[status]
  const Icon = page.icon

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16">
      <div
        className="absolute inset-x-0 top-0 -z-10 h-80 bg-linear-to-b from-primary/10 to-transparent"
        aria-hidden="true"
      />

      <div className="absolute right-4 top-4 sm:right-8 sm:top-8">
        <LanguageSwitcher />
      </div>

      <section className="w-full max-w-xl text-center" aria-labelledby="error-title">
        <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-3xl border bg-card shadow-sm">
          <Icon className="size-10 text-primary" aria-hidden="true" />
        </div>

        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {status}
          </span>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {page.eyebrow()}
          </p>
        </div>

        <h1 id="error-title" className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          {page.title()}
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
          {page.description()}
        </p>

        <div className="mt-8 rounded-xl border bg-card/80 p-4 text-sm leading-6 text-muted-foreground shadow-xs">
          {page.help()}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/">
              <Home aria-hidden="true" />
              {m.error_action_home()}
            </Link>
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft aria-hidden="true" />
            {m.error_action_back()}
          </Button>
        </div>

        {technicalDetails && (
          <details className="mt-10 text-left text-sm text-muted-foreground">
            <summary className="cursor-pointer font-medium">{m.error_technical_details()}</summary>
            <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-muted p-4 text-xs">
              <code>{technicalDetails}</code>
            </pre>
          </details>
        )}
      </section>
    </main>
  )
}
