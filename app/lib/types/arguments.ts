import type { RouterContextProvider } from 'react-router'

/**
 * Extended arguments for loaders and actions that include user context
 * This can be used across all features to access the current authenticated user
 */
export interface Arguments {
  request: Request
  context: Readonly<RouterContextProvider>
  params: Record<string, string | undefined>
  unstable_pattern?: string
}

/**
 * Loader function arguments with user context
 */
export interface LoaderArgs extends Arguments {}

/**
 * Action function arguments with user context
 */
export interface ActionArgs extends Arguments {}
