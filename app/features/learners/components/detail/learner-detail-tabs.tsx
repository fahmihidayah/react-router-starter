import { BookOpenCheck, LayoutDashboard, Settings, ShieldCheck, Target } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import type { TActivityTrack, TGoalGroup, TLearner, TLearnerMember } from '~/db/schema'
import { ActivitiesTab } from '~/features/activities/components'
import type { LearningActivityWithDetails } from '~/features/activities/types'
import { GoalOverview, GoalsTab } from '~/features/goals/components'
import type { GoalWithProgress } from '~/features/goals/types'
import { MonthlyLearnerReportView } from '~/features/reports/components'
import type { MonthlyLearnerReport } from '~/features/reports/types'
import * as m from '~/paraglide/messages.js'
import type { LearnerAccessUser } from '../../types'
import { AccessTab } from './access-tab'
import { SettingsTab } from './settings-tab'

export type LearnerDetailTab = 'access' | 'activities' | 'goals' | 'overview' | 'settings'

interface LearnerDetailTabsProps {
  learner: TLearner
  goals: GoalWithProgress[]
  goalGroups: TGoalGroup[]
  activities: LearningActivityWithDetails[]
  tracks: TActivityTrack[]
  today: string
  activityErrors?: Record<string, string[] | undefined>
  activityOperation?: string
  activityErrorTrackId?: string
  activityEntryMode?: 'manual' | 'pomodoro'
  accessUsers: LearnerAccessUser[]
  memberRole: TLearnerMember['role']
  accessErrors?: Record<string, string[] | undefined>
  defaultTab?: LearnerDetailTab
  goalErrors?: Record<string, string[] | undefined>
  goalErrorId?: string
  goalEntryMode?: 'manual' | 'pomodoro'
  showGoalForm?: boolean
  settingsErrors?: Record<string, string[] | undefined>
  goalGroupOperation?: string
  goalGroupErrorId?: string
  report: MonthlyLearnerReport
}

export function LearnerDetailTabs({
  learner,
  goals,
  goalGroups,
  activities,
  tracks,
  today,
  activityErrors,
  activityOperation,
  activityErrorTrackId,
  activityEntryMode,
  accessUsers,
  memberRole,
  accessErrors,
  defaultTab = 'overview',
  goalErrors,
  goalErrorId,
  goalEntryMode,
  showGoalForm,
  settingsErrors,
  goalGroupOperation,
  goalGroupErrorId,
  report,
}: LearnerDetailTabsProps) {
  const canManage = memberRole !== 'viewer'
  const isOwner = memberRole === 'owner'
  const visibleDefaultTab =
    !isOwner && (defaultTab === 'access' || defaultTab === 'settings') ? 'overview' : defaultTab
  return (
    <Tabs key={visibleDefaultTab} defaultValue={visibleDefaultTab} className="gap-6">
      <div className="overflow-x-auto pb-1">
        <TabsList className="w-full min-w-max justify-start sm:w-fit">
          <TabsTrigger value="overview">
            <LayoutDashboard /> {m.learner_tab_overview()}
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target /> {m.learner_tab_goals()}
          </TabsTrigger>
          <TabsTrigger value="activities">
            <BookOpenCheck /> {m.learner_tab_activities()}
          </TabsTrigger>
          {isOwner ? (
            <TabsTrigger value="access">
              <ShieldCheck /> {m.learner_tab_access()}
            </TabsTrigger>
          ) : null}
          {isOwner ? (
            <TabsTrigger value="settings">
              <Settings /> {m.learner_tab_settings()}
            </TabsTrigger>
          ) : null}
        </TabsList>
      </div>
      <TabsContent value="overview">
        <div className="space-y-8">
          <GoalOverview goals={goals} />
          <MonthlyLearnerReportView report={report} />
        </div>
      </TabsContent>
      <TabsContent value="goals">
        <GoalsTab
          goals={goals}
          groups={goalGroups}
          canManage={canManage}
          errors={goalErrors}
          errorGoalId={goalErrorId}
          entryMode={goalEntryMode}
          showCreateForm={showGoalForm}
          groupOperation={goalGroupOperation}
          groupErrorId={goalGroupErrorId}
        />
      </TabsContent>
      <TabsContent value="activities">
        <ActivitiesTab
          activities={activities}
          tracks={tracks}
          today={today}
          errors={activityErrors}
          operation={activityOperation}
          errorTrackId={activityErrorTrackId}
          activityEntryMode={activityEntryMode}
          canManage={canManage}
        />
      </TabsContent>
      {isOwner ? (
        <TabsContent value="access">
          <AccessTab users={accessUsers} errors={accessErrors} />
        </TabsContent>
      ) : null}
      {isOwner ? (
        <TabsContent value="settings">
          <SettingsTab learner={learner} errors={settingsErrors} />
        </TabsContent>
      ) : null}
    </Tabs>
  )
}
