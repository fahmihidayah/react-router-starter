import { assertStorageProvider, mediaStorageConfig } from './config'
import { localMediaStorage } from './local-storage'
import { s3MediaStorage } from './s3-storage'
import type { MediaStorage, TStorageProvider } from './types'

const storages: Record<TStorageProvider, MediaStorage> = {
  local: localMediaStorage,
  s3: s3MediaStorage,
}

export function getMediaStorage(provider = mediaStorageConfig.driver): MediaStorage {
  assertStorageProvider(provider)
  return storages[provider]
}

export { convertImageToWebp } from './image'
export { getLocalMediaPath } from './local-storage'
export type { TStorageProvider, TStoredImage } from './types'
