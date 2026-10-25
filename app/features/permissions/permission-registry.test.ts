import { describe, expect, it } from 'vitest'
import { PERMISSION_REGISTRY, USER_PERMISSION_KEYS } from './permission-registry'

describe('permission registry', () => {
  it('contains unique permission keys and resource-action pairs', () => {
    const keys = PERMISSION_REGISTRY.map(({ key }) => key)
    const resourceActions = PERMISSION_REGISTRY.map(({ resource, action }) =>
      [resource, action].join(':'),
    )

    expect(new Set(keys).size).toBe(keys.length)
    expect(new Set(resourceActions).size).toBe(resourceActions.length)
  })

  it('keeps each key aligned with its resource and action', () => {
    for (const permission of PERMISSION_REGISTRY) {
      expect(permission.key).toBe(`${permission.resource}.${permission.action}`)
    }
  })

  it('only grants registered permissions to the standard user role', () => {
    const registeredKeys = new Set(PERMISSION_REGISTRY.map(({ key }) => key))

    expect(USER_PERMISSION_KEYS.every((key) => registeredKeys.has(key))).toBe(true)
  })
})
