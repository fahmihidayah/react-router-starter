import { Rocket } from 'lucide-react'
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

function AuthBrand() {
  return (
    <Link
      to="/"
      aria-label="Starter home"
      className="flex w-fit items-center gap-2.5 transition-opacity hover:opacity-80"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Rocket className="size-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-bold text-foreground">Starter</span>
        <span className="text-xs text-muted-foreground">Full-stack boilerplate</span>
      </span>
    </Link>
  )
}

type TAuthCardProps = {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthCard({ title, description, children, footer }: TAuthCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  )
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8 flex w-full max-w-md items-center justify-between">
        <AuthBrand />
        <LanguageSwitcher />
      </div>
      {children}
    </main>
  )
}
