import { DragDropProvider, useDraggable, useDroppable } from '@dnd-kit/react'
import {
  Eye,
  Folder,
  FolderOpen,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { Form, Link, useFetcher } from 'react-router'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { useActionDialog } from '~/hooks/use-action-dialog'
import { cn } from '~/lib/utils'
import * as m from '~/paraglide/messages.js'
import { getLocale } from '~/paraglide/runtime.js'
import type { LearnerGroupWithToday, LearnerListItemWithToday } from '../types'

type PendingMove = {
  learner: LearnerListItemWithToday
  groupId: string | null
  groupName: string
}

function formatBirthDate(value: Date | null) {
  if (!value) return m.learner_date_of_birth_not_set()
  return new Intl.DateTimeFormat(getLocale(), {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(value)
}

function DraggableLearnerRow({ learner }: { learner: LearnerListItemWithToday }) {
  const { ref, handleRef, isDragging } = useDraggable({
    id: `learner:${learner.id}`,
    type: 'learner',
    data: { learner },
  })

  return (
    <TableRow ref={ref} className={cn(isDragging && 'opacity-40')}>
      <TableCell className="w-12">
        <Button
          ref={handleRef}
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={m.learner_group_drag_named({ name: learner.name })}
          className="cursor-grab touch-none active:cursor-grabbing"
        >
          <GripVertical />
        </Button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-semibold">
            {learner.avatar ? (
              <img
                src={learner.avatar}
                alt=""
                className="size-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              learner.name.charAt(0).toUpperCase()
            )}
          </div>
          <span className="font-medium">{learner.name}</span>
        </div>
      </TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">
        {formatBirthDate(learner.dateOfBirth)}
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground">
          {m.learner_today_activity_summary({
            goals: learner.goalsUpdatedToday,
            activities: learner.activitiesAddedToday,
          })}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <Button asChild variant="outline" size="sm">
          <Link to={`/track-app/learners/${learner.id}`}>
            <Eye /> {m.learner_view_details()}
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}

function LearnersTable({ learners }: { learners: LearnerListItemWithToday[] }) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" />
            <TableHead>{m.learner_name()}</TableHead>
            <TableHead className="hidden md:table-cell">{m.learner_date_of_birth()}</TableHead>
            <TableHead>{m.learner_today_activity()}</TableHead>
            <TableHead className="text-right">{m.learner_actions()}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {learners.map((learner) => (
            <DraggableLearnerRow key={learner.id} learner={learner} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function LearnerDropGroup({
  group,
  errors,
}: {
  group: LearnerGroupWithToday
  errors?: Record<string, string[] | undefined>
}) {
  const { ref, isDropTarget } = useDroppable({
    id: `learner-group:${group.id}`,
    type: 'learner-group',
    accept: 'learner',
    data: { groupId: group.id, groupName: group.name },
  })
  const renameDialog = useActionDialog({
    intent: 'renameGroup',
    errors,
    defaultOpen: Boolean(errors),
  })

  return (
    <Card
      ref={ref}
      className={cn(
        'gap-4 border-dashed py-4 transition-colors',
        isDropTarget && 'border-primary bg-primary/5',
      )}
    >
      <CardHeader className="grid-cols-[1fr_auto] px-4">
        <CardTitle className="flex min-w-0 items-center gap-2">
          <Folder className="size-4 shrink-0" />
          <span className="truncate">{group.name}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
            {group.learners.length}
          </span>
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={m.learner_group_actions()}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => renameDialog.setOpen(true)}>
              <Pencil /> {m.learner_group_rename()}
            </DropdownMenuItem>
            <DropdownMenuItem asChild variant="destructive">
              <Form method="post">
                <input type="hidden" name="intent" value="deleteGroup" />
                <input type="hidden" name="groupId" value={group.id} />
                <button type="submit" className="flex w-full items-center gap-2">
                  <Trash2 /> {m.learner_group_delete()}
                </button>
              </Form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-4">
        {group.learners.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {m.learner_group_drop_here()}
          </div>
        ) : (
          <LearnersTable learners={group.learners} />
        )}
      </CardContent>

      <Dialog open={renameDialog.open} onOpenChange={renameDialog.setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.learner_group_rename()}</DialogTitle>
            <DialogDescription>{m.learner_group_rename_description()}</DialogDescription>
          </DialogHeader>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="renameGroup" />
            <input type="hidden" name="groupId" value={group.id} />
            <div className="space-y-2">
              <Label htmlFor={`learner-group-${group.id}`}>{m.learner_group_name()}</Label>
              <Input id={`learner-group-${group.id}`} name="name" defaultValue={group.name} />
              {errors?.name?.[0] ? (
                <p className="text-sm text-destructive">{errors.name[0]}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="submit">{m.learner_group_save()}</Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function UngroupedLearners({ learners }: { learners: LearnerListItemWithToday[] }) {
  const { ref, isDropTarget } = useDroppable({
    id: 'learner-group:ungrouped',
    type: 'learner-group',
    accept: 'learner',
    data: { groupId: null, groupName: m.learner_group_ungrouped() },
  })
  return (
    <section
      ref={ref}
      className={cn(
        'rounded-xl border border-dashed p-4 transition-colors',
        isDropTarget && 'border-primary bg-primary/5',
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">{m.learner_group_ungrouped()}</h2>
          <p className="text-sm text-muted-foreground">{m.learner_group_drag_description()}</p>
        </div>
        <Button asChild>
          <Link to="/track-app/learners/new">
            <Plus /> {m.learner_add()}
          </Link>
        </Button>
      </div>
      {learners.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {m.learner_group_all_grouped()}
        </p>
      ) : (
        <LearnersTable learners={learners} />
      )}
    </section>
  )
}

export function LearnerGroupsBoard({
  groups,
  ungrouped,
  createErrors,
  renameErrors,
  renameErrorGroupId,
  isFiltering = false,
}: {
  groups: LearnerGroupWithToday[]
  ungrouped: LearnerListItemWithToday[]
  createErrors?: Record<string, string[] | undefined>
  renameErrors?: Record<string, string[] | undefined>
  renameErrorGroupId?: string
  isFiltering?: boolean
}) {
  const fetcher = useFetcher()
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null)
  const createGroupDialog = useActionDialog({
    intent: 'createGroup',
    errors: createErrors,
    defaultOpen: Boolean(createErrors),
  })

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return
        const learner = event.operation.source?.data.learner as LearnerListItemWithToday | undefined
        const target = event.operation.target?.data as
          | { groupId: string | null; groupName: string }
          | undefined
        if (!learner || !target || learner.groupId === target.groupId) return
        setPendingMove({ learner, groupId: target.groupId, groupName: target.groupName })
      }}
    >
      <div className="space-y-8">
        <section className={cn('space-y-4', isFiltering && groups.length === 0 && 'hidden')}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{m.learner_groups_title()}</h2>
              <p className="text-sm text-muted-foreground">{m.learner_groups_description()}</p>
            </div>
            <Dialog open={createGroupDialog.open} onOpenChange={createGroupDialog.setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus /> {m.learner_group_add()}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{m.learner_group_add()}</DialogTitle>
                  <DialogDescription>{m.learner_group_add_description()}</DialogDescription>
                </DialogHeader>
                <Form method="post" className="space-y-4">
                  <input type="hidden" name="intent" value="createGroup" />
                  <div className="space-y-2">
                    <Label htmlFor="learner-group-name">{m.learner_group_name()}</Label>
                    <Input id="learner-group-name" name="name" autoFocus />
                    {createErrors?.name?.[0] ? (
                      <p className="text-sm text-destructive">{createErrors.name[0]}</p>
                    ) : null}
                  </div>
                  <DialogFooter>
                    <Button type="submit">{m.learner_group_create()}</Button>
                  </DialogFooter>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {groups.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <FolderOpen className="mx-auto mb-3 size-7 text-muted-foreground" />
              <p className="font-medium">{m.learner_groups_empty()}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {m.learner_groups_empty_description()}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <LearnerDropGroup
                  key={group.id}
                  group={group}
                  errors={renameErrorGroupId === group.id ? renameErrors : undefined}
                />
              ))}
            </div>
          )}
        </section>

        {isFiltering && ungrouped.length === 0 ? null : <UngroupedLearners learners={ungrouped} />}
      </div>

      <AlertDialog
        open={Boolean(pendingMove)}
        onOpenChange={(open) => !open && setPendingMove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{m.learner_group_move_title()}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingMove
                ? m.learner_group_move_description({
                    learner: pendingMove.learner.name,
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
                    intent: 'moveLearner',
                    learnerId: pendingMove.learner.id,
                    groupId: pendingMove.groupId ?? '',
                  },
                  { method: 'post' },
                )
                setPendingMove(null)
              }}
            >
              {m.learner_group_move_action()}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DragDropProvider>
  )
}
