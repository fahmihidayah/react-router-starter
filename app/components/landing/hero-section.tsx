import { ArrowRightIcon, UsersIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '~/components/ui/button'

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium">
          <UsersIcon className="size-4 text-primary" />
          <span>Track anything, together</span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Reach your goals
          <span className="block text-primary">with the people you care about</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Create learning groups, set daily goals, and track progress together. Perfect for families,
          classrooms, clubs, and any circle that grows together.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button asChild size="lg" className="text-base px-8 h-12">
            <Link to="/register">
              Get Started Free
              <ArrowRightIcon className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-base px-8 h-12">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground pt-2">
          No credit card required. Free for individuals and small groups.
        </p>
      </div>
    </section>
  )
}
