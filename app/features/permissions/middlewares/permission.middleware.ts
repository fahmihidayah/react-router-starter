import { userContext } from '~/features/users/contexts'
import { requireAuth } from '~/features/users/middlewares/auth.middleware'
import type { Arguments } from '~/lib/types'
import type { PermissionKey } from '../permission-registry'
import * as permissionService from '../services'

type PermissionRequirement =
  | PermissionKey
  | { allOf: readonly PermissionKey[] }
  | { anyOf: readonly PermissionKey[] }

type RoutePermissionPolicy = {
  action?: PermissionRequirement
  intents?: Readonly<Record<string, PermissionRequirement>>
  loader?: PermissionRequirement
}

function forbidden(): never {
  throw new Response('Forbidden - Insufficient permissions', { status: 403 })
}

async function authenticatedUserId(args: Arguments): Promise<string> {
  let authSession = args.context.get(userContext)
  if (!authSession?.user) {
    await requireAuth(args)
    authSession = args.context.get(userContext)
  }

  if (!authSession?.user?.role) forbidden()
  return authSession.user.id
}

export async function requirePermission(args: Arguments, key: PermissionKey): Promise<void> {
  const userId = await authenticatedUserId(args)
  const hasPermission = await permissionService.hasPermission(userId, key)

  console.log('[Permission Debug] Permission check:', {
    userId,
    requiredPermission: key,
    hasPermission,
    url: args.request.url,
    method: args.request.method,
  })

  if (!hasPermission) {
    const userPermissions = await permissionService.findKeysForUser(userId)
    console.log('[Permission Debug] User permissions:', Array.from(userPermissions))
    forbidden()
  }
}

export async function requireAnyPermission(
  args: Arguments,
  keys: readonly PermissionKey[],
): Promise<void> {
  const userId = await authenticatedUserId(args)
  if (!(await permissionService.hasAnyPermission(userId, keys))) forbidden()
}

async function requireAllPermissions(
  args: Arguments,
  keys: readonly PermissionKey[],
): Promise<void> {
  const userId = await authenticatedUserId(args)
  if (!(await permissionService.hasAllPermissions(userId, keys))) forbidden()
}

async function enforceRequirement(
  args: Arguments,
  requirement: PermissionRequirement,
): Promise<void> {
  if (typeof requirement === 'string') return requirePermission(args, requirement)
  if ('anyOf' in requirement) return requireAnyPermission(args, requirement.anyOf)
  return requireAllPermissions(args, requirement.allOf)
}

/** Enforces read and intent-specific mutation permissions before a route loader/action executes. */
export function enforceRoutePermissions(policy: RoutePermissionPolicy) {
  return async (args: Arguments, next: () => Promise<unknown>): Promise<void> => {
    const method = args.request.method.toUpperCase()
    let requirement = method === 'GET' || method === 'HEAD' ? policy.loader : policy.action

    if (method !== 'GET' && method !== 'HEAD' && policy.intents) {
      const formData = await args.request.clone().formData()
      const intent = formData.get('intent')
      if (typeof intent === 'string') requirement = policy.intents[intent] ?? requirement
    }

    if (!requirement) forbidden()
    await enforceRequirement(args, requirement)
    await next()
  }
}
