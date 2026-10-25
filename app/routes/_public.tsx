import { Outlet } from 'react-router'
import { LandingFooter, LandingHeader } from '~/features/page/components/landing'
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
    <div className="flex min-h-screen flex-col bg-white font-sans text-[#17233E]">
      <LandingHeader user={data?.user} />
      <main className="flex-1">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  )
}
