import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TPermission } from '~/db/schema'
import { PERMISSION_KEYS } from '../permission-registry'
import * as permissionQueries from '../queries'
import * as permissionService from './permission.service'

vi.mock('../queries', () => ({
  findAll: vi.fn(),
  findByKey: vi.fn(),
  findForUser: vi.fn(),
  upsertMany: vi.fn(),
}))

const now = new Date('2026-10-12T00:00:00.000Z')
const postReadPermission: TPermission = {
  id: 'permission-1',
  key: PERMISSION_KEYS.POSTS_READ,
  resource: 'posts',
  action: 'read',
  name: 'Read posts',
  description: 'Allows the role to read posts',
  createdAt: now,
  updatedAt: now,
}

describe('permission service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(permissionQueries.findForUser).mockResolvedValue([postReadPermission])
  })

  it('returns a typed set of permission keys for a user', async () => {
    await expect(permissionService.findKeysForUser('user-1')).resolves.toEqual(
      new Set([PERMISSION_KEYS.POSTS_READ]),
    )
    expect(permissionQueries.findForUser).toHaveBeenCalledWith('user-1')
  })

  it('checks one permission', async () => {
    await expect(
      permissionService.hasPermission('user-1', PERMISSION_KEYS.POSTS_READ),
    ).resolves.toBe(true)
    await expect(
      permissionService.hasPermission('user-1', PERMISSION_KEYS.POSTS_DELETE),
    ).resolves.toBe(false)
  })

  it('checks whether any requested permission is assigned', async () => {
    await expect(
      permissionService.hasAnyPermission('user-1', [
        PERMISSION_KEYS.POSTS_DELETE,
        PERMISSION_KEYS.POSTS_READ,
      ]),
    ).resolves.toBe(true)
    await expect(permissionService.hasAnyPermission('user-1', [])).resolves.toBe(false)
  })

  it('checks whether every requested permission is assigned', async () => {
    await expect(
      permissionService.hasAllPermissions('user-1', [PERMISSION_KEYS.POSTS_READ]),
    ).resolves.toBe(true)
    await expect(
      permissionService.hasAllPermissions('user-1', [
        PERMISSION_KEYS.POSTS_READ,
        PERMISSION_KEYS.POSTS_UPDATE,
      ]),
    ).resolves.toBe(false)
    await expect(permissionService.hasAllPermissions('user-1', [])).resolves.toBe(true)
  })

  it('synchronizes registry definitions through the query boundary', async () => {
    vi.mocked(permissionQueries.upsertMany).mockImplementation(
      async (permissions) => permissions as TPermission[],
    )

    const result = await permissionService.syncRegistry([
      {
        key: PERMISSION_KEYS.POSTS_READ,
        resource: 'posts',
        action: 'read',
        name: 'Read posts',
        description: 'Allows the role to read posts',
      },
    ])

    expect(result).toHaveLength(1)
    expect(permissionQueries.upsertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        id: expect.any(String),
        key: PERMISSION_KEYS.POSTS_READ,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    ])
  })
})
