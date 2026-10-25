import type { TGoalGroup } from '~/db/schema'
import * as m from '~/paraglide/messages.js'
import type { GoalWithProgress } from '../types'
import { CreateGoalForm } from './create-goal-form'
import { GoalGroupsBoard } from './goal-groups-board'

interface GoalsTabProps {
  goals: GoalWithProgress[]
  errors?: Record<string, string[] | undefined>
  errorGoalId?: string
  entryMode?: 'manual' | 'pomodoro'
  showCreateForm?: boolean
  groups: TGoalGroup[]
  canManage: boolean
  groupOperation?: string
  groupErrorId?: string
}

export function GoalsTab({
  goals,
  groups,
  canManage,
  errors,
  errorGoalId,
  entryMode,
  showCreateForm = false,
  groupOperation,
  groupErrorId,
}: GoalsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{m.goal_learning_title()}</h2>
          <p className="text-sm text-muted-foreground">{m.goal_learning_description()}</p>
        </div>
        {canManage ? (
          <CreateGoalForm
            groups={groups}
            errors={showCreateForm ? errors : undefined}
            defaultOpen={showCreateForm}
          />
        ) : null}
      </div>

      <GoalGroupsBoard
        groups={groups}
        goals={goals}
        canManage={canManage}
        errors={groupOperation === 'entry' ? errors : undefined}
        errorGoalId={errorGoalId}
        entryMode={entryMode}
        createGroupErrors={groupOperation === 'create-group' ? errors : undefined}
        renameGroupErrors={groupOperation === 'rename-group' ? errors : undefined}
        renameErrorGroupId={groupErrorId}
      />
    </div>
  )
}
