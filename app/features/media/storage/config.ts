import { resolve } from 'node:path'
import { env } from '~/env'
import type { TStorageProvider } from './types'

export const mediaStorageConfig = {
  driver: env.MEDIA_STORAGE_DRIVER as TStorageProvider,
  local: {
    directory: resolve(env.MEDIA_UPLOAD_DIR),
    baseUrl: env.MEDIA_LOCAL_BASE_URL,
  },
  s3: {
    bucket: env.S3_BUCKET || '',
    region: env.AWS_REGION,
    endpoint: env.S3_ENDPOINT,
    publicUrl: env.S3_PUBLIC_URL,
    prefix: env.S3_MEDIA_PREFIX.replace(/^\/+|\/+$/g, ''),
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
  },
} as const

export function assertStorageProvider(value: string): asserts value is TStorageProvider {
  if (value !== 'local' && value !== 's3') {
    throw new Error(`Unsupported MEDIA_STORAGE_DRIVER: ${value}`)
  }
}
