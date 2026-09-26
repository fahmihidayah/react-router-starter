import { randomUUID } from 'node:crypto'
import { basename, extname } from 'node:path'
import sharp from 'sharp'
import type { TProcessedImage } from './types'

const MAX_IMAGE_BYTES = Number(process.env.MEDIA_MAX_FILE_SIZE || 10 * 1024 * 1024)
const WEBP_QUALITY = Number(process.env.MEDIA_WEBP_QUALITY || 82)

function safeStem(filename: string): string {
  const stem = basename(filename, extname(filename))
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  return stem.slice(0, 80) || 'image'
}

export async function convertImageToWebp(file: File): Promise<TProcessedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded')
  }

  if (file.size === 0) throw new Error('The selected image is empty')
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`Image must be smaller than ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB`)
  }

  const input = Buffer.from(await file.arrayBuffer())
  const output = await sharp(input, { limitInputPixels: 40_000_000 })
    .rotate()
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer({ resolveWithObject: true })

  return {
    buffer: output.data,
    filename: `${safeStem(file.name)}-${randomUUID()}.webp`,
    originalFilename: basename(file.name),
    contentType: 'image/webp',
    size: output.data.byteLength,
    width: output.info.width ?? null,
    height: output.info.height ?? null,
  }
}
