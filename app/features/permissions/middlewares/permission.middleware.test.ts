import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userContext } from '~/features/users/contexts'
import type { Arguments } from '~/lib/types'
import { PERMISSION_KEYS } from '../permission-registry'
import * as permissionService from '../services'
import {
  enforceRoutePermissions,
  requireAnyPermission,
  requirePermission,
} from './permission.middleware'

vi.mock('../services', () => ({
  hasAllPermissions: vi.fn(),
  hasAnyPermission: vi.fn(),
  hasPermission: vi.fn(),
}))
vi.mock('~/features/users/middlewares/auth.middleware', () => ({ requireAuth: vi.fn() }))

const role = {
  id: 'role-1',
  key: 'editor',
  name: 'Editor',
  description: null,
  isSystem: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

function argsWithRole(assignedRole: typeof role | null): Arguments {
  const context = new Map()
  context.set(userContext, {
    user: {
      id: 'user-1',
      name: 'Ayu',
      email: 'ayu@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: assignedRole,
    },
  })
  return {
    context,
    params: {},
    request: new Request('https://app.example.com/admin/posts'),
  }
}

async function expectForbidden(promise: Promise<void>) {
  try {
    await promise
    throw new Error('Expected permission check to reject')
  } catch (error) {
    expect(error).toBeInstanceOf(Response)
    expect((error as Response).status).toBe(403)
  }
}

describe('permission middleware', () => {
  beforeEach(() => vi.resetAllMocks())

  it('rejects a user without an assigned role', async () => {
    await expectForbidden(requirePermission(argsWithRole(null), PERMISSION_KEYS.POSTS_READ))
    expect(permissionService.hasPermission).not.toHaveBeenCalled()
  })

  it('rejects a role that does not have the required permission', async () => {
    vi.mocked(permissionService.hasPermission).mockResolvedValue(false)
    await expectForbidden(requirePermission(argsWithRole(role), PERMISSION_KEYS.POSTS_UPDATE))
  })

  it('allows a role with the required permission', async () => {
    vi.mocked(permissionService.hasPermission).mockResolvedValue(true)
    await expect(
      requirePermission(argsWithRole(role), PERMISSION_KEYS.POSTS_READ),
    ).resolves.toBeUndefined()
  })

  it('allows any one of the accepted permissions', async () => {
    vi.mocked(permissionService.hasAnyPermission).mockResolvedValue(true)
    await expect(
      requireAnyPermission(argsWithRole(role), [
        PERMISSION_KEYS.POSTS_UPDATE,
        PERMISSION_KEYS.POSTS_DELETE,
      ]),
    ).resolves.toBeUndefined()
  })

  it('enforces the permission mapped to a mutation intent before continuing', async () => {
    vi.mocked(permissionService.hasPermission).mockResolvedValue(true)
    const args = argsWithRole(role)
    const formData = new FormData()
    formData.set('intent', 'delete')
    args.request = new Request('https://app.example.com/admin/posts', {
      body: formData,
      method: 'POST',
    })
    const next = vi.fn(async () => undefined)

    await enforceRoutePermissions({
      action: PERMISSION_KEYS.POSTS_UPDATE,
      intents: { delete: PERMISSION_KEYS.POSTS_DELETE },
    })(args, next)

    expect(permissionService.hasPermission).toHaveBeenCalledWith(
      'user-1',
      PERMISSION_KEYS.POSTS_DELETE,
    )
    expect(next).toHaveBeenCalledOnce()
  })
})
