import { Link } from 'react-router'
import { ArrowRightIcon, CodeIcon, DatabaseIcon, LockIcon, ZapIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'

export function meta() {
  return [
    { title: 'Home - Starter App' },
    { name: 'description', content: 'Modern full-stack starter with React Router 7, TypeScript, and authentication' },
  ]
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            React Router 7 Starter
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Build Something
            <span className="block text-primary">Amazing</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A modern, production-ready starter app with authentication, database, and best practices
            built in. Start shipping features, not boilerplate.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-base">
              <Link to="/posts">
                View Posts
                <ArrowRightIcon className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link to="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg">
              Built with modern tools and best practices
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ZapIcon className="size-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Built on React Router 7 with Vite for instant HMR and optimal performance
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <LockIcon className="size-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Secure Auth</h3>
              <p className="text-sm text-muted-foreground">
                Better Auth integration with session management and protected routes
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <DatabaseIcon className="size-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Type-Safe DB</h3>
              <p className="text-sm text-muted-foreground">
                Drizzle ORM with TypeScript for end-to-end type safety and migrations
              </p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <CodeIcon className="size-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Best Practices</h3>
              <p className="text-sm text-muted-foreground">
                Feature-based architecture, linting, formatting, and testing ready
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="container mx-auto px-4 py-20 border-t">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Modern Tech Stack
            </h2>
            <p className="text-muted-foreground text-lg">
              Carefully selected tools that work great together
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6 space-y-2">
              <h3 className="font-semibold">Frontend</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• React Router 7 with SSR</li>
                <li>• TypeScript 5.8</li>
                <li>• Radix UI + Tailwind 4</li>
                <li>• React Hook Form + Zod</li>
                <li>• TanStack Query & Table</li>
              </ul>
            </div>

            <div className="border rounded-lg p-6 space-y-2">
              <h3 className="font-semibold">Backend</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Drizzle ORM + SQLite</li>
                <li>• Better Auth</li>
                <li>• File-based routing</li>
                <li>• Server actions & loaders</li>
                <li>• Repository pattern</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to Start Building?
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore the posts feature or dive into the dashboard to see what's possible
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/posts">
                Browse Posts
                <ArrowRightIcon className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/dashboard">
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
