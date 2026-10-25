import { ArrowRight, LayoutDashboard, Mail, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button'

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Authentication',
    description: 'Login, registration, password reset, and email verification out of the box.',
  },
  {
    icon: LayoutDashboard,
    title: 'Admin panel',
    description: 'Role-based access control with a ready-made admin dashboard.',
  },
  {
    icon: Mail,
    title: 'Email & background jobs',
    description: 'Transactional email with audit logging and a RabbitMQ worker.',
  },
] as const

export function LandingPage() {
  return (
    <div className="flex flex-col">
      <section className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:py-28">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Starter template
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Build your next web app faster
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          A production-ready React Router starter with authentication, role-based access control, an
          admin panel, Redis caching, RabbitMQ jobs, and transactional email — tested and ready to
          extend.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/register">
              Get started
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-xl border bg-background p-6">
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
