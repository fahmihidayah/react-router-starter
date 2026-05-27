import { Outlet } from 'react-router'
import { Footer } from '~/components/layouts/footer'
import { Header } from '~/components/layouts/header'
import { auth } from '~/lib/auth'
import type { Route } from './+types/_index'
// import type { Route } from './+types/_index'

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
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
