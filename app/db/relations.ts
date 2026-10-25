import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

export const databaseRelations = defineRelations(schema, (r) => ({
  users: {
    userRole: r.one.userRoles({
      from: r.users.id,
      to: r.userRoles.userId,
      optional: true,
    }),
    learnerMembers: r.many.learnerMembers({ from: r.users.id, to: r.learnerMembers.userId }),
    learnerGroups: r.many.learnerGroups({ from: r.users.id, to: r.learnerGroups.ownerUserId }),
    createdGoalGroups: r.many.goalGroups({
      from: r.users.id,
      to: r.goalGroups.createdByUserId,
    }),
    auditLogs: r.many.auditLogs({ from: r.users.id, to: r.auditLogs.actorId }),
    learningTemplates: r.many.learningTemplates({
      from: r.users.id,
      to: r.learningTemplates.ownerUserId,
    }),
    learningRecords: r.many.learningRecords({
      from: r.users.id,
      to: r.learningRecords.recordedByUserId,
    }),
    createdDailySchedules: r.many.dailySchedules({
      from: r.users.id,
      to: r.dailySchedules.createdByUserId,
    }),
    createdScheduleTodos: r.many.scheduleTodos({
      from: r.users.id,
      to: r.scheduleTodos.createdByUserId,
    }),
  },
  auditLogs: {
    actor: r.one.users({
      from: r.auditLogs.actorId,
      to: r.users.id,
      optional: false,
    }),
    templateUsage: r.one.auditLogTemplates({
      from: r.auditLogs.id,
      to: r.auditLogTemplates.auditLogId,
      optional: true,
    }),
  },
  userRoles: {
    user: r.one.users({ from: r.userRoles.userId, to: r.users.id, optional: false }),
    role: r.one.roles({ from: r.userRoles.roleId, to: r.roles.id, optional: false }),
  },
  roles: {
    rolePermissions: r.many.rolePermissions({ from: r.roles.id, to: r.rolePermissions.roleId }),
    userRoles: r.many.userRoles({ from: r.roles.id, to: r.userRoles.roleId }),
  },
  rolePermissions: {
    role: r.one.roles({ from: r.rolePermissions.roleId, to: r.roles.id, optional: false }),
    permission: r.one.permissions({
      from: r.rolePermissions.permissionId,
      to: r.permissions.id,
      optional: false,
    }),
  },
  permissions: {
    rolePermissions: r.many.rolePermissions({
      from: r.permissions.id,
      to: r.rolePermissions.permissionId,
    }),
  },
  posts: {
    category: r.one.categories({ from: r.posts.categoryId, to: r.categories.id, optional: false }),
  },
  categories: {
    posts: r.many.posts({ from: r.categories.id, to: r.posts.categoryId }),
  },
  learners: {
    members: r.many.learnerMembers({ from: r.learners.id, to: r.learnerMembers.learnerId }),
    goals: r.many.goals({ from: r.learners.id, to: r.goals.learnerId }),
    goalGroups: r.many.goalGroups({ from: r.learners.id, to: r.goalGroups.learnerId }),
    activityTracks: r.many.activityTracks({
      from: r.learners.id,
      to: r.activityTracks.learnerId,
    }),
    learningRecords: r.many.learningRecords({
      from: r.learners.id,
      to: r.learningRecords.learnerId,
    }),
    templateUsageLogs: r.many.auditLogTemplates({
      from: r.learners.id,
      to: r.auditLogTemplates.learnerId,
    }),
    dailySchedule: r.one.dailySchedules({
      from: r.learners.id,
      to: r.dailySchedules.learnerId,
      optional: true,
    }),
    scheduleTodos: r.many.scheduleTodos({
      from: r.learners.id,
      to: r.scheduleTodos.learnerId,
    }),
  },
  learningTemplates: {
    owner: r.one.users({
      from: r.learningTemplates.ownerUserId,
      to: r.users.id,
      optional: false,
    }),
    goals: r.many.learningTemplateGoals({
      from: r.learningTemplates.id,
      to: r.learningTemplateGoals.templateId,
    }),
    usageLogs: r.many.auditLogTemplates({
      from: r.learningTemplates.id,
      to: r.auditLogTemplates.templateId,
    }),
    appliedGoalGroups: r.many.goalGroups({
      from: r.learningTemplates.id,
      to: r.goalGroups.sourceTemplateId,
    }),
  },
  learningTemplateGoals: {
    template: r.one.learningTemplates({
      from: r.learningTemplateGoals.templateId,
      to: r.learningTemplates.id,
      optional: false,
    }),
  },
  auditLogTemplates: {
    auditLog: r.one.auditLogs({
      from: r.auditLogTemplates.auditLogId,
      to: r.auditLogs.id,
      optional: false,
    }),
    template: r.one.learningTemplates({
      from: r.auditLogTemplates.templateId,
      to: r.learningTemplates.id,
      optional: false,
    }),
    learner: r.one.learners({
      from: r.auditLogTemplates.learnerId,
      to: r.learners.id,
      optional: true,
    }),
    goalGroup: r.one.goalGroups({
      from: r.auditLogTemplates.goalGroupId,
      to: r.goalGroups.id,
      optional: true,
    }),
  },
  learnerGroups: {
    owner: r.one.users({
      from: r.learnerGroups.ownerUserId,
      to: r.users.id,
      optional: false,
    }),
    members: r.many.learnerMembers({
      from: r.learnerGroups.id,
      to: r.learnerMembers.groupId,
    }),
  },
  goalGroups: {
    learner: r.one.learners({
      from: r.goalGroups.learnerId,
      to: r.learners.id,
      optional: false,
    }),
    sourceTemplate: r.one.learningTemplates({
      from: r.goalGroups.sourceTemplateId,
      to: r.learningTemplates.id,
      optional: true,
    }),
    createdBy: r.one.users({
      from: r.goalGroups.createdByUserId,
      to: r.users.id,
      optional: false,
    }),
    goals: r.many.goals({ from: r.goalGroups.id, to: r.goals.groupId }),
    templateUsage: r.one.auditLogTemplates({
      from: r.goalGroups.id,
      to: r.auditLogTemplates.goalGroupId,
      optional: true,
    }),
  },
  goals: {
    learner: r.one.learners({
      from: r.goals.learnerId,
      to: r.learners.id,
      optional: false,
    }),
    group: r.one.goalGroups({
      from: r.goals.groupId,
      to: r.goalGroups.id,
      optional: true,
    }),
    records: r.many.learningRecords({
      from: r.goals.id,
      to: r.learningRecords.goalId,
    }),
    scheduleItems: r.many.scheduleItems({
      from: r.goals.id,
      to: r.scheduleItems.goalId,
    }),
    scheduleTodos: r.many.scheduleTodos({
      from: r.goals.id,
      to: r.scheduleTodos.goalId,
    }),
  },
  activityTracks: {
    learner: r.one.learners({
      from: r.activityTracks.learnerId,
      to: r.learners.id,
      optional: false,
    }),
    records: r.many.learningRecords({
      from: r.activityTracks.id,
      to: r.learningRecords.trackId,
    }),
    scheduleItems: r.many.scheduleItems({
      from: r.activityTracks.id,
      to: r.scheduleItems.trackId,
    }),
    scheduleTodos: r.many.scheduleTodos({
      from: r.activityTracks.id,
      to: r.scheduleTodos.trackId,
    }),
  },
  learningRecords: {
    learner: r.one.learners({
      from: r.learningRecords.learnerId,
      to: r.learners.id,
      optional: false,
    }),
    goal: r.one.goals({
      from: r.learningRecords.goalId,
      to: r.goals.id,
      optional: true,
    }),
    track: r.one.activityTracks({
      from: r.learningRecords.trackId,
      to: r.activityTracks.id,
      optional: true,
    }),
    recordedBy: r.one.users({
      from: r.learningRecords.recordedByUserId,
      to: r.users.id,
      optional: false,
    }),
    scheduleTodo: r.one.scheduleTodos({
      from: r.learningRecords.scheduleTodoId,
      to: r.scheduleTodos.id,
      optional: true,
    }),
  },
  dailySchedules: {
    learner: r.one.learners({
      from: r.dailySchedules.learnerId,
      to: r.learners.id,
      optional: false,
    }),
    createdBy: r.one.users({
      from: r.dailySchedules.createdByUserId,
      to: r.users.id,
      optional: false,
    }),
    items: r.many.scheduleItems({
      from: r.dailySchedules.id,
      to: r.scheduleItems.scheduleId,
    }),
    todos: r.many.scheduleTodos({
      from: r.dailySchedules.id,
      to: r.scheduleTodos.scheduleId,
    }),
  },
  scheduleItems: {
    schedule: r.one.dailySchedules({
      from: r.scheduleItems.scheduleId,
      to: r.dailySchedules.id,
      optional: false,
    }),
    goal: r.one.goals({
      from: r.scheduleItems.goalId,
      to: r.goals.id,
      optional: true,
    }),
    track: r.one.activityTracks({
      from: r.scheduleItems.trackId,
      to: r.activityTracks.id,
      optional: true,
    }),
    todos: r.many.scheduleTodos({
      from: r.scheduleItems.id,
      to: r.scheduleTodos.scheduleItemId,
    }),
  },
  scheduleTodos: {
    schedule: r.one.dailySchedules({
      from: r.scheduleTodos.scheduleId,
      to: r.dailySchedules.id,
      optional: false,
    }),
    scheduleItem: r.one.scheduleItems({
      from: r.scheduleTodos.scheduleItemId,
      to: r.scheduleItems.id,
      optional: true,
    }),
    learner: r.one.learners({
      from: r.scheduleTodos.learnerId,
      to: r.learners.id,
      optional: false,
    }),
    goal: r.one.goals({
      from: r.scheduleTodos.goalId,
      to: r.goals.id,
      optional: true,
    }),
    track: r.one.activityTracks({
      from: r.scheduleTodos.trackId,
      to: r.activityTracks.id,
      optional: true,
    }),
    createdBy: r.one.users({
      from: r.scheduleTodos.createdByUserId,
      to: r.users.id,
      optional: false,
    }),
    records: r.many.learningRecords({
      from: r.scheduleTodos.id,
      to: r.learningRecords.scheduleTodoId,
    }),
  },
  learnerMembers: {
    learner: r.one.learners({
      from: r.learnerMembers.learnerId,
      to: r.learners.id,
      optional: false,
    }),
    user: r.one.users({ from: r.learnerMembers.userId, to: r.users.id, optional: false }),
    group: r.one.learnerGroups({
      from: r.learnerMembers.groupId,
      to: r.learnerGroups.id,
      optional: true,
    }),
  },
}))
