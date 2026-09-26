import { randomUUID } from 'node:crypto'
import type { TMedia } from '~/db/schema'
import type { PaginateDocs } from '~/types/pagination'
import * as mediaQueries from '../queries'
import type { TCreateMedia, TUpdateMedia } from '../schemas/media-schema'
import { convertImageToWebp, getMediaStorage } from '../storage'

async function removeStoredFile(item: TMedia): Promise<void> {
  if (!item.storageKey || !item.storageProvider) return
  await getMediaStorage(item.storageProvider).delete(item.storageKey)
}

export async function create(data: TCreateMedia, file: File): Promise<string> {
  const storage = getMediaStorage()
  const stored = await storage.put(await convertImageToWebp(file))

  try {
    const now = new Date()
    return await mediaQueries.create({
      id: randomUUID(),
      url: stored.url,
      alt: data.alt || null,
      filename: stored.filename,
      originalFilename: stored.originalFilename,
      storageProvider: stored.provider,
      storageKey: stored.key,
      mimeType: stored.contentType,
      size: stored.size,
      width: stored.width,
      height: stored.height,
      createdAt: now,
      updatedAt: now,
    })
  } catch (error) {
    await storage.delete(stored.key).catch(() => undefined)
    throw error
  }
}

export function findPaginated(
  params: mediaQueries.FindPaginatedParams,
): Promise<PaginateDocs<TMedia>> {
  return mediaQueries.findPaginated(params)
}

export function findById(id: string): Promise<TMedia | undefined> {
  return mediaQueries.findById(id)
}

export async function update(id: string, data: TUpdateMedia, file?: File): Promise<void> {
  const current = await mediaQueries.findById(id)
  if (!current) throw new Error('Media not found')

  if (!file || file.size === 0) {
    await mediaQueries.update(id, { alt: data.alt || null })
    return
  }

  const storage = getMediaStorage()
  const stored = await storage.put(await convertImageToWebp(file))

  try {
    await mediaQueries.update(id, {
      url: stored.url,
      alt: data.alt || null,
      filename: stored.filename,
      originalFilename: stored.originalFilename,
      storageProvider: stored.provider,
      storageKey: stored.key,
      mimeType: stored.contentType,
      size: stored.size,
      width: stored.width,
      height: stored.height,
    })
  } catch (error) {
    await storage.delete(stored.key).catch(() => undefined)
    throw error
  }

  await removeStoredFile(current).catch((error: unknown) => {
    console.error('Failed to remove replaced media file', error)
  })
}

export async function deleteById(id: string): Promise<void> {
  const item = await mediaQueries.findById(id)
  if (!item) return
  await mediaQueries.deleteById(id)
  await removeStoredFile(item).catch((error: unknown) => {
    console.error('Failed to remove media file', error)
  })
}

export async function deleteMany(ids: string[]): Promise<void> {
  const items = await mediaQueries.findByIds(ids)
  await mediaQueries.deleteMany(ids)
  await Promise.all(
    items.map((item) =>
      removeStoredFile(item).catch((error: unknown) => {
        console.error('Failed to remove media file', error)
      }),
    ),
  )
}
