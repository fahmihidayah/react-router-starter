import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as learnerService from '~/features/learners/services'
import { userContext } from '~/features/users/contexts'
import type { Arguments } from '~/lib/types'
import * as service from '../services'
import {
  learningTemplateCatalogLoader,
  learningTemplateDetailLoader,
} from './learning-template-loaders'

vi.mock('../services', () => ({ findCatalogForUser: vi.fn(), findByIdAccessible: vi.fn() }))
vi.mock('~/features/learners/services', () => ({ findAllContributableForUser: vi.fn() }))

function args(): Arguments {
  return {
    request: new Request('http://localhost/track-app/learning-templates'),
    params: {},
    context: {
      get: vi.fn((context) => (context === userContext ? { user: { id: 'user-1' } } : undefined)),
    } as never,
  }
}

describe('learning template loaders', () => {
  beforeEach(() => vi.resetAllMocks())

  it('loads owned and public templates for the signed-in user', async () => {
    const catalog = { owned: [], publicFromOthers: [] }
    vi.mocked(service.findCatalogForUser).mockResolvedValue(catalog)
    await expect(learningTemplateCatalogLoader(args())).resolves.toEqual(catalog)
    expect(service.findCatalogForUser).toHaveBeenCalledWith('user-1')
  })

  it('loads an accessible detail with owned learners and ownership status', async () => {
    vi.mocked(service.findByIdAccessible).mockResolvedValue({ ownerUserId: 'user-1' } as never)
    vi.mocked(learnerService.findAllContributableForUser).mockResolvedValue([
      { id: 'learner-1' },
    ] as never)
    await expect(learningTemplateDetailLoader(args(), 'template-1')).resolves.toMatchObject({
      isOwner: true,
      learners: [{ id: 'learner-1' }],
    })
  })

  it('returns 404 for an inaccessible template', async () => {
    vi.mocked(service.findByIdAccessible).mockResolvedValue(undefined)
    vi.mocked(learnerService.findAllContributableForUser).mockResolvedValue([])
    await expect(learningTemplateDetailLoader(args(), 'private-template')).rejects.toMatchObject({
      status: 404,
    })
  })
})
