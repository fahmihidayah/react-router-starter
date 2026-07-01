import { prefix, type RouteConfig } from '@react-router/dev/routes'
import { flatRoutes } from '@react-router/fs-routes'
export default [
  // public pages with locale support
  ...prefix(
    ':locale?',
    await flatRoutes({
      rootDirectory: './routes',
      ignoredRouteFiles: ['api', 'api/**/*', 'admin', 'admin/**/*', 'admin.tsx'],
    }),
  ),

  // api no locale
  ...prefix(
    'api',
    await flatRoutes({
      rootDirectory: './routes/api',
    }),
  ),

  // admin no locale
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
