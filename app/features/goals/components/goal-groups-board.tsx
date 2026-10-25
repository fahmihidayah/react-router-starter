import { DragDropProvider, useDraggable, useDroppable } from '@dnd-kit/react'
import { Copy, Folder, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Form, useFetcher } from 'react-router'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Progress } from '~/components/ui/progress'
import type { TGoalGroup } from '~/db/schema'
import { useActionDialog } from '~/hooks/use-action-dialog'
import { cn } from '~/lib/utils'
import * as m from '~/paraglide/messages.js'
import type { GoalWithProgress } from '../types'
import { GoalCard } from './goal-card'

type PendingMove = {
  goal: GoalWithProgress
  groupId: string | null
  groupName: string
}

function DraggableGoal({
  goal,
  canManage,
  errors,
  defaultOpen,
  entryMode,
}: {
  goal: GoalWithProgress
  canManage: boolean
  errors?: Record<string, string[] | undefined>
  defaultOpen?: boolean
  entryMode?: 'manual' | 'pomodoro'
}) {
  const { ref, handleRef, isDragging } = useDraggable({
    id: `goal:${goal.id}`,
    type: 'goal',
    disabled: !canManage,
    data: { goal },
  })
  return (
    <div ref={ref} className="h-full min-w-0">
      <GoalCard
        goal={goal}
        errors={errors}
        defaultOpen={defaultOpen}
        entryMode={entryMode}
        dragHandleRef={canManage ? handleRef : undefined}
        isDragging={isDragging}
        canManage={canManage}
      />
    </div>
  )
}

