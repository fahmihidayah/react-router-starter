import { ArrowUpRight, BookOpenCheck, Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { LanguageSwitcher } from '~/components/language-switcher'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import * as m from '~/paraglide/messages.js'

type TAuthShellProps = {
  children: ReactNode
  eyebrow: string
  infoTitle: string
  infoDescription: string
  highlights: string[]
}

type TAuthCardProps = {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

function AuthBrand({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      to="/"
      aria-label={m.auth_brand_home_label()}
      className="group flex w-fit items-center gap-3"
    >
      <span
        className={`grid size-11 place-items-center rounded-2xl transition-transform group-hover:-rotate-3 ${
          inverted ? 'bg-white/15 text-white ring-1 ring-white/20' : 'bg-primary text-white'
        }`}
      >
        <BookOpenCheck className="size-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col">
        <span
          className={`text-base font-bold leading-tight ${inverted ? 'text-white' : 'text-foreground'}`}
        >
          {m.auth_brand_name()}
        </span>
        <span
          className={`text-xs leading-tight ${inverted ? 'text-white/65' : 'text-muted-foreground'}`}
        >
          {m.auth_brand_byline()}
        </span>
      </span>
    </Link>
  )
}

export function AuthShell({
  children,
  eyebrow,
  infoTitle,
  infoDescription,
  highlights,
}: TAuthShellProps) {
  return (
    <main className="min-h-svh bg-background lg:grid lg:grid-cols-2">
      <aside className="relative hidden min-h-svh overflow-hidden bg-primary px-12 py-10 text-primary-foreground lg:flex lg:flex-col xl:px-20 xl:py-14">
        <div
          className="pointer-events-none absolute -left-32 -top-40 size-[30rem] rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-14 -top-20 size-[20rem] rounded-full border border-white/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-24 size-96 rounded-full bg-brand-mint/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-start justify-between gap-6">
          <AuthBrand inverted />
          <LanguageSwitcher className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white" />
        </div>

        <div className="relative z-10 my-auto max-w-xl py-16">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-brand-mint">
            {eyebrow}
          </p>
          <h1 className="max-w-lg text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-5xl">
            {infoTitle}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-white/70 xl:text-lg">
            {infoDescription}
          </p>

          <ul className="mt-10 grid gap-4" aria-label={m.auth_benefits_label()}>
            {highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-3 text-sm text-white/85">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-mint/15 text-brand-mint">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                <span className="pt-0.5 leading-6">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          to="/"
          className="relative z-10 flex w-fit items-center gap-2 text-sm font-medium text-white/65 transition-colors hover:text-white"
        >
          {m.auth_explore_home()}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </aside>

      <section className="flex min-h-svh flex-col px-4 py-5 sm:px-8 sm:py-8 lg:justify-center lg:px-12 xl:px-20">
        <div className="mx-auto flex w-full max-w-lg shrink-0 items-center justify-between gap-4 lg:hidden">
          <AuthBrand />
          <LanguageSwitcher />
        </div>

        <div className="mx-auto my-auto w-full max-w-lg shrink-0 py-8 sm:py-12 lg:my-0 lg:py-8">
          <div className="mb-7 lg:hidden">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <p className="max-w-md text-lg font-semibold leading-7 text-foreground">{infoTitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}

export function AuthCard({ title, description, children, footer }: TAuthCardProps) {
  return (
    <Card className="gap-0 border-border/80 py-0 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-2 px-5 pb-6 pt-6 sm:px-8 sm:pt-8">
        <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</CardTitle>
        <CardDescription className="text-sm leading-6 sm:text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-6 sm:px-8 sm:pb-8">{children}</CardContent>
      {footer ? (
        <CardFooter className="border-t bg-muted/30 px-5 py-5 sm:px-8">{footer}</CardFooter>
      ) : null}
    </Card>
  )
}
