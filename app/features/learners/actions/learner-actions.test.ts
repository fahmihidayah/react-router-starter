import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as mediaService from '~/features/media/services'
import { userContext } from '~/features/users/contexts'
import type { ActionArgs } from '~/lib/types'
import * as learnerService from '../services'
import { deleteLearnerAction, updateLearnerAction } from './learner-actions'

vi.mock('~/features/media/services', () => ({
  create: vi.fn(),
  findById: vi.fn(),
  deleteById: vi.fn(),
}))

vi.mock('../services', () => ({
  deleteForUser: vi.fn(),
  findByIdOwned: vi.fn(),
  updateForUser: vi.fn(),
}))

function args(file?: File): ActionArgs {
  const formData = new FormData()
  formData.set('name', 'Alya')
  formData.set('dateOfBirth', '2014-04-03')
  if (file) formData.set('avatar', file)

  return {
    request: new Request('http://localhost/track-app/learners/learner-1', {
      method: 'POST',
      body: formData,
    }),
    params: { id: 'learner-1' },
    context: {
      get: vi.fn((context) => (context === userContext ? { user: { id: 'user-1' } } : undefined)),
    } as never,
  }
}

const learner = {
  id: 'learner-1',
  name: 'Alya',
  avatar: '/api/media/files/old.webp',
}

function deleteArgs(confirmation: string): ActionArgs {
  const formData = new FormData()
  formData.set('intent', 'delete')
  formData.set('confirmation', confirmation)

  return {
    request: new Request('http://localhost/track-app/learners/learner-1', {
      method: 'POST',
      body: formData,
    }),
    params: { id: 'learner-1' },
    context: {
      get: vi.fn((context) => (context === userContext ? { user: { id: 'user-1' } } : undefined)),
    } as never,
  }
}

describe('updateLearnerAction avatar uploads', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(learnerService.findByIdOwned).mockResolvedValue(learner as never)
    vi.mocked(learnerService.updateForUser).mockResolvedValue(learner as never)
  })

  it('keeps the current avatar when no image is selected', async () => {
    await updateLearnerAction(args(), 'learner-1')

    expect(mediaService.create).not.toHaveBeenCalled()
    expect(learnerService.updateForUser).toHaveBeenCalledWith(
      'learner-1',
      'user-1',
      expect.objectContaining({ avatar: '/api/media/files/old.webp' }),
    )
  })

  it('uploads through the media service and saves its URL on the learner', async () => {
    const file = new File(['image'], 'alya.png', { type: 'image/png' })
    vi.mocked(mediaService.create).mockResolvedValue('media-1')
    vi.mocked(mediaService.findById).mockResolvedValue({
      id: 'media-1',
      url: '/api/media/files/alya.webp',
    } as never)

    const result = await updateLearnerAction(args(file), 'learner-1')

    expect(mediaService.create).toHaveBeenCalledWith({ alt: 'Alya profile image' }, file)
    expect(learnerService.updateForUser).toHaveBeenCalledWith(
      'learner-1',
      'user-1',
      expect.objectContaining({ avatar: '/api/media/files/alya.webp' }),
    )
    expect((result as Response).headers.get('location')).toBe(
      '/track-app/learners/learner-1?tab=settings',
    )
  })

  it('returns a field error when media validation rejects the image', async () => {
    vi.mocked(mediaService.create).mockRejectedValue(new Error('Only image files can be uploaded'))

    const result = await updateLearnerAction(
      args(new File(['text'], 'notes.txt', { type: 'text/plain' })),
      'learner-1',
    )

    expect(result).toEqual({
      success: false,
      errors: { avatar: ['Only image files can be uploaded'] },
    })
    expect(learnerService.updateForUser).not.toHaveBeenCalled()
  })
})

describe('deleteLearnerAction confirmation', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(learnerService.findByIdOwned).mockResolvedValue(learner as never)
    vi.mocked(learnerService.deleteForUser).mockResolvedValue(true)
  })

  it('deletes when the learner name matches', async () => {
    const response = await deleteLearnerAction(deleteArgs('Alya'), 'learner-1')

    expect(learnerService.deleteForUser).toHaveBeenCalledWith('learner-1', 'user-1')
    expect(response.headers.get('location')).toBe('/track-app/learners')
  })

  it('rejects a mismatched learner name', async () => {
    await expect(
      deleteLearnerAction(deleteArgs('Someone else'), 'learner-1'),
    ).rejects.toMatchObject({ status: 400 })
    expect(learnerService.deleteForUser).not.toHaveBeenCalled()
  })
})
