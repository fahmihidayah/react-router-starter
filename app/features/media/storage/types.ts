export type TStorageProvider = 'local' | 's3'

export type TProcessedImage = {
  buffer: Buffer
  filename: string
  originalFilename: string
  contentType: 'image/webp'
  size: number
  width: number | null
  height: number | null
}

export type TStoredImage = Omit<TProcessedImage, 'buffer'> & {
  provider: TStorageProvider
  key: string
  url: string
}

export interface MediaStorage {
  provider: TStorageProvider
  put(image: TProcessedImage): Promise<TStoredImage>
  delete(key: string): Promise<void>
}
