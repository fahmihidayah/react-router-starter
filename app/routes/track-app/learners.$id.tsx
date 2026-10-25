import { ArrowLeft } from 'lucide-react'
import { Link, useActionData, useLoaderData, useSearchParams } from 'react-router'
import { Button } from '~/components/ui/button'
import {
  archiveTrackAction,
  createActivityAction,
  createTrackAction,
  deleteActivityAction,
  renameTrackAction,
} from '~/features/activities/actions'
import * as activityService from '~/features/activities/services'
import {
  createGoalAction,
  createGoalGroupAction,
  deleteGoalAction,
  deleteGoalGroupAction,
  deleteProgressEntryAction,
  moveGoalToGroupAction,
  renameGoalGroupAction,
  saveProgressEntryAction,
} from '~/features/goals/actions/goal-actions'
import * as goalService from '~/features/goals/services'
import {
  addLearnerAccessAction,
  deleteLearnerAction,
  updateLearnerAction,
} from '~/features/learners/actions/learner-actions'
import {
  LearnerDetailHeader,
  type LearnerDetailTab,
  LearnerDetailTabs,
} from '~/features/learners/components/detail'
import * as learnerService from '~/features/learners/services'
import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import { buildMonthlyLearnerReport } from '~/features/reports/services'
import { userContext } from '~/features/users/contexts'
import * as m from '~/paraglide/messages.js'
import { routeLogger } from '~/utils/logger'
import type { Route } from './+types/learners.$id'

export const middleware: Route.MiddlewareFunction[] = [
  enforceRoutePermissions({
    action: PERMISSION_KEYS.LEARNERS_UPDATE,
    intents: {
      addAccess: PERMISSION_KEYS.LEARNERS_SHARE,
      archiveTrack: PERMISSION_KEYS.ACTIVITIES_UPDATE,
      createActivity: PERMISSION_KEYS.ACTIVITIES_CREATE,
      createGoal: PERMISSION_KEYS.GOALS_CREATE,
      createGoalGroup: PERMISSION_KEYS.GOALS_CREATE,
      createTrack: PERMISSION_KEYS.ACTIVITIES_CREATE,
      delete: PERMISSION_KEYS.LEARNERS_DELETE,
      deleteActivity: PERMISSION_KEYS.ACTIVITIES_DELETE,
      deleteGoal: PERMISSION_KEYS.GOALS_DELETE,
      deleteGoalGroup: PERMISSION_KEYS.GOALS_DELETE,
      deleteProgressEntry: PERMISSION_KEYS.GOALS_UPDATE,
      moveGoal: PERMISSION_KEYS.GOALS_UPDATE,
      renameGoalGroup: PERMISSION_KEYS.GOALS_UPDATE,
      renameTrack: PERMISSION_KEYS.ACTIVITIES_UPDATE,
      saveProgressEntry: PERMISSION_KEYS.GOALS_UPDATE,
    },
    loader: {
      allOf: [
        PERMISSION_KEYS.LEARNERS_READ,
        PERMISSION_KEYS.GOALS_READ,
        PERMISSION_KEYS.ACTIVITIES_READ,
      ],
    },
  }),
]

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data ? `${data.learner.name} - Track App` : m.learner_detail_meta_title() }]
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  if (!params.id) throw new Response('Learner ID is required', { status: 400 })
  const authSession = context.get(userContext)
  if (!authSession.user) throw new Response('Unauthorized', { status: 401 })

  const detail = await learnerService.getDetailForUser(params.id, authSession.user.id)
  if (!detail) throw new Response('Learner not found', { status: 404 })
  const [goals, goalGroups, activityData, reportTracks] = await Promise.all([
    goalService.findWithProgress(params.id),
    goalService.findGroupsForLearner(params.id),
    activityService.findForLearner(params.id),
    activityService.findAllTracksForLearner(params.id),
  ])
  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
  const report = buildMonthlyLearnerReport({
    requestedMonth: new URL(request.url).searchParams.get('month'),
    today,
    learnerCreatedAt: detail.learner.createdAt,
    goals,
    activities: activityData.activities,
    tracks: reportTracks,
  })
  return { ...detail, ...activityData, goals, goalGroups, today, report }
}

