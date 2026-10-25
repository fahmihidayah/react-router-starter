import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useLoaderData } from 'react-router'
import { SearchEmptyState } from '~/components/search-empty-state'
import { SearchField } from '~/components/search-field'
import { Button } from '~/components/ui/button'
import { LearningTemplateSection } from '~/features/learning-template/components'
import { learningTemplateCatalogLoader } from '~/features/learning-template/loaders'
import { filterLearningTemplateCatalog } from '~/features/learning-template/utils/search'
import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import * as m from '~/paraglide/messages.js'
import type { Route } from './+types/learning-templates._index'

export const middleware: Route.MiddlewareFunction[] = [
  enforceRoutePermissions({ loader: PERMISSION_KEYS.LEARNING_TEMPLATES_READ }),
]

export function meta() {
  return [{ title: m.learning_template_meta_title() }]
}

export function loader(args: Route.LoaderArgs) {
  return learningTemplateCatalogLoader(args)
}

export default function LearningTemplatesPage() {
  const catalog = useLoaderData<typeof loader>()
  const [search, setSearch] = useState('')
  const filtered = filterLearningTemplateCatalog(catalog, search)
  const hasTemplates = catalog.owned.length > 0 || catalog.publicFromOthers.length > 0
  const hasSearchResults = filtered.owned.length > 0 || filtered.publicFromOthers.length > 0
  return (
    <div className="flex-1 p-6">
      <div className="w-full space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {m.learning_template_page_title()}
            </h1>
            <p className="mt-2 text-muted-foreground">{m.learning_template_page_description()}</p>
          </div>
          <Button asChild>
            <Link to="/track-app/learning-templates/new">
              <Plus /> {m.learning_template_new()}
            </Link>
          </Button>
        </div>
        {hasTemplates ? (
          <SearchField
            value={search}
            onChange={setSearch}
            label={m.learning_template_search_label()}
            placeholder={m.learning_template_search_placeholder()}
            clearLabel={m.search_clear()}
          />
        ) : null}
        {search.trim() && !hasSearchResults ? (
          <SearchEmptyState
            title={m.learning_template_search_no_results_title()}
            description={m.learning_template_search_no_results_description({
              query: search.trim(),
            })}
          />
        ) : (
          <>
            {search.trim() && filtered.owned.length === 0 ? null : (
              <LearningTemplateSection
                title={m.learning_template_mine()}
                description={m.learning_template_mine_description()}
                emptyText={m.learning_template_mine_empty()}
                templates={filtered.owned}
              />
            )}
            {search.trim() && filtered.publicFromOthers.length === 0 ? null : (
              <LearningTemplateSection
                title={m.learning_template_community()}
                description={m.learning_template_community_description()}
                emptyText={m.learning_template_community_empty()}
                templates={filtered.publicFromOthers}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
