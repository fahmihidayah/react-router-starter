import { randomUUID } from 'node:crypto'
import type { TGoal, TInsertScheduleItem, TScheduleItem } from '~/db/schema'
import * as activityQueries from '~/features/activities/queries'
import * as goalQueries from '~/features/goals/queries'
import * as learnerQueries from '~/features/learners/queries'
import * as scheduleQueries from '../queries'
import type { TAddScheduleTodo, TSaveSchedulePlan } from '../schemas/form'
import type { SchedulePlanInputItem, ScheduleRange, ScheduleSourceType } from '../types'
import { enumerateDates } from '../utils/date-range'

type ResolvedSource = {
  goalId: string | null
  sourceType: ScheduleSourceType
  title: string
  trackId: string | null
}

export type SavePlanResult = 'duplicate-source' | 'forbidden' | 'invalid-source' | 'saved'
export type AddTodoResult = 'duplicate-source' | 'forbidden' | 'invalid-source' | 'saved'
export type TodoMutationResult = 'forbidden' | 'has-records' | 'not-found' | 'past' | 'saved'

function goalDateKey(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function sourceKey(item: SchedulePlanInputItem): string {
  return `${item.sourceType}:${item.sourceId}`
}

function hasDuplicateSources(items: SchedulePlanInputItem[]): boolean {
  return new Set(items.map(sourceKey)).size !== items.length
}

function isGoalAvailable(goal: TGoal, date: string): boolean {
  return goalDateKey(goal.startDate) <= date && goalDateKey(goal.endDate) >= date
}

function resolveSources(
  items: SchedulePlanInputItem[],
  goals: TGoal[],
  tracks: Awaited<ReturnType<typeof activityQueries.findAllTracksByLearnerId>>,
): (ResolvedSource | undefined)[] {
  const goalsById = new Map(goals.map((goal) => [goal.id, goal]))
  const tracksById = new Map(tracks.map((track) => [track.id, track]))

  return items.map((item) => {
    if (item.sourceType === 'goal') {
      const goal = goalsById.get(item.sourceId)
      return goal
        ? { sourceType: item.sourceType, goalId: goal.id, trackId: null, title: goal.title }
        : undefined
    }
    const track = tracksById.get(item.sourceId)
    return track && !track.archivedAt
      ? { sourceType: item.sourceType, goalId: null, trackId: track.id, title: track.name }
      : undefined
  })
}

async function sourcesForLearner(learnerId: string) {
  return Promise.all([
    goalQueries.findByLearnerId(learnerId),
    activityQueries.findAllTracksByLearnerId(learnerId),
  ])
}

function insertItems(
  scheduleId: string,
  inputs: SchedulePlanInputItem[],
  resolved: ResolvedSource[],
): TInsertScheduleItem[] {
  const now = new Date()
  return inputs.map((input, position) => ({
    id: randomUUID(),
    scheduleId,
    sourceType: resolved[position].sourceType,
    goalId: resolved[position].goalId,
    trackId: resolved[position].trackId,
    titleSnapshot: resolved[position].title,
    plannedDurationMinutes: input.plannedDurationMinutes,
    position,
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  }))
}

function isItemAvailableOnDate(
  item: TScheduleItem,
  date: string,
  goalsById: Map<string, TGoal>,
  activeTrackIds: Set<string>,
): boolean {
  if (item.sourceType === 'goal') {
    if (!item.goalId) return false
    const goal = goalsById.get(item.goalId)
    return Boolean(goal && goalDateKey(goal.startDate) <= date && goalDateKey(goal.endDate) >= date)
  }
  return Boolean(item.trackId && activeTrackIds.has(item.trackId))
}

async function ensureOccurrences(
  schedule: NonNullable<ScheduleRange['schedule']>,
  items: TScheduleItem[],
  existingTodos: Awaited<ReturnType<typeof scheduleQueries.findTodosInRange>>,
  start: string,
  end: string,
): Promise<void> {
  if (schedule.pausedAt || items.length === 0) return
  const [goals, tracks] = await sourcesForLearner(schedule.learnerId)
  const goalsById = new Map(goals.map((goal) => [goal.id, goal]))
  const activeTrackIds = new Set(
    tracks.filter((track) => !track.archivedAt).map((track) => track.id),
  )
  const dates = enumerateDates(start < schedule.startsOn ? schedule.startsOn : start, end)
  const existingSources = new Set(
    existingTodos
      .filter((todo) => !todo.cancelledAt)
      .map((todo) =>
        todo.sourceType === 'goal'
          ? `${todo.scheduledDate}:goal:${todo.goalId}`
          : `${todo.scheduledDate}:activity_track:${todo.trackId}`,
      ),
  )
  const now = new Date()
  const todos = dates.flatMap((date) =>
    items
      .filter((item) => isItemAvailableOnDate(item, date, goalsById, activeTrackIds))
      .filter((item) => {
        const sourceId = item.sourceType === 'goal' ? item.goalId : item.trackId
        return !existingSources.has(`${date}:${item.sourceType}:${sourceId}`)
      })
      .map((item) => ({
        id: randomUUID(),
        scheduleId: schedule.id,
        scheduleItemId: item.id,
        learnerId: schedule.learnerId,
        scheduledDate: date,
        sourceType: item.sourceType,
        goalId: item.goalId,
        trackId: item.trackId,
        titleSnapshot: item.titleSnapshot,
        plannedDurationMinutes: item.plannedDurationMinutes,
        position: item.position,
        cancelledAt: null,
        cancellationReason: null,
        createdByUserId: schedule.createdByUserId,
        createdAt: now,
        updatedAt: now,
      })),
  )
  await scheduleQueries.createTodos(todos)
}

export async function findRangeForUser(
  learnerId: string,
  userId: string,
  start: string,
  end: string,
): Promise<ScheduleRange | undefined> {
  if (!(await learnerQueries.findByIdForUser(learnerId, userId))) return undefined
  const schedule = await scheduleQueries.findScheduleByLearnerId(learnerId)
  if (!schedule) return { schedule: undefined, planItems: [], todos: [] }
  const planItems = await scheduleQueries.findActiveItemsByScheduleId(schedule.id)
  const existingTodos = await scheduleQueries.findTodosInRange(learnerId, start, end)
  await ensureOccurrences(schedule, planItems, existingTodos, start, end)
  const rawTodos = await scheduleQueries.findTodosInRange(learnerId, start, end)
  const activeTodos = rawTodos.filter((todo) => !todo.cancelledAt)
  const records = await scheduleQueries.findRecordsByTodoIds(activeTodos.map((todo) => todo.id))
  const recordsByTodo = new Map<string, typeof records>()
  for (const record of records) {
    if (!record.scheduleTodoId) continue
    const current = recordsByTodo.get(record.scheduleTodoId) ?? []
    current.push(record)
    recordsByTodo.set(record.scheduleTodoId, current)
  }
  return {
    schedule,
    planItems,
    todos: activeTodos.map((todo) => {
      const todoRecords = recordsByTodo.get(todo.id) ?? []
      return {
        ...todo,
        completed: todoRecords.length > 0,
        actualDurationMinutes: todoRecords.reduce(
          (total, record) => total + (record.durationMinutes ?? 0),
          0,
        ),
        records: todoRecords.map(({ id, durationMinutes }) => ({ id, durationMinutes })),
      }
    }),
  }
}

export async function savePlanForLearner(
  learnerId: string,
  userId: string,
  data: TSaveSchedulePlan,
): Promise<SavePlanResult> {
  if (!(await learnerQueries.canContribute(learnerId, userId))) return 'forbidden'
  if (hasDuplicateSources(data.items)) return 'duplicate-source'
  const [goals, tracks] = await sourcesForLearner(learnerId)
  const unavailableGoal = data.items.some((item) => {
    if (item.sourceType !== 'goal') return false
    const goal = goals.find((candidate) => candidate.id === item.sourceId)
    return !goal || !isGoalAvailable(goal, data.startsOn)
  })
  if (unavailableGoal) return 'invalid-source'
  const resolved = resolveSources(data.items, goals, tracks)
  if (resolved.some((source) => !source)) return 'invalid-source'
  const existing = await scheduleQueries.findScheduleByLearnerId(learnerId)
  const scheduleId = existing?.id ?? randomUUID()
  const items = insertItems(scheduleId, data.items, resolved as ResolvedSource[])
  if (existing) {
    await scheduleQueries.replaceScheduleItems(existing.id, data.startsOn, data.timezone, items)
  } else {
    const now = new Date()
    await scheduleQueries.createScheduleWithItems(
      {
        id: scheduleId,
        learnerId,
        startsOn: data.startsOn,
        timezone: data.timezone,
        pausedAt: null,
        createdByUserId: userId,
        createdAt: now,
        updatedAt: now,
      },
      items,
    )
  }
  return 'saved'
}

export async function addTodoForLearner(
  learnerId: string,
  userId: string,
  data: TAddScheduleTodo,
): Promise<AddTodoResult> {
  if (!(await learnerQueries.canContribute(learnerId, userId))) return 'forbidden'
  const [goals, tracks] = await sourcesForLearner(learnerId)
  if (data.sourceType === 'goal') {
    const goal = goals.find((candidate) => candidate.id === data.sourceId)
    if (!goal || !isGoalAvailable(goal, data.scheduledDate)) return 'invalid-source'
  }
  const resolved = resolveSources([data], goals, tracks)?.[0]
  if (!resolved) return 'invalid-source'
  let schedule = await scheduleQueries.findScheduleByLearnerId(learnerId)
  if (!schedule) {
    const now = new Date()
    schedule = await scheduleQueries.createScheduleWithItems(
      {
        id: randomUUID(),
        learnerId,
        startsOn: data.scheduledDate,
        timezone: 'Asia/Jakarta',
        pausedAt: null,
        createdByUserId: userId,
        createdAt: now,
        updatedAt: now,
      },
      [],
    )
  }
  const dayTodos = (
    await scheduleQueries.findTodosInRange(learnerId, data.scheduledDate, data.scheduledDate)
  ).filter((todo) => !todo.cancelledAt)
  const duplicate = dayTodos.some((todo) =>
    data.sourceType === 'goal' ? todo.goalId === data.sourceId : todo.trackId === data.sourceId,
  )
  if (duplicate) return 'duplicate-source'
  const now = new Date()
  await scheduleQueries.createTodo({
    id: randomUUID(),
    scheduleId: schedule.id,
    scheduleItemId: null,
    learnerId,
    scheduledDate: data.scheduledDate,
    sourceType: resolved.sourceType,
    goalId: resolved.goalId,
    trackId: resolved.trackId,
    titleSnapshot: resolved.title,
    plannedDurationMinutes: data.plannedDurationMinutes,
    position: Math.max(-1, ...dayTodos.map((todo) => todo.position)) + 1,
    cancelledAt: null,
    cancellationReason: null,
    createdByUserId: userId,
    createdAt: now,
    updatedAt: now,
  })
  return 'saved'
}

export async function removeTodoForLearner(
  learnerId: string,
  userId: string,
  todoId: string,
  today: string,
): Promise<TodoMutationResult> {
  if (!(await learnerQueries.canContribute(learnerId, userId))) return 'forbidden'
  const todo = await scheduleQueries.findTodoById(todoId, learnerId)
  if (!todo || todo.cancelledAt) return 'not-found'
  if (todo.scheduledDate < today) return 'past'
  if ((await scheduleQueries.findRecordsByTodoIds([todo.id])).length > 0) return 'has-records'
  await scheduleQueries.cancelTodos([todo.id], 'removed')
  return 'saved'
}

export async function clearDayForLearner(
  learnerId: string,
  userId: string,
  scheduledDate: string,
  today: string,
): Promise<TodoMutationResult> {
  if (!(await learnerQueries.canContribute(learnerId, userId))) return 'forbidden'
  if (scheduledDate < today) return 'past'
  const todos = (
    await scheduleQueries.findTodosInRange(learnerId, scheduledDate, scheduledDate)
  ).filter((todo) => !todo.cancelledAt)
  const records = await scheduleQueries.findRecordsByTodoIds(todos.map((todo) => todo.id))
  const completedIds = new Set(
    records.flatMap((record) => (record.scheduleTodoId ? [record.scheduleTodoId] : [])),
  )
  await scheduleQueries.cancelTodos(
    todos.filter((todo) => !completedIds.has(todo.id)).map((todo) => todo.id),
    'day_cleared',
  )
  return 'saved'
}

export async function moveTodoForLearner(
  learnerId: string,
  userId: string,
  todoId: string,
  direction: 'down' | 'up',
  today: string,
): Promise<TodoMutationResult> {
  if (!(await learnerQueries.canContribute(learnerId, userId))) return 'forbidden'
  const todo = await scheduleQueries.findTodoById(todoId, learnerId)
  if (!todo || todo.cancelledAt) return 'not-found'
  if (todo.scheduledDate < today) return 'past'
  const todos = (
    await scheduleQueries.findTodosInRange(learnerId, todo.scheduledDate, todo.scheduledDate)
  ).filter((item) => !item.cancelledAt)
  const index = todos.findIndex((item) => item.id === todo.id)
  const otherIndex = direction === 'up' ? index - 1 : index + 1
  if (index < 0 || otherIndex < 0 || otherIndex >= todos.length) return 'saved'
  await scheduleQueries.updateTodoPositions([
    { id: todos[index].id, position: todos[otherIndex].position },
    { id: todos[otherIndex].id, position: todos[index].position },
  ])
  return 'saved'
}

export async function findMatchingTodoId({
  learnerId,
  scheduledDate,
  goalId,
  trackId,
  preferredTodoId,
}: {
  learnerId: string
  scheduledDate: string
  goalId?: string
  trackId?: string
  preferredTodoId?: string
}): Promise<string | null> {
  const todo = await scheduleQueries.findMatchingTodo({
    learnerId,
    scheduledDate,
    goalId,
    trackId,
    preferredTodoId,
  })
  return todo?.id ?? null
}
