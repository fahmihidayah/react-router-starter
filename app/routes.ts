import { prefix, type RouteConfig } from '@react-router/dev/routes'
import { flatRoutes } from '@react-router/fs-routes'
export default [
  // public pages with locale support
  ...prefix(
    ':locale?',
    await flatRoutes({
      rootDirectory: './routes',
      ignoredRouteFiles: [
        'api',
        'api/**/*',
        'admin',
        'admin/**/*',
        'admin.tsx',
        // The public admin sign-in lives outside the admin layout. Patterns are
        // matched against the path relative to `app/`, hence the `routes/` prefix.
        // 'routes/admin-login.tsx',
        'track-app',
        'track-app/**/*',
        'track-app.tsx',
      ],
    }),
  ),

  // api no locale
  ...prefix(
    'api',
    await flatRoutes({
      rootDirectory: './routes/api',
      ignoredRouteFiles: ['**/*.test.ts', '**/*.test.tsx'],
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

  // authenticated user app, no locale
  {
    id: 'track-app-layout',
    file: './routes/track-app.tsx',
    children: [
      ...prefix(
        'track-app',
        await flatRoutes({
          rootDirectory: './routes/track-app',
        }),
      ),
    ],
  },
] satisfies RouteConfig
