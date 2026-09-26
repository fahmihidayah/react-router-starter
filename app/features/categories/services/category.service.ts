import { randomUUID } from 'node:crypto'
import type { TCategory } from '~/db/schema'
import type { PaginateDocs } from '~/types/pagination'
import * as categoryQueries from '../queries'
import type { TCreateCategory, TUpdateCategory } from '../schemas/form/category-schema'
import {
  CategoryAlreadyExistsError,
  CategoryCreationFailedError,
  CategoryNotFoundError,
  InvalidCategoryDataError,
} from '../types/errors/category-errors'

export async function create(data: TCreateCategory): Promise<string> {
  const { title } = data

  // Check if category with same title already exists
  const existingCategory = await categoryQueries.findByTitle(title)
  if (existingCategory) {
    throw new CategoryAlreadyExistsError()
  }

  try {
    const now = new Date()
    const categoryId = await categoryQueries.create({
      id: randomUUID(),
      title,
      createdAt: now,
      updatedAt: now,
    })
    return categoryId
  } catch (error) {
    throw new CategoryCreationFailedError()
  }
}

export async function findPaginated(
  params: categoryQueries.FindPaginatedParams,
): Promise<PaginateDocs<TCategory>> {
  return await categoryQueries.findPaginated(params)
}

export async function findById(id: string): Promise<TCategory | undefined> {
  return await categoryQueries.findById(id)
}

export async function update(id: string, data: TUpdateCategory): Promise<void> {
  const existingCategory = await categoryQueries.findById(id)
  if (!existingCategory) {
    throw new CategoryNotFoundError()
  }

  // Check title uniqueness if title is being changed
  if (data.title && data.title !== existingCategory.title) {
    const categoryWithTitle = await categoryQueries.findByTitle(data.title)
    if (categoryWithTitle && categoryWithTitle.id !== id) {
      throw new CategoryAlreadyExistsError('Title already in use')
    }
  }

  await categoryQueries.update(id, data)
}

export async function deleteById(id: string): Promise<void> {
  const existingCategory = await categoryQueries.findById(id)
  if (!existingCategory) {
    throw new CategoryNotFoundError()
  }

  await categoryQueries.deleteById(id)
}

export async function deleteMany(ids: string[]): Promise<void> {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new InvalidCategoryDataError('Invalid category IDs provided')
  }

  await categoryQueries.deleteMany(ids)
}
