import { resolve } from 'node:path'
import type { TStorageProvider } from './types'

export const mediaStorageConfig = {
  driver: (process.env.MEDIA_STORAGE_DRIVER || 'local') as TStorageProvider,
  local: {
    directory: resolve(process.env.MEDIA_UPLOAD_DIR || './uploads/media'),
    baseUrl: process.env.MEDIA_LOCAL_BASE_URL || '/api/media/files',
  },
  s3: {
    bucket: process.env.S3_BUCKET || '',
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT,
    publicUrl: process.env.S3_PUBLIC_URL,
    prefix: (process.env.S3_MEDIA_PREFIX || 'media').replace(/^\/+|\/+$/g, ''),
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  },
} as const

export function assertStorageProvider(value: string): asserts value is TStorageProvider {
  if (value !== 'local' && value !== 's3') {
    throw new Error(`Unsupported MEDIA_STORAGE_DRIVER: ${value}`)
  }
}
