import { useState } from 'react'
import { useActionData, useLoaderData } from 'react-router'
import { SearchEmptyState } from '~/components/search-empty-state'
import { SearchField } from '~/components/search-field'
import * as activityService from '~/features/activities/services'
import {
  createLearnerGroupAction,
  deleteLearnerAction,
  deleteLearnerGroupAction,
  moveLearnerToGroupAction,
  renameLearnerGroupAction,
} from '~/features/learners/actions/learner-actions'
import { LearnerGroupsBoard } from '~/features/learners/components/learner-groups-board'
import { LearnersEmptyCard } from '~/features/learners/components/learners-empty-card'
import * as learnerService from '~/features/learners/services'
import { filterOrganizedLearners } from '~/features/learners/utils/search'
import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import { userContext } from '~/features/users/contexts'
import * as m from '~/paraglide/messages.js'
import { routeLogger } from '~/utils/logger'
import type { Route } from './+types/learners._index'

export const middleware: Route.MiddlewareFunction[] = [
  enforceRoutePermissions({
    intents: {
      createGroup: PERMISSION_KEYS.LEARNERS_UPDATE,
      delete: PERMISSION_KEYS.LEARNERS_DELETE,
      deleteGroup: PERMISSION_KEYS.LEARNERS_UPDATE,
      moveLearner: PERMISSION_KEYS.LEARNERS_UPDATE,
      renameGroup: PERMISSION_KEYS.LEARNERS_UPDATE,
    },
    loader: PERMISSION_KEYS.LEARNERS_READ,
  }),
]

export function meta() {
  return [
    { title: m.learners_meta_title() },
    { name: 'description', content: m.learners_meta_description() },
  ]
}

function todayDateKey() {
  const now = new Date()
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
}

export async function loader({ context }: Route.LoaderArgs) {
  const authSession = context.get(userContext)
  if (!authSession.user) throw new Response('Unauthorized', { status: 401 })
  const organized = await learnerService.findOrganizedForUser(authSession.user.id)
  const learners = [...organized.groups.flatMap((group) => group.learners), ...organized.ungrouped]
  const summaries = await activityService.findTodaySummaries(
    learners.map((learner) => learner.id),
    todayDateKey(),
  )
  const withToday = (learner: (typeof learners)[number]) => {
    const summary = summaries.get(learner.id) ?? { goalsUpdated: 0, activitiesAdded: 0 }
    return {
      ...learner,
      goalsUpdatedToday: summary.goalsUpdated,
      activitiesAddedToday: summary.activitiesAdded,
    }
  }

  return {
    groups: organized.groups.map((group) => ({
      ...group,
      learners: group.learners.map(withToday),
    })),
    ungrouped: organized.ungrouped.map(withToday),
  }
}

export async function action(args: Route.ActionArgs) {
  const formData = await args.request.clone().formData()
  const intent = formData.get('intent')
  const groupId = formData.get('groupId')
  const learnerId = formData.get('learnerId')

  if (intent === 'createGroup') return createLearnerGroupAction(args)
  if (intent === 'renameGroup') {
    if (typeof groupId !== 'string') throw new Response('Group ID is required', { status: 400 })
    return renameLearnerGroupAction(args, groupId)
  }
  if (intent === 'deleteGroup') {
    if (typeof groupId !== 'string') throw new Response('Group ID is required', { status: 400 })
    return deleteLearnerGroupAction(args, groupId)
  }
  if (intent === 'moveLearner') {
    if (typeof learnerId !== 'string') throw new Response('Learner ID is required', { status: 400 })
    return moveLearnerToGroupAction(args, learnerId)
  }

  if (intent === 'delete') {
    const id = formData.get('id')
    if (typeof id !== 'string') throw new Response('Learner ID is required', { status: 400 })

    routeLogger.info('Routing learner list deletion', { learnerId: id })
    return deleteLearnerAction(args, id)
  }

  routeLogger.warn('Unknown learner list action intent', { intent })
  throw new Response('Invalid action intent', { status: 400 })
}

export default function LearnersPage() {
  const { groups, ungrouped } = useLoaderData<typeof loader>()
  const [search, setSearch] = useState('')
  const actionData = useActionData<typeof action>()
  const groupFailure =
    actionData && 'scope' in actionData && actionData.scope === 'learner-group'
      ? actionData
      : undefined
  const hasLearners = groups.length > 0 || ungrouped.length > 0
  const filtered = filterOrganizedLearners(groups, ungrouped, search)
  const hasSearchResults = filtered.groups.length > 0 || filtered.ungrouped.length > 0

  return (
    <div className="flex-1 p-6">
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{m.track_app_learners()}</h1>
          <p className="mt-2 text-muted-foreground">{m.learners_page_description()}</p>
        </div>

        {hasLearners ? (
          <SearchField
            value={search}
            onChange={setSearch}
            label={m.learners_search_label()}
            placeholder={m.learners_search_placeholder()}
            clearLabel={m.search_clear()}
          />
        ) : null}

        {!hasLearners ? (
          <LearnersEmptyCard />
        ) : search.trim() && !hasSearchResults ? (
          <SearchEmptyState
            title={m.learners_search_no_results_title()}
            description={m.learners_search_no_results_description({ query: search.trim() })}
          />
        ) : (
          <LearnerGroupsBoard
            groups={filtered.groups}
            ungrouped={filtered.ungrouped}
            isFiltering={Boolean(search.trim())}
            createErrors={groupFailure?.operation === 'create' ? groupFailure.errors : undefined}
            renameErrors={groupFailure?.operation === 'rename' ? groupFailure.errors : undefined}
            renameErrorGroupId={groupFailure?.groupId}
          />
        )}
      </div>
    </div>
  )
}
