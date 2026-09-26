import { BookOpenCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

type TAuthShellProps = {
  children: ReactNode
}

type TAuthCardProps = {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthShell({ children }: TAuthShellProps) {
  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(28rem,34rem)]">
      <aside className="relative hidden overflow-hidden border-e bg-primary-soft p-12 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex w-fit items-center gap-3 font-heading font-semibold">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <BookOpenCheck className="size-5" aria-hidden="true" />
          </span>
          Learning Tracker
        </Link>

        <div className="max-w-xl space-y-5 border-s-2 border-accent ps-8">
          <p className="font-mono text-xs text-muted-foreground">LEARN · REFLECT · GROW</p>
          <h1 className="text-page">Keep every learner's next step clear.</h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            Goals, activities, and progress stay together, with the right context for families and
            teachers.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">Calm by default. Clear in every language.</p>
      </aside>

      <section className="relative flex min-h-svh items-center justify-center px-4 py-20 sm:px-8">
        <div className="w-full max-w-md space-y-6">
          <Link
            to="/"
            className="flex w-fit items-center gap-3 font-heading font-semibold lg:hidden"
          >
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <BookOpenCheck className="size-5" aria-hidden="true" />
            </span>
            Learning Tracker
          </Link>
          {children}
        </div>
      </section>
    </main>
  )
}

export function AuthCard({ title, description, children, footer }: TAuthCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer ? <CardFooter className="border-t pt-6">{footer}</CardFooter> : null}
    </Card>
  )
}
