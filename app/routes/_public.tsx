import { Outlet } from 'react-router'
import { Footer } from '~/components/layouts/footer'
import { Header } from '~/components/layouts/header'
import { auth } from '~/lib/auth'
// import type { Route } from './+types/_index'

export function meta() {
  return [
    { title: 'Learning Group Tracker' },
    { name: 'description', content: 'Track goals and progress together with your learning group.' },
  ]
}

export async function loader({ request }: { request: Request }) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  return {
    user: session?.user || null,
  }
}

export default function Home({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const data = loaderData
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Navigation */}
      <Header user={data?.user} />

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
