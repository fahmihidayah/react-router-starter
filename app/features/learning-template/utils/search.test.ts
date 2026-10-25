import { describe, expect, it } from 'vitest'
import type { LearningTemplateCatalogItem } from '../types'
import { filterLearningTemplateCatalog } from './search'

function template(id: string, title: string, ownerName: string): LearningTemplateCatalogItem {
  return {
    id,
    ownerUserId: `owner-${id}`,
    title,
    ownerName,
    visibility: 'public',
    goalCount: 1,
    archivedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }
}

const catalog = {
  owned: [template('template-1', 'Daily Reading', 'Sari')],
  publicFromOthers: [template('template-2', 'Number Sense', 'Budi')],
}

describe('filterLearningTemplateCatalog', () => {
  it('matches template titles across catalog sections', () => {
    const result = filterLearningTemplateCatalog(catalog, 'reading')

    expect(result.owned.map(({ id }) => id)).toEqual(['template-1'])
    expect(result.publicFromOthers).toEqual([])
  })

  it('matches author names case-insensitively', () => {
    const result = filterLearningTemplateCatalog(catalog, 'BUDI')

    expect(result.owned).toEqual([])
    expect(result.publicFromOthers.map(({ id }) => id)).toEqual(['template-2'])
  })

  it('returns the original catalog for a blank query', () => {
    expect(filterLearningTemplateCatalog(catalog, '   ')).toBe(catalog)
  })
})
