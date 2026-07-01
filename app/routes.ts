import { prefix, type RouteConfig } from '@react-router/dev/routes'
import { flatRoutes } from '@react-router/fs-routes'

export default [
  // Normal routes (pages, dashboard, auth pages)
  ...(await flatRoutes({
    rootDirectory: './routes',
    ignoredRouteFiles: ['api', 'api/**/*', 'admin', 'admin/**/*', 'admin.tsx'],
  })),

  // API routes (/api/*)
  ...prefix(
    'api',
    await flatRoutes({
      rootDirectory: './routes/api',
    }),
  ),

  // Admin routes (/admin/*) with layout wrapper
  {
    id: 'admin-layout',
    file: './routes/admin.tsx',
    children: [
      ...prefix(
        'admin',
        await flatRoutes({
          rootDirectory: './routes/admin',
        }),
      ),
    ],
  },
] satisfies RouteConfig
