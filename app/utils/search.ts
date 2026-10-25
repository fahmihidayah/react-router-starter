function normalizeSearchText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
}

export function matchesSearchQuery(query: string, values: string[]) {
  const normalizedQuery = normalizeSearchText(query.trim())
  if (!normalizedQuery) return true
  return values.some((value) => normalizeSearchText(value).includes(normalizedQuery))
}
