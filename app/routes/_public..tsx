import { Outlet } from 'react-router'
import { Footer } from '~/components/layouts/footer'
import { Header } from '~/components/layouts/header'
import { auth } from '~/lib/auth'
import type { Route } from './+types/_public.'

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  return {
    user: session?.user || null,
  }
}

export default function RootPage({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData
  return (
    <>
      <Header user={user} />
      <p>Test</p>
      <Outlet />
      <Footer />
    </>
  )
}