export async function action(args: Route.ActionArgs) {
  const learnerId = args.params.id
  if (!learnerId) throw new Response('Learner ID is required', { status: 400 })

  const formData = await args.request.clone().formData()
  const intent = formData.get('intent')
  const goalId = formData.get('goalId')
  const entryId = formData.get('entryId')
  const activityId = formData.get('activityId')
  const trackId = formData.get('trackId')
  const groupId = formData.get('groupId')

  if (intent === 'delete') {
    routeLogger.info('Routing learner detail deletion', { learnerId })
    return deleteLearnerAction(args, learnerId)
  }
  if (intent === 'addAccess') return addLearnerAccessAction(args, learnerId)
  if (intent === 'createGoal') return createGoalAction(args, learnerId)
  if (intent === 'createGoalGroup') return createGoalGroupAction(args, learnerId)
  if (intent === 'renameGoalGroup') {
    if (typeof groupId !== 'string') throw new Response('Group ID is required', { status: 400 })
    return renameGoalGroupAction(args, learnerId, groupId)
  }
  if (intent === 'deleteGoalGroup') {
    if (typeof groupId !== 'string') throw new Response('Group ID is required', { status: 400 })
    return deleteGoalGroupAction(args, learnerId, groupId)
  }
  if (intent === 'moveGoal') {
    if (typeof goalId !== 'string') throw new Response('Goal ID is required', { status: 400 })
    return moveGoalToGroupAction(args, learnerId, goalId)
  }
  if (intent === 'createActivity') return createActivityAction(args, learnerId)
  if (intent === 'createTrack') return createTrackAction(args, learnerId)
  if (intent === 'deleteActivity') {
    if (typeof activityId !== 'string')
      throw new Response('Activity ID is required', { status: 400 })
    return deleteActivityAction(args, learnerId, activityId)
  }
  if (intent === 'renameTrack') {
    if (typeof trackId !== 'string') throw new Response('Track ID is required', { status: 400 })
    return renameTrackAction(args, learnerId, trackId)
  }
  if (intent === 'archiveTrack') {
    if (typeof trackId !== 'string') throw new Response('Track ID is required', { status: 400 })
    return archiveTrackAction(args, learnerId, trackId)
  }
  if (intent === 'saveProgressEntry') {
    if (typeof goalId !== 'string') throw new Response('Goal ID is required', { status: 400 })
    return saveProgressEntryAction(args, learnerId, goalId)
  }
  if (intent === 'deleteProgressEntry') {
    if (typeof goalId !== 'string') throw new Response('Goal ID is required', { status: 400 })
    if (typeof entryId !== 'string') throw new Response('Entry ID is required', { status: 400 })
    return deleteProgressEntryAction(args, learnerId, goalId, entryId)
  }
  if (intent === 'deleteGoal') {
    if (typeof goalId !== 'string') throw new Response('Goal ID is required', { status: 400 })
    return deleteGoalAction(args, learnerId, goalId)
  }

  return updateLearnerAction(args, learnerId)
}

const detailTabs: LearnerDetailTab[] = ['overview', 'activities', 'goals', 'access', 'settings']

export default function LearnerDetailPage() {
  const { learner, goals, goalGroups, activities, tracks, today, accessUsers, memberRole, report } =
    useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const [searchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const actionScope = actionData && 'scope' in actionData ? actionData.scope : undefined
  const goalOperation = actionData && 'operation' in actionData ? actionData.operation : undefined
  const goalErrors =
    actionData && 'errors' in actionData && actionScope === 'goal' ? actionData.errors : undefined
  const settingsErrors =
    actionData && 'errors' in actionData && !actionScope ? actionData.errors : undefined
  const accessErrors =
    actionData && 'errors' in actionData && actionScope === 'access' ? actionData.errors : undefined
  const activityErrors =
    actionData && 'errors' in actionData && actionScope === 'activity'
      ? actionData.errors
      : undefined
  const activityOperation =
    actionData &&
    'operation' in actionData &&
    actionScope === 'activity' &&
    typeof actionData.operation === 'string'
      ? actionData.operation
      : undefined
  const activityErrorTrackId =
    actionData &&
    'trackId' in actionData &&
    actionScope === 'activity' &&
    typeof actionData.trackId === 'string'
      ? actionData.trackId
      : undefined
  const activityEntryMode =
    actionData &&
    'entryMode' in actionData &&
    actionScope === 'activity' &&
    (actionData.entryMode === 'manual' || actionData.entryMode === 'pomodoro')
      ? actionData.entryMode
      : undefined
  const goalErrorId =
    actionData && 'goalId' in actionData && typeof actionData.goalId === 'string'
      ? actionData.goalId
      : undefined
  const goalEntryMode =
    actionData &&
    'entryMode' in actionData &&
    actionScope === 'goal' &&
    (actionData.entryMode === 'manual' || actionData.entryMode === 'pomodoro')
      ? actionData.entryMode
      : undefined
  const goalGroupErrorId =
    actionData && 'groupId' in actionData && typeof actionData.groupId === 'string'
      ? actionData.groupId
      : undefined
  const defaultTab: LearnerDetailTab =
    actionScope === 'activity'
      ? 'activities'
      : actionScope === 'goal'
        ? 'goals'
        : actionScope === 'access'
          ? 'access'
          : requestedTab && detailTabs.includes(requestedTab as LearnerDetailTab)
            ? (requestedTab as LearnerDetailTab)
            : 'overview'

  return (
    <div className="flex-1 p-6">
      <div className="w-full space-y-6">
        <Button asChild variant="ghost" className="-ml-3">
          <Link to="/track-app/learners">
            <ArrowLeft /> {m.learner_back_to_learners()}
          </Link>
        </Button>

        <LearnerDetailHeader learner={learner} />
        <LearnerDetailTabs
          learner={learner}
          goals={goals}
          goalGroups={goalGroups}
          activities={activities}
          tracks={tracks}
          today={today}
          activityErrors={activityErrors}
          activityOperation={activityOperation}
          activityErrorTrackId={activityErrorTrackId}
          activityEntryMode={activityEntryMode}
          accessUsers={accessUsers}
          memberRole={memberRole}
          accessErrors={accessErrors}
          defaultTab={defaultTab}
          goalErrors={goalErrors}
          goalErrorId={goalErrorId}
          goalEntryMode={goalEntryMode}
          showGoalForm={goalOperation === 'create'}
          goalGroupOperation={typeof goalOperation === 'string' ? goalOperation : undefined}
          goalGroupErrorId={goalGroupErrorId}
          settingsErrors={settingsErrors}
          report={report}
        />
      </div>
    </div>
  )
}
