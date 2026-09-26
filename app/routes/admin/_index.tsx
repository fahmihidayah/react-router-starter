import { Calendar, LogIn, Mail, User2 } from 'lucide-react'
import { useRouteLoaderData } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import type { loader as adminLoader } from '../admin'

export function meta() {
  return [
    { title: 'Dashboard - Starter App' },
    { name: 'description', content: 'Your personal dashboard' },
  ]
}

export default function DashboardIndex() {
  // Get user data from parent admin layout loader
  const parentData = useRouteLoaderData<typeof adminLoader>('admin-layout')
  const user = parentData?.user

  if (!user) {
    return null
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <User2 />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.emailVerified ? 'Verified' : 'Unverified'}
              </div>
              <p className="text-xs text-muted-foreground">
                {user.emailVerified ? 'Your email is verified' : 'Please verify your email'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email</CardTitle>
              <Mail />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{user.email}</div>
              <p className="text-xs text-muted-foreground">Your account email</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Calendar />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">Account creation date</p>
            </CardContent>
          </Card>
        </div>

        {/* User Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your account information and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-sm font-mono mt-1">{user.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-sm mt-1">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                <p className="text-sm mt-1">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Verification</p>
                <p className="text-sm mt-1">
                  {user.emailVerified ? (
                    <span className="text-primary dark:text-primary">✓ Verified</span>
                  ) : (
                    <span className="text-chart-4">⚠ Not verified</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Card - Example of easy modification */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest account activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <LogIn />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Signed in</p>
                    <p className="text-xs text-muted-foreground">Successfully logged in</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Just now</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
