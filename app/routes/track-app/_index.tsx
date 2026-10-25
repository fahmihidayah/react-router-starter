import { useActionData, useLoaderData, useRouteLoaderData } from 'react-router'
import { createActivityAction } from '~/features/activities/actions'
import { DashboardActivityForm } from '~/features/activities/components'
import * as activityService from '~/features/activities/services'
import { saveProgressEntryAction } from '~/features/goals/actions/goal-actions'
import * as goalService from '~/features/goals/services'
import * as learnerService from '~/features/learners/services'
import { enforceRoutePermissions, PERMISSION_KEYS } from '~/features/permissions'
import * as scheduleService from '~/features/schedules/services'
import { dateKeyInTimeZone } from '~/features/schedules/utils/date-range'
import { DashboardAttentionList } from '~/features/track-app/components/dashboard-attention-list'
import { DashboardLearnerTable } from '~/features/track-app/components/dashboard-learner-table'
import { DashboardRecentUpdates } from '~/features/track-app/components/dashboard-recent-updates'
import { DashboardSummary } from '~/features/track-app/components/dashboard-summary'
import { DashboardTodaySchedule } from '~/features/track-app/components/dashboard-today-schedule'
import { DashboardWeeklyChart } from '~/features/track-app/components/dashboard-weekly-chart'
import { buildDashboardGoalReport } from '~/features/track-app/dashboard-report'
import type { DashboardLearner } from '~/features/track-app/types'
import { userContext } from '~/features/users/contexts'
import * as m from '~/paraglide/messages.js'
import type { loader as trackAppLoader } from '../track-app'
import type { Route } from './+types/_index'

export const middleware: Route.MiddlewareFunction[] = [
  enforceRoutePermissions({
    intents: {
      createActivity: PERMISSION_KEYS.ACTIVITIES_CREATE,
      saveProgressEntry: PERMISSION_KEYS.GOALS_UPDATE,
    },
    loader: {
      allOf: [
        PERMISSION_KEYS.LEARNERS_READ,
        PERMISSION_KEYS.GOALS_READ,
        PERMISSION_KEYS.ACTIVITIES_READ,
        PERMISSION_KEYS.SCHEDULES_READ,
      ],
    },
  }),
]

export function meta() {
  return [{ title: 'Track App' }, { name: 'description', content: m.track_app_meta_description() }]
}

const DASHBOARD_TIMEZONE = 'Asia/Jakarta'

export async function loader({ context }: Route.LoaderArgs) {
  const authSession = context.get(userContext)
  if (!authSession.user) throw new Response('Unauthorized', { status: 401 })
  const userId = authSession.user.id

  const organized = await learnerService.findOrganizedForUser(userId)
  const groupedLearners = organized.groups.flatMap((group) =>
    group.learners.map((learner) => ({ ...learner, groupName: group.name })),
  )
  const organizedLearners = [
    ...groupedLearners,
    ...organized.ungrouped.map((learner) => ({ ...learner, groupName: null })),
  ]
  const learnersWithGoals: DashboardLearner[] = await Promise.all(
    organizedLearners.map(async (learner) => ({
      ...learner,
      goals: await goalService.findWithProgress(learner.id),
    })),
  )
  const today = dateKeyInTimeZone(new Date(), DASHBOARD_TIMEZONE)
  const [report, manageableLearnersWithTracks, todaySchedules] = await Promise.all([
    activityService.findDashboardReport(
      learnersWithGoals.map((learner) => learner.id),
      today,
    ),
    Promise.all(
      learnersWithGoals
        .filter((learner) => learner.role !== 'viewer')
        .map(async (learner) => ({
          ...learner,
          tracks: await activityService.findTracksForLearner(learner.id),
        })),
    ),
    Promise.all(
      learnersWithGoals.map(async (learner) => {
        const schedule = await scheduleService.findRangeForUser(learner.id, userId, today, today)
        return { learnerId: learner.id, todos: schedule?.todos ?? [] }
      }),
    ),
  ])
  return {
    report,
    learners: learnersWithGoals,
    manageableLearners: manageableLearnersWithTracks,
    todaySchedules,
    today,
  }
}

export async function action(args: Route.ActionArgs) {
  const formData = await args.request.clone().formData()
  const intent = formData.get('intent')
  const learnerId = formData.get('learnerId')
  const goalId = formData.get('goalId')

  if (intent === 'createActivity') {
    if (typeof learnerId !== 'string' || !learnerId) {
      return {
        success: false as const,
        scope: 'activity' as const,
        operation: 'create-activity' as const,
        errors: { learnerId: [m.activity_choose_learner()] },
      }
    }
    return createActivityAction(args, learnerId, '/track-app')
  }

  if (intent !== 'saveProgressEntry') throw new Response('Invalid action', { status: 400 })
  if (typeof learnerId !== 'string') throw new Response('Learner ID is required', { status: 400 })
  if (typeof goalId !== 'string') throw new Response('Goal ID is required', { status: 400 })

  return saveProgressEntryAction(args, learnerId, goalId, '/track-app')
}

export default function TrackAppIndex() {
  const data = useRouteLoaderData<typeof trackAppLoader>('track-app-layout')
  const { report, learners, manageableLearners, todaySchedules, today } =
    useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const actionScope = actionData && 'scope' in actionData ? actionData.scope : undefined
  const goalErrors =
    actionData && actionScope === 'goal' && 'errors' in actionData ? actionData.errors : undefined
  const activityErrors =
    actionData && actionScope === 'activity' && 'errors' in actionData
      ? actionData.errors
      : undefined
  const errorGoalId = actionData && 'goalId' in actionData ? actionData.goalId : undefined
  const goalEntryMode =
    actionData &&
    'entryMode' in actionData &&
    actionScope === 'goal' &&
    (actionData.entryMode === 'manual' || actionData.entryMode === 'pomodoro')
      ? actionData.entryMode
      : undefined
  const goalReport = buildDashboardGoalReport(learners, today)
  const activitiesToday = report.weekly.at(-1)?.activityCount ?? 0

  return (
    <div className="flex-1 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-[96rem] space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {m.track_app_welcome({ name: data?.user.name ?? '' })}
            </h1>
            <p className="mt-2 text-muted-foreground">{m.track_app_welcome_description()}</p>
          </div>
        </div>

        <DashboardSummary
          totalGoals={goalReport.expectedGoalCount}
          updatedGoals={goalReport.updatedGoalCount}
          learnersNeedingAttention={goalReport.learnersNeedingAttention}
          activitiesToday={activitiesToday}
          action={
            <DashboardActivityForm
              learners={manageableLearners}
              today={today}
              errors={activityErrors}
              defaultOpen={Boolean(activityErrors)}
            />
          }
        />

        <DashboardTodaySchedule learners={learners} schedules={todaySchedules} today={today} />

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{m.track_app_learner_progress()}</h2>
            <p className="text-sm text-muted-foreground">
              {m.track_app_learner_progress_description()}
            </p>
          </div>
          <DashboardLearnerTable learners={learners} today={today} />
        </section>

        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
          <DashboardAttentionList
            items={goalReport.attentionItems}
            errors={goalErrors}
            errorGoalId={errorGoalId}
            entryMode={goalEntryMode}
          />
          <DashboardWeeklyChart data={report.weekly} />
        </section>

        <section>
          <DashboardRecentUpdates records={report.recentRecords} learners={learners} />
        </section>
      </div>
    </div>
  )
}