function UngroupedGoals({
  goals,
  canManage,
  errors,
  errorGoalId,
  entryMode,
}: {
  goals: GoalWithProgress[]
  canManage: boolean
  errors?: Record<string, string[] | undefined>
  errorGoalId?: string
  entryMode?: 'manual' | 'pomodoro'
}) {
  const { ref, isDropTarget } = useDroppable({
    id: 'goal-group:ungrouped',
    type: 'goal-group',
    accept: 'goal',
    disabled: !canManage,
    data: { groupId: null, groupName: m.goal_group_ungrouped() },
  })

  return (
    <section
      ref={ref}
      className={cn(
        'space-y-4 rounded-xl border border-dashed p-4 transition-colors',
        isDropTarget && 'border-primary bg-primary/5',
      )}
    >
      <div>
        <h3 className="font-semibold">{m.goal_group_ungrouped()}</h3>
        <p className="text-sm text-muted-foreground">{m.goal_group_ungrouped_description()}</p>
      </div>
      {goals.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {canManage ? m.goal_group_drop_here() : m.goal_group_empty()}
        </p>
      ) : (
        <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => {
            const hasEntryErrors = errorGoalId === goal.id
            return (
              <DraggableGoal
                key={goal.id}
                goal={goal}
                canManage={canManage}
                errors={hasEntryErrors ? errors : undefined}
                defaultOpen={hasEntryErrors}
                entryMode={hasEntryErrors ? entryMode : undefined}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}

function groupProgress(goals: GoalWithProgress[]) {
  if (goals.length === 0) return 0
  return Math.round(
    goals.reduce(
      (sum, goal) => sum + Math.min(100, (goal.currentValue / goal.targetValue) * 100),
      0,
    ) / goals.length,
  )
}

function GoalDropGroup({
  group,
  goals,
  canManage,
  errors,
  errorGoalId,
  entryMode,
  renameErrors,
}: {
  group: TGoalGroup | null
  goals: GoalWithProgress[]
  canManage: boolean
  errors?: Record<string, string[] | undefined>
  errorGoalId?: string
  entryMode?: 'manual' | 'pomodoro'
  renameErrors?: Record<string, string[] | undefined>
}) {
  const groupId = group?.id ?? null
  const groupName = group?.name ?? m.goal_group_ungrouped()
  const { ref, isDropTarget } = useDroppable({
    id: `goal-group:${groupId ?? 'ungrouped'}`,
    type: 'goal-group',
    accept: 'goal',
    disabled: !canManage,
    data: { groupId, groupName },
  })
  const renameDialog = useActionDialog({
    intent: 'renameGoalGroup',
    errors: renameErrors,
    defaultOpen: Boolean(renameErrors),
  })
  const progress = groupProgress(goals)
  const completed = goals.filter((goal) => goal.currentValue >= goal.targetValue).length

  return (
    <Card
      ref={ref}
      className={cn(
        'min-w-0 gap-4 border-dashed py-4 transition-colors',
        isDropTarget && 'border-primary bg-primary/5',
      )}
    >
      <CardHeader className="grid-cols-[1fr_auto] px-4">
        <div className="min-w-0 space-y-2">
          <CardTitle className="flex items-center gap-2">
            <Folder className="size-4 shrink-0" />
            <span className="truncate">{groupName}</span>
          </CardTitle>
          {group?.sourceTemplateTitle ? (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Copy className="size-3" />
              {m.goal_group_from_template({ template: group.sourceTemplateTitle })}
            </p>
          ) : group ? (
            <p className="text-xs text-muted-foreground">{m.goal_group_manual()}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{m.goal_group_ungrouped_description()}</p>
          )}
        </div>
        {group && canManage ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={m.goal_group_actions()}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => renameDialog.setOpen(true)}>
                <Pencil /> {m.goal_group_rename()}
              </DropdownMenuItem>
              <DropdownMenuItem asChild variant="destructive">
                <Form method="post">
                  <input type="hidden" name="intent" value="deleteGoalGroup" />
                  <input type="hidden" name="groupId" value={group.id} />
                  <button type="submit" className="flex w-full items-center gap-2">
                    <Trash2 /> {m.goal_group_delete()}
                  </button>
                </Form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{m.goal_group_completed({ completed, total: goals.length })}</span>
            <span>{progress}%</span>
          </div>
          <Progress
            value={progress}
            aria-label={m.goal_group_progress({ group: groupName, progress })}
          />
        </div>
        {goals.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            {canManage ? m.goal_group_drop_here() : m.goal_group_empty()}
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const hasEntryErrors = errorGoalId === goal.id
              return (
                <DraggableGoal
                  key={goal.id}
                  goal={goal}
                  canManage={canManage}
                  errors={hasEntryErrors ? errors : undefined}
                  defaultOpen={hasEntryErrors}
                  entryMode={hasEntryErrors ? entryMode : undefined}
                />
              )
            })}
          </div>
        )}
      </CardContent>

      {group ? (
        <Dialog open={renameDialog.open} onOpenChange={renameDialog.setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{m.goal_group_rename()}</DialogTitle>
              <DialogDescription>{m.goal_group_rename_description()}</DialogDescription>
            </DialogHeader>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="renameGoalGroup" />
              <input type="hidden" name="groupId" value={group.id} />
              <div className="space-y-2">
                <Label htmlFor={`goal-group-${group.id}`}>{m.goal_group_name()}</Label>
                <Input id={`goal-group-${group.id}`} name="name" defaultValue={group.name} />
                {renameErrors?.name?.[0] ? (
                  <p className="text-sm text-destructive">{renameErrors.name[0]}</p>
                ) : null}
              </div>
              {group.sourceTemplateTitle ? (
                <p className="text-sm text-muted-foreground">
                  {m.goal_group_origin_preserved({ template: group.sourceTemplateTitle })}
                </p>
              ) : null}
              <DialogFooter>
                <Button type="submit">{m.goal_group_save()}</Button>
              </DialogFooter>
            </Form>
          </DialogContent>
        </Dialog>
      ) : null}
    </Card>
  )
}

export function GoalGroupsBoard({
  groups,
  goals,
  canManage,
  errors,
  errorGoalId,
  entryMode,
  createGroupErrors,
  renameGroupErrors,
  renameErrorGroupId,
}: {
  groups: TGoalGroup[]
  goals: GoalWithProgress[]
  canManage: boolean
  errors?: Record<string, string[] | undefined>
  errorGoalId?: string
  entryMode?: 'manual' | 'pomodoro'
  createGroupErrors?: Record<string, string[] | undefined>
  renameGroupErrors?: Record<string, string[] | undefined>
  renameErrorGroupId?: string
}) {
  const fetcher = useFetcher()
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null)
  const createGroupDialog = useActionDialog({
    intent: 'createGoalGroup',
    errors: createGroupErrors,
    defaultOpen: Boolean(createGroupErrors),
  })
  const ungrouped = goals.filter((goal) => !goal.groupId)

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return
        const goal = event.operation.source?.data.goal as GoalWithProgress | undefined
        const target = event.operation.target?.data as
          | { groupId: string | null; groupName: string }
          | undefined
        if (!goal || !target || goal.groupId === target.groupId) return
        setPendingMove({ goal, groupId: target.groupId, groupName: target.groupName })
      }}
    >
      <div className="space-y-4">
        {canManage ? (
          <div className="flex justify-end">
            <Dialog open={createGroupDialog.open} onOpenChange={createGroupDialog.setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus /> {m.goal_group_add()}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{m.goal_group_add()}</DialogTitle>
                  <DialogDescription>{m.goal_group_add_description()}</DialogDescription>
                </DialogHeader>
                <Form method="post" className="space-y-4">
                  <input type="hidden" name="intent" value="createGoalGroup" />
                  <div className="space-y-2">
                    <Label htmlFor="new-goal-group">{m.goal_group_name()}</Label>
                    <Input id="new-goal-group" name="name" autoFocus />
                    {createGroupErrors?.name?.[0] ? (
                      <p className="text-sm text-destructive">{createGroupErrors.name[0]}</p>
                    ) : null}
                  </div>
                  <DialogFooter>
                    <Button type="submit">{m.goal_group_create()}</Button>
                  </DialogFooter>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        ) : null}

        {groups.length > 0 ? (
          <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <GoalDropGroup
                key={group.id}
                group={group}
                goals={goals.filter((goal) => goal.groupId === group.id)}
                canManage={canManage}
                errors={errors}
                errorGoalId={errorGoalId}
                entryMode={entryMode}
                renameErrors={renameErrorGroupId === group.id ? renameGroupErrors : undefined}
              />
            ))}
          </div>
        ) : null}

        <UngroupedGoals
          goals={ungrouped}
          canManage={canManage}
          errors={errors}
          errorGoalId={errorGoalId}
          entryMode={entryMode}
        />
      </div>

      <AlertDialog
        open={Boolean(pendingMove)}
        onOpenChange={(open) => !open && setPendingMove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{m.goal_group_move_title()}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingMove
                ? m.goal_group_move_description({
                    goal: pendingMove.goal.title,
                    group: pendingMove.groupName,
                  })
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{m.learner_cancel()}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingMove) return
                fetcher.submit(
                  {
                    intent: 'moveGoal',
                    goalId: pendingMove.goal.id,
                    groupId: pendingMove.groupId ?? '',
                  },
                  { method: 'post' },
                )
                setPendingMove(null)
              }}
            >
              {m.goal_group_move_action()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DragDropProvider>
  )
}
