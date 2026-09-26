import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { convertImageToWebp } from './image'

describe('convertImageToWebp', () => {
  it('converts an uploaded image and returns WebP metadata', async () => {
    const png = await sharp({
      create: { width: 8, height: 6, channels: 4, background: '#336699' },
    })
      .png()
      .toBuffer()
    const file = new File([png], 'Example image.png', { type: 'image/png' })

    const result = await convertImageToWebp(file)
    const metadata = await sharp(result.buffer).metadata()

    expect(result.filename).toMatch(/^example-image-.+\.webp$/)
    expect(result.originalFilename).toBe('Example image.png')
    expect(result.contentType).toBe('image/webp')
    expect(result.width).toBe(8)
    expect(result.height).toBe(6)
    expect(metadata.format).toBe('webp')
  })

  it('rejects non-image uploads', async () => {
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' })
    await expect(convertImageToWebp(file)).rejects.toThrow('Only image files')
  })
})
