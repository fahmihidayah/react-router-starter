import { db } from '~/lib/database'

export function getPostCategoriesLoader() {
  return db.query.categories.findMany({ orderBy: { title: 'asc' } })
}
