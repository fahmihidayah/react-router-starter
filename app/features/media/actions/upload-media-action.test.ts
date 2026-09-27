import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as mediaService from '../services'
import { uploadMediaAction } from './upload-media-action'

vi.mock('../services', () => ({ create: vi.fn(), findById: vi.fn() }))
beforeEach(() => vi.resetAllMocks())

function request(file = true) {
  const data = new FormData()
  data.set('alt', 'An uploaded photo')
  if (file) data.set('file', new File(['image'], 'photo.png', { type: 'image/png' }))
  return new Request('http://localhost/admin/media/upload', { method: 'POST', body: data })
}

describe('editor media upload', () => {
  it('returns the URL saved by the existing media service', async () => {
    vi.mocked(mediaService.create).mockResolvedValue('media-1')
    vi.mocked(mediaService.findById).mockResolvedValue({
      id: 'media-1',
      url: '/api/media/files/photo.webp',
      alt: 'An uploaded photo',
    } as Awaited<ReturnType<typeof mediaService.findById>>)
    const response = await uploadMediaAction(request())
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({
      url: '/api/media/files/photo.webp',
      alt: 'An uploaded photo',
    })
    expect(mediaService.create).toHaveBeenCalledWith({ alt: 'An uploaded photo' }, expect.any(File))
  })

  it('rejects missing files before calling storage', async () => {
    expect((await uploadMediaAction(request(false))).status).toBe(400)
    expect(mediaService.create).not.toHaveBeenCalled()
  })

  it('returns media validation errors for display in the editor', async () => {
    vi.mocked(mediaService.create).mockRejectedValue(new Error('Unsupported image format'))
    const response = await uploadMediaAction(request())
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ errors: { form: ['Unsupported image format'] } })
  })
})
