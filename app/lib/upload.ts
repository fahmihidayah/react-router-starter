import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { convertImageToWebp, getMediaStorage } from '~/features/media/storage'
import { mediaStorageConfig } from '~/features/media/storage/config'

/** @deprecated Prefer the media service for uploads that also create a database record. */
export async function saveUploadedFile(file: File) {
  const stored = await getMediaStorage().put(await convertImageToWebp(file))
  return {
    filename: stored.filename,
    path: stored.provider === 'local' ? join(mediaStorageConfig.local.directory, stored.key) : '',
    url: stored.url,
  }
}

export async function ensureUploadDir(): Promise<void> {
  await mkdir(mediaStorageConfig.local.directory, { recursive: true })
}

export function getUploadDir(): string {
  return mediaStorageConfig.local.directory
}
