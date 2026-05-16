import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMediaAction } from './create-media-action'

vi.mock('../repositories', () => ({
  mediaRepository: {
    create: vi.fn(),
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

function buildMediaFormRequest(file: File, alt?: string): Request {
  const formData = new FormData()
  formData.append('file', file)
  if (alt) {
    formData.append('alt', alt)
  }
  return new Request('http://localhost/dashboard/media', {
    method: 'POST',
    body: formData,
  })
}

function createMockFile(name: string = 'test.jpg', size: number = 1024): File {
  return new File(['content'], name, { type: 'image/jpeg' })
}

describe('createMediaAction', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('creates media with file and redirects on success', async () => {
    const mockFile = createMockFile('image.jpg')
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'image.jpg',
      path: './uploads/550e8400-e29b-41d4-a716-446655440000.jpg',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440000.jpg',
    })

    vi.mocked(mediaRepository.create).mockResolvedValue({
      id: 'm1',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440000.jpg',
      filename: 'image.jpg',
      alt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildMediaFormRequest(mockFile)
    const result = await createMediaAction(request)

    expect(redirect).toHaveBeenCalledWith('/dashboard/media')
    expect(result).toEqual({ redirect: '/dashboard/media' })
  })

  it('calls saveUploadedFile with the uploaded file', async () => {
    const mockFile = createMockFile('document.pdf')
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'document.pdf',
      path: './uploads/550e8400-e29b-41d4-a716-446655440001.pdf',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440001.pdf',
    })

    vi.mocked(mediaRepository.create).mockResolvedValue({
      id: 'm2',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440001.pdf',
      filename: 'document.pdf',
      alt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildMediaFormRequest(mockFile)
    await createMediaAction(request)

    expect(saveUploadedFile).toHaveBeenCalledWith(mockFile)
  })

  it('creates media record with correct data', async () => {
    const mockFile = createMockFile('photo.png')
    const altText = 'A beautiful photo'
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'photo.png',
      path: './uploads/550e8400-e29b-41d4-a716-446655440002.png',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440002.png',
    })

    vi.mocked(mediaRepository.create).mockResolvedValue({
      id: 'm3',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440002.png',
      filename: 'photo.png',
      alt: altText,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildMediaFormRequest(mockFile, altText)
    await createMediaAction(request)

    expect(mediaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/uploads/550e8400-e29b-41d4-a716-446655440002.png',
        filename: 'photo.png',
        alt: altText,
      })
    )
  })

  it('generates correct URL from saveUploadedFile result', async () => {
    const mockFile = createMockFile('image.gif')
    const expectedUrl = '/uploads/550e8400-e29b-41d4-a716-446655440003.gif'
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'image.gif',
      path: './uploads/550e8400-e29b-41d4-a716-446655440003.gif',
      url: expectedUrl,
    })

    vi.mocked(mediaRepository.create).mockResolvedValue({
      id: 'm4',
      url: expectedUrl,
      filename: 'image.gif',
      alt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildMediaFormRequest(mockFile)
    await createMediaAction(request)

    expect(mediaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expectedUrl,
      })
    )
  })

  it('extracts filename from file.name', async () => {
    const mockFile = createMockFile('my-image-file.jpg')
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'my-image-file.jpg',
      path: './uploads/550e8400-e29b-41d4-a716-446655440004.jpg',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440004.jpg',
    })

    vi.mocked(mediaRepository.create).mockResolvedValue({
      id: 'm5',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440004.jpg',
      filename: 'my-image-file.jpg',
      alt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildMediaFormRequest(mockFile)
    await createMediaAction(request)

    expect(mediaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'my-image-file.jpg',
      })
    )
  })

  it('handles optional alt text', async () => {
    const mockFile = createMockFile('image.jpg')
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'image.jpg',
      path: './uploads/550e8400-e29b-41d4-a716-446655440005.jpg',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440005.jpg',
    })

    vi.mocked(mediaRepository.create).mockResolvedValue({
      id: 'm6',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440005.jpg',
      filename: 'image.jpg',
      alt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildMediaFormRequest(mockFile)
    await createMediaAction(request)

    expect(mediaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        alt: null,
      })
    )
  })

  it('returns error when no file is provided', async () => {
    const formData = new FormData()
    formData.append('alt', 'Some alt text')
    const request = new Request('http://localhost/dashboard/media', {
      method: 'POST',
      body: formData,
    })

    const result = await createMediaAction(request)

    expect(result).toHaveProperty('errors')
    expect((result as any).errors.url).toContain('File is required')
  })

  it('returns error when file size is 0', async () => {
    const mockFile = new File([], 'empty.jpg', { type: 'image/jpeg' })
    const request = buildMediaFormRequest(mockFile)

    const result = await createMediaAction(request)

    expect(result).toHaveProperty('errors')
    expect((result as any).errors.url).toContain('File is required')
  })

  it('returns error when file upload fails', async () => {
    const mockFile = createMockFile('image.jpg')
    vi.mocked(saveUploadedFile).mockRejectedValue(new Error('Upload failed'))

    const request = buildMediaFormRequest(mockFile)
    const result = await createMediaAction(request)

    expect(result).toHaveProperty('errors')
    expect((result as any).errors.url).toContain('Failed to upload file. Please try again.')
  })

  it('returns error when database creation fails', async () => {
    const mockFile = createMockFile('image.jpg')
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'image.jpg',
      path: './uploads/550e8400-e29b-41d4-a716-446655440006.jpg',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440006.jpg',
    })

    vi.mocked(mediaRepository.create).mockRejectedValue(new Error('DB error'))

    const request = buildMediaFormRequest(mockFile)
    const result = await createMediaAction(request)

    expect(result).toHaveProperty('errors')
    expect((result as any).errors.url).toContain('Failed to upload file. Please try again.')
  })

  it('creates media with alt text', async () => {
    const mockFile = createMockFile('image.jpg')
    const altText = 'Beautiful sunset at the beach'
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'image.jpg',
      path: './uploads/550e8400-e29b-41d4-a716-446655440007.jpg',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440007.jpg',
    })

    vi.mocked(mediaRepository.create).mockResolvedValue({
      id: 'm7',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440007.jpg',
      filename: 'image.jpg',
      alt: altText,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildMediaFormRequest(mockFile, altText)
    await createMediaAction(request)

    expect(mediaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        alt: altText,
      })
    )
  })

  it('generates unique IDs for media records', async () => {
    const mockFile = createMockFile('image.jpg')
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'image.jpg',
      path: './uploads/550e8400-e29b-41d4-a716-446655440008.jpg',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440008.jpg',
    })

    vi.mocked(mediaRepository.create).mockResolvedValue({
      id: 'm8',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440008.jpg',
      filename: 'image.jpg',
      alt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildMediaFormRequest(mockFile)
    await createMediaAction(request)

    expect(mediaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
      })
    )
  })

  it('includes timestamps in created media', async () => {
    const mockFile = createMockFile('image.jpg')
    const beforeTime = new Date()
    vi.mocked(saveUploadedFile).mockResolvedValue({
      filename: 'image.jpg',
      path: './uploads/550e8400-e29b-41d4-a716-446655440009.jpg',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440009.jpg',
    })

    vi.mocked(mediaRepository.create).mockResolvedValue({
      id: 'm9',
      url: '/uploads/550e8400-e29b-41d4-a716-446655440009.jpg',
      filename: 'image.jpg',
      alt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = buildMediaFormRequest(mockFile)
    await createMediaAction(request)

    expect(mediaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    )
  })
})
