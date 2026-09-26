import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { mediaStorageConfig } from './config'
import type { MediaStorage } from './types'

export const localMediaStorage: MediaStorage = {
  provider: 'local',
  async put(image) {
    await mkdir(mediaStorageConfig.local.directory, { recursive: true })
    const key = image.filename
    await writeFile(join(mediaStorageConfig.local.directory, key), image.buffer, { flag: 'wx' })

    return {
      filename: image.filename,
      originalFilename: image.originalFilename,
      contentType: image.contentType,
      size: image.size,
      width: image.width,
      height: image.height,
      provider: 'local',
      key,
      url: `${mediaStorageConfig.local.baseUrl}/${encodeURIComponent(key)}`,
    }
  },
  async delete(key) {
    const safeKey = basename(key)
    if (safeKey !== key) throw new Error('Invalid local media key')
    await unlink(join(mediaStorageConfig.local.directory, safeKey)).catch((error: unknown) => {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return
      throw error
    })
  },
}

export function getLocalMediaPath(key: string): string {
  const safeKey = basename(key)
  if (safeKey !== key || !safeKey.endsWith('.webp')) throw new Error('Invalid local media key')
  return join(mediaStorageConfig.local.directory, safeKey)
}
