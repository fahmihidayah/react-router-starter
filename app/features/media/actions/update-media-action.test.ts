import { afterEach, describe, expect, it, vi } from 'vitest'
import { updateMediaAction } from './update-media-action'

vi.mock('../repositories', () => ({
  mediaRepository: {
    update: vi.fn(),
    findById: vi.fn(),
  },
}))

vi.mock('~/lib/upload', () => ({
  saveUploadedFile: vi.fn(),
}))

vi.mock('react-router', () => ({
  redirect: vi.fn((path: string) => ({ redirect: path })),
}))

import { redirect } from 'react-router'
import { mediaRepository } from '../repositories'
import { saveUploadedFile } from '~/lib/upload'

function buildMediaFormRequest(file?: File, alt?: string): Request {
  const formData = new FormData()
  if (file) {
    formData.append('file', file)
  }
  if (alt) {
    formData.append('alt', alt)
  }
  return new Request('http://localhost/dashboard/media/m1', {
    method: 'POST',
    body: formData,
  })
}

function createMockFile(name: string = 'test.jpg'): File {
  return new File(['content'], name, { type: 'image/jpeg' })
}

describe('updateMediaAction', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('updates media with new file and redirects on success', async () => {
    const mockFile = createMockFile('new-image.jpg')
    const existingMedia = {
      id: 'm1',
      url: '/uploads/old-image.jpg',
      filename: 'old-image.jpg',
      alt: 'Old alt',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(mediaRepository.findById).mockResolvedValue(existingMedia)
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'new-image.jpg',
      path: './uploads/550e8400-e29b-41d4-a716-446655440010.jpg',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440010.jpg',
    })

    vi.mocked(mediaRepository.update).mockResolvedValue({
      id: 'm1',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440010.jpg',
      filename: 'new-image.jpg',
      alt: 'New alt',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildMediaFormRequest(mockFile, 'New alt')
    const result = await updateMediaAction(request, 'm1')

    expect(redirect).toHaveBeenCalledWith('/dashboard/media')
    expect(result).toEqual({ redirect: '/dashboard/media' })
  })

  it('uploads new file when provided', async () => {
    const mockFile = createMockFile('updated.jpg')
    const existingMedia = {
      id: 'm1',
      url: '/uploads/old.jpg',
      filename: 'old.jpg',
      alt: 'Old alt',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(mediaRepository.findById).mockResolvedValue(existingMedia)
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'updated.jpg',
      path: './uploads/550e8400-e29b-41d4-a716-446655440011.jpg',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440011.jpg',
    })

    vi.mocked(mediaRepository.update).mockResolvedValue({
      id: 'm1',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440011.jpg',
      filename: 'updated.jpg',
      alt: 'Old alt',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildMediaFormRequest(mockFile)
    await updateMediaAction(request, 'm1')

    expect(saveUploadedFile).toHaveBeenCalledWith(mockFile)
  })

  it('keeps existing media when no file is provided', async () => {
    const existingMedia = {
      id: 'm1',
      url: '/uploads/existing.jpg',
      filename: 'existing.jpg',
      alt: 'Old alt',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(mediaRepository.findById).mockResolvedValue(existingMedia)
    vi.mocked(mediaRepository.update).mockResolvedValue({
      ...existingMedia,
      alt: 'Updated alt',
    })

    const request = buildMediaFormRequest(undefined, 'Updated alt')
    await updateMediaAction(request, 'm1')

    expect(mediaRepository.findById).toHaveBeenCalledWith('m1')
    expect(saveUploadedFile).not.toHaveBeenCalled()
  })

  it('updates media with new alt text only', async () => {
    const existingMedia = {
      id: 'm1',
      url: '/uploads/existing.jpg',
      filename: 'existing.jpg',
      alt: 'Old description',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(mediaRepository.findById).mockResolvedValue(existingMedia)
    vi.mocked(mediaRepository.update).mockResolvedValue({
      ...existingMedia,
      alt: 'New description',
    })

    const request = buildMediaFormRequest(undefined, 'New description')
    await updateMediaAction(request, 'm1')

    expect(mediaRepository.update).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({
        url: '/uploads/existing.jpg',
        filename: 'existing.jpg',
        alt: 'New description',
      })
    )
  })

  it('replaces URL when new file is uploaded', async () => {
    const mockFile = createMockFile('new.jpg')
    const newUrl = '/uploads/550e8400-e29b-41d4-a716-446655440012.jpg'
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'new.jpg',
      path: './uploads/550e8400-e29b-41d4-a716-446655440012.jpg',
      url: newUrl,
    })

    vi.mocked(mediaRepository.update).mockResolvedValue({
      id: 'm1',
      url: newUrl,
      filename: 'new.jpg',
      alt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildMediaFormRequest(mockFile)
    await updateMediaAction(request, 'm1')

    expect(mediaRepository.update).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({
        url: newUrl,
      })
    )
  })

  it('replaces filename when new file is uploaded', async () => {
    const mockFile = createMockFile('new-filename.jpg')
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'new-filename.jpg',
      path: './uploads/550e8400-e29b-41d4-a716-446655440013.jpg',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440013.jpg',
    })

    vi.mocked(mediaRepository.update).mockResolvedValue({
      id: 'm1',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440013.jpg',
      filename: 'new-filename.jpg',
      alt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildMediaFormRequest(mockFile)
    await updateMediaAction(request, 'm1')

    expect(mediaRepository.update).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({
        filename: 'new-filename.jpg',
      })
    )
  })

  it('returns error when media not found', async () => {
    vi.mocked(mediaRepository.findById).mockResolvedValue(null)

    const request = buildMediaFormRequest(undefined, 'Alt text')
    const result = await updateMediaAction(request, 'nonexistent')

    expect(result).toHaveProperty('errors')
    expect((result as any).errors.url).toContain('Media not found')
  })

  it('returns error when file upload fails', async () => {
    const mockFile = createMockFile('image.jpg')
    const existingMedia = {
      id: 'm1',
      url: '/uploads/old.jpg',
      filename: 'old.jpg',
      alt: 'Old alt',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(mediaRepository.findById).mockResolvedValue(existingMedia)
    vi.mocked(saveUploadedFile).mockRejectedValue(new Error('Upload failed'))

    const request = buildMediaFormRequest(mockFile)
    const result = await updateMediaAction(request, 'm1')

    expect(result).toHaveProperty('errors')
    expect((result as any).errors.url).toContain('Failed to update media. Please try again.')
  })

  it('returns error when database update fails', async () => {
    const mockFile = createMockFile('image.jpg')
    const existingMedia = {
      id: 'm1',
      url: '/uploads/old.jpg',
      filename: 'old.jpg',
      alt: 'Old alt',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(mediaRepository.findById).mockResolvedValue(existingMedia)
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'image.jpg',
      path: './uploads/550e8400-e29b-41d4-a716-446655440014.jpg',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440014.jpg',
    })

    vi.mocked(mediaRepository.update).mockRejectedValue(new Error('DB error'))

    const request = buildMediaFormRequest(mockFile)
    const result = await updateMediaAction(request, 'm1')

    expect(result).toHaveProperty('errors')
    expect((result as any).errors.url).toContain('Failed to update media. Please try again.')
  })

  it('updates alt text without file replacement', async () => {
    const existingMedia = {
      id: 'm1',
      url: '/uploads/old-url.jpg',
      filename: 'old-name.jpg',
      alt: 'Old alt',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(mediaRepository.findById).mockResolvedValue(existingMedia)
    vi.mocked(mediaRepository.update).mockResolvedValue({
      ...existingMedia,
      alt: 'Updated alt only',
    })

    const request = buildMediaFormRequest(undefined, 'Updated alt only')
    await updateMediaAction(request, 'm1')

    expect(mediaRepository.update).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({
        url: '/uploads/old-url.jpg',
        filename: 'old-name.jpg',
        alt: 'Updated alt only',
      })
    )
  })

  it('updates timestamp when media is modified', async () => {
    const mockFile = createMockFile('new.jpg')
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'new.jpg',
      path: './uploads/550e8400-e29b-41d4-a716-446655440015.jpg',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440015.jpg',
    })

    vi.mocked(mediaRepository.update).mockResolvedValue({
      id: 'm1',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440015.jpg',
      filename: 'new.jpg',
      alt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildMediaFormRequest(mockFile)
    await updateMediaAction(request, 'm1')

    expect(mediaRepository.update).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({
        updatedAt: expect.any(Date),
      })
    )
  })

  it('handles empty file (size 0) as no file upload', async () => {
    const existingMedia = {
      id: 'm1',
      url: '/uploads/existing.jpg',
      filename: 'existing.jpg',
      alt: 'Alt text',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' })
    vi.mocked(mediaRepository.findById).mockResolvedValue(existingMedia)
    vi.mocked(mediaRepository.update).mockResolvedValue(existingMedia)

    const request = buildMediaFormRequest(emptyFile, 'New alt')
    await updateMediaAction(request, 'm1')

    expect(mediaRepository.findById).toHaveBeenCalledWith('m1')
    expect(saveUploadedFile).not.toHaveBeenCalled()
  })

  it('preserves existing alt text when updating only file', async () => {
    const existingMedia = {
      id: 'm1',
      url: '/uploads/old.jpg',
      filename: 'old.jpg',
      alt: 'Original alt text',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockFile = createMockFile('new.jpg')
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'new.jpg',
      path: './uploads/550e8400-e29b-41d4-a716-446655440016.jpg',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440016.jpg',
    })

    vi.mocked(mediaRepository.findById).mockResolvedValue(existingMedia)
    vi.mocked(mediaRepository.update).mockResolvedValue({
      ...existingMedia,
      filename: 'new.jpg',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440016.jpg',
    })

    const request = buildMediaFormRequest(mockFile)
    await updateMediaAction(request, 'm1')

    expect(mediaRepository.update).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({
        alt: 'Original alt text',
      })
    )
  })
})
