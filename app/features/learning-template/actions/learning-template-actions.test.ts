import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userContext } from '~/features/users/contexts'
import type { ActionArgs } from '~/lib/types'
import * as service from '../services'
import {
  applyLearningTemplateAction,
  createLearningTemplateAction,
} from './learning-template-actions'

vi.mock('../services', () => ({ createForUser: vi.fn(), applyForUser: vi.fn() }))

function args(data: Record<string, string>): ActionArgs {
  const formData = new FormData()
  for (const [key, value] of Object.entries(data)) formData.set(key, value)
  return {
    request: new Request('http://localhost/track-app/learning-templates', {
      method: 'POST',
      body: formData,
    }),
    params: {},
    context: {
      get: vi.fn((context) => (context === userContext ? { user: { id: 'user-1' } } : undefined)),
    } as never,
  }
}

describe('learning template actions', () => {
  beforeEach(() => vi.resetAllMocks())

  it('validates template creation', async () => {
    const result = await createLearningTemplateAction(args({ title: '', visibility: 'private' }))
    expect(result).toMatchObject({ success: false, operation: 'create' })
    expect(service.createForUser).not.toHaveBeenCalled()
  })

  it('creates a template and redirects to its goal editor', async () => {
    vi.mocked(service.createForUser).mockResolvedValue({ id: 'template-1' } as never)
    const result = await createLearningTemplateAction(
      args({ title: 'Reading', visibility: 'public' }),
    )
    expect(service.createForUser).toHaveBeenCalledWith(
      { title: 'Reading', visibility: 'public' },
      'user-1',
    )
    expect(result).toBeInstanceOf(Response)
    expect((result as Response).headers.get('location')).toBe(
      '/track-app/learning-templates/template-1',
    )
  })

  it('returns duplicate confirmation instead of creating goals twice silently', async () => {
    vi.mocked(service.applyForUser).mockResolvedValue({ status: 'duplicate' })
    const result = await applyLearningTemplateAction(
      args({
        learnerId: '00000000-0000-4000-8000-000000000001',
        startDate: '2026-10-10',
      }),
      'template-1',
    )
    expect(result).toMatchObject({ success: false, operation: 'apply', duplicate: true })
  })
})
