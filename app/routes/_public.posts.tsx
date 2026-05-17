import { Outlet } from 'react-router'

export default function PostsLayout() {
  return (
    <div className="mx-auto w-full container px-4 sm:px-6 md:px-10 py-8 md:py-12 lg:py-16">
      <Outlet />
    </div>
  )
}
