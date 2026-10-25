import { matchesSearchQuery } from '~/utils/search'
import type { LearningTemplateCatalog } from '../types'

export function filterLearningTemplateCatalog(catalog: LearningTemplateCatalog, query: string) {
  if (!query.trim()) return catalog

  const matches = (template: LearningTemplateCatalog['owned'][number]) =>
    matchesSearchQuery(query, [template.title, template.ownerName])

  return {
    owned: catalog.owned.filter(matches),
    publicFromOthers: catalog.publicFromOthers.filter(matches),
  }
}
