import { ArrowRightIcon, UsersIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button'

export function CtaSection() {
  return (
    <section className="container mx-auto px-4 py-20 border-t">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10">
          <UsersIcon className="size-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Ready to start tracking together?
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Create your first group, invite members, and set goals in minutes. Free for individuals and
          small groups.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg" className="text-base px-8 h-12">
            <Link to="/register">
              Create Free Account
              <ArrowRightIcon className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-base px-8 h-12">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
