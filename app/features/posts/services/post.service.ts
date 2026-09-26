import { randomUUID } from 'node:crypto'
import type { TPost } from '~/features/posts/schemas/db/posts'
import type { PaginateDocs } from '~/types/pagination'
import { createSlugFrom } from '~/utils/slug'
import * as postQueries from '../queries'
import type { TCreatePost, TUpdatePost } from '../schemas/form/post-schema'
import {
  PostCreationFailedError,
  PostNotFoundError,
  SlugAlreadyExistsError,
} from '../types/errors/post-errors'

export async function create(data: TCreatePost): Promise<string> {
  const { title, content, categoryId } = data
  const slug = createSlugFrom(title)

  // Check if slug already exists
  const exists = await postQueries.slugExists(slug)
  if (exists) {
    throw new SlugAlreadyExistsError()
  }

  try {
    const now = new Date()
    const postId = randomUUID()

    await postQueries.create({
      id: postId,
      slug,
      title,
      content,
      categoryId,
      createdAt: now,
      updatedAt: now,
    })

    return postId
  } catch (error) {
    if (error instanceof SlugAlreadyExistsError) {
      throw error
    }
    throw new PostCreationFailedError()
  }
}

export async function findPaginated(
  params: postQueries.FindPaginatedParams,
): Promise<PaginateDocs<TPost>> {
  return await postQueries.findPaginated(params)
}

export async function findById(id: string): Promise<TPost | undefined> {
  return await postQueries.findById(id)
}

export async function findBySlug(slug: string): Promise<TPost | undefined> {
  return await postQueries.findBySlug(slug)
}

export async function update(id: string, data: TUpdatePost): Promise<void> {
  const existingPost = await postQueries.findById(id)
  if (!existingPost) {
    throw new PostNotFoundError()
  }

  const { title, content, categoryId } = data
  const slug = createSlugFrom(title)

  // Check if new slug is different and already exists
  if (slug !== existingPost.slug) {
    const exists = await postQueries.slugExists(slug)
    if (exists) {
      throw new SlugAlreadyExistsError()
    }
  }

  await postQueries.update(id, {
    slug,
    title,
    content,
    categoryId,
    updatedAt: new Date(),
  })
}

export async function deleteById(id: string): Promise<void> {
  const existingPost = await postQueries.findById(id)
  if (!existingPost) {
    throw new PostNotFoundError()
  }

  await postQueries.deleteById(id)
}

export async function deleteMany(ids: string[]): Promise<void> {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('Invalid post IDs provided')
  }

  await postQueries.deleteMany(ids)
}
