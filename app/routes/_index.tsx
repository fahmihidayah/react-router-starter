import { Database, PaintBucketIcon, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { Footer } from '~/components/layouts/footer'
import { Header } from '~/components/layouts/header'
import { Button } from '~/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { auth } from '~/lib/auth'
import type { Route } from './+types/_index'

export function meta(_meta: Route.MetaArgs) {
  return [
    { title: 'Starter App - Build Something Amazing' },
    { name: 'description', content: 'Modern full-stack starter app with authentication' },
  ]
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  return {
    user: session?.user || null,
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Navigation */}
      <Header user={user} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              Modern Stack
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Build Something <span className="text-primary">Amazing</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A production-ready starter app with authentication, database, and UI components.
              Everything you need to launch your next project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link to="/register">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <ShieldCheck />
                </div>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>
                  Secure authentication with better-auth. Email/password login and protected routes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Database />
                </div>
                <CardTitle>Database Ready</CardTitle>
                <CardDescription>
                  SQLite with Drizzle ORM. Type-safe queries and easy migrations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <PaintBucketIcon />
                </div>
                <CardTitle>Beautiful UI</CardTitle>
                <CardDescription>
                  Pre-built components with Radix UI and Tailwind CSS. Dark mode included.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
