CREATE TABLE "activity_tracks" (
	"id" text PRIMARY KEY,
	"learnerId" text NOT NULL,
	"name" text NOT NULL,
	"archivedAt" timestamp with time zone,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_records" (
	"id" text PRIMARY KEY,
	"learnerId" text NOT NULL,
	"goalId" text,
	"trackId" text,
	"scheduleTodoId" text,
	"recordedByUserId" text NOT NULL,
	"activityDate" timestamp with time zone NOT NULL,
	"title" text NOT NULL,
	"durationMinutes" integer,
	"value" integer,
	"unit" text,
	"note" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	CONSTRAINT "learning_records_measurement_pair_check" CHECK (("value" IS NULL AND "unit" IS NULL) OR ("value" IS NOT NULL AND "unit" IS NOT NULL)),
	CONSTRAINT "learning_records_positive_value_check" CHECK ("value" IS NULL OR "value" > 0),
	CONSTRAINT "learning_records_positive_duration_check" CHECK ("durationMinutes" IS NULL OR "durationMinutes" > 0),
	CONSTRAINT "learning_records_single_context_check" CHECK (NOT ("goalId" IS NOT NULL AND "trackId" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY,
	"actor_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goal_groups" (
	"id" text PRIMARY KEY,
	"learnerId" text NOT NULL,
	"name" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"sourceTemplateId" text,
	"sourceTemplateTitle" text,
	"createdByUserId" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_goals" (
	"id" text PRIMARY KEY,
	"learnerId" text NOT NULL,
	"groupId" text,
	"title" text NOT NULL,
	"description" text,
	"targetValue" integer DEFAULT 1 NOT NULL,
	"unit" text DEFAULT 'times' NOT NULL,
	"startDate" timestamp with time zone NOT NULL,
	"endDate" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_groups" (
	"id" text PRIMARY KEY,
	"ownerUserId" text NOT NULL,
	"name" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	CONSTRAINT "learner_groups_owner_name_unique" UNIQUE("ownerUserId","name")
);
--> statement-breakpoint
CREATE TABLE "learner_members" (
	"id" text PRIMARY KEY,
	"learnerId" text NOT NULL,
	"userId" text NOT NULL,
	"groupId" text,
	"role" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	CONSTRAINT "learner_members_learnerId_userId_unique" UNIQUE("learnerId","userId")
);
--> statement-breakpoint
CREATE TABLE "learners" (
	"id" text PRIMARY KEY,
	"avatar" text,
	"name" text NOT NULL,
	"dateOfBirth" timestamp with time zone,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log_template" (
	"audit_log_id" text PRIMARY KEY,
	"template_id" text NOT NULL,
	"learner_id" text,
	"goal_group_id" text,
	"created_goal_ids" jsonb NOT NULL,
	"applied_start_date" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_template_goals" (
	"id" text PRIMARY KEY,
	"templateId" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"targetValue" integer DEFAULT 1 NOT NULL,
	"unit" text DEFAULT 'times' NOT NULL,
	"durationDays" integer DEFAULT 1 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_templates" (
	"id" text PRIMARY KEY,
	"ownerUserId" text NOT NULL,
	"title" text NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"archivedAt" timestamp with time zone,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY,
	"url" text NOT NULL,
	"alt" text,
	"filename" text NOT NULL,
	"originalFilename" text,
	"storageProvider" text,
	"storageKey" text,
	"mimeType" text,
	"size" integer,
	"width" integer,
	"height" integer,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" text PRIMARY KEY,
	"key" text NOT NULL UNIQUE,
	"resource" text NOT NULL,
	"action" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" text PRIMARY KEY,
	"slug" text NOT NULL UNIQUE,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"categoryId" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"roleId" text,
	"permissionId" text,
	CONSTRAINT "role_permissions_pkey" PRIMARY KEY("roleId","permissionId")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY,
	"key" text NOT NULL UNIQUE,
	"name" text NOT NULL UNIQUE,
	"description" text,
	"isSystem" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_schedules" (
	"id" text PRIMARY KEY,
	"learnerId" text NOT NULL,
	"startsOn" text NOT NULL,
	"timezone" text DEFAULT 'Asia/Jakarta' NOT NULL,
	"pausedAt" timestamp with time zone,
	"createdByUserId" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_items" (
	"id" text PRIMARY KEY,
	"scheduleId" text NOT NULL,
	"sourceType" text NOT NULL,
	"goalId" text,
	"trackId" text,
	"titleSnapshot" text NOT NULL,
	"plannedDurationMinutes" integer NOT NULL,
	"position" integer NOT NULL,
	"archivedAt" timestamp with time zone,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	CONSTRAINT "schedule_items_positive_duration_check" CHECK ("plannedDurationMinutes" > 0),
	CONSTRAINT "schedule_items_position_check" CHECK ("position" >= 0),
	CONSTRAINT "schedule_items_single_source_check" CHECK (NOT ("goalId" IS NOT NULL AND "trackId" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "schedule_todos" (
	"id" text PRIMARY KEY,
	"scheduleId" text NOT NULL,
	"scheduleItemId" text,
	"learnerId" text NOT NULL,
	"scheduledDate" text NOT NULL,
	"sourceType" text NOT NULL,
	"goalId" text,
	"trackId" text,
	"titleSnapshot" text NOT NULL,
	"plannedDurationMinutes" integer NOT NULL,
	"position" integer NOT NULL,
	"cancelledAt" timestamp with time zone,
	"cancellationReason" text,
	"createdByUserId" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	CONSTRAINT "schedule_todos_positive_duration_check" CHECK ("plannedDurationMinutes" > 0),
	CONSTRAINT "schedule_todos_position_check" CHECK ("position" >= 0),
	CONSTRAINT "schedule_todos_single_source_check" CHECK (NOT ("goalId" IS NOT NULL AND "trackId" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"color" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"userId" text PRIMARY KEY,
	"roleId" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY,
	"expiresAt" timestamp with time zone NOT NULL,
	"token" text NOT NULL UNIQUE,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"impersonatedBy" text,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"role" text DEFAULT 'user',
	"banned" boolean DEFAULT false,
	"banReason" text,
	"banExpires" timestamp with time zone,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "activity_tracks_learner_id_idx" ON "activity_tracks" ("learnerId");--> statement-breakpoint
CREATE INDEX "learning_records_learner_date_idx" ON "learning_records" ("learnerId","activityDate");--> statement-breakpoint
CREATE INDEX "learning_records_goal_id_idx" ON "learning_records" ("goalId");--> statement-breakpoint
CREATE INDEX "learning_records_track_id_idx" ON "learning_records" ("trackId");--> statement-breakpoint
CREATE INDEX "learning_records_schedule_todo_id_idx" ON "learning_records" ("scheduleTodoId");--> statement-breakpoint
CREATE INDEX "audit_log_actor_id_idx" ON "audit_log" ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" ("created_at");--> statement-breakpoint
CREATE INDEX "goal_groups_learner_id_idx" ON "goal_groups" ("learnerId");--> statement-breakpoint
CREATE INDEX "goal_groups_source_template_id_idx" ON "goal_groups" ("sourceTemplateId");--> statement-breakpoint
CREATE INDEX "learner_goals_learner_id_idx" ON "learner_goals" ("learnerId");--> statement-breakpoint
CREATE INDEX "learner_goals_group_id_idx" ON "learner_goals" ("groupId");--> statement-breakpoint
CREATE INDEX "learner_groups_owner_user_id_idx" ON "learner_groups" ("ownerUserId");--> statement-breakpoint
CREATE INDEX "learner_members_user_id_idx" ON "learner_members" ("userId");--> statement-breakpoint
CREATE INDEX "learner_members_group_id_idx" ON "learner_members" ("groupId");--> statement-breakpoint
CREATE INDEX "learning_template_goals_template_id_idx" ON "learning_template_goals" ("templateId");--> statement-breakpoint
CREATE INDEX "learning_templates_owner_user_id_idx" ON "learning_templates" ("ownerUserId");--> statement-breakpoint
CREATE INDEX "learning_templates_visibility_idx" ON "learning_templates" ("visibility");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_resource_action_idx" ON "permissions" ("resource","action");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_schedules_learner_id_unique" ON "daily_schedules" ("learnerId");--> statement-breakpoint
CREATE INDEX "daily_schedules_creator_id_idx" ON "daily_schedules" ("createdByUserId");--> statement-breakpoint
CREATE INDEX "schedule_items_schedule_position_idx" ON "schedule_items" ("scheduleId","position");--> statement-breakpoint
CREATE INDEX "schedule_items_goal_id_idx" ON "schedule_items" ("goalId");--> statement-breakpoint
CREATE INDEX "schedule_items_track_id_idx" ON "schedule_items" ("trackId");--> statement-breakpoint
CREATE UNIQUE INDEX "schedule_todos_item_date_unique" ON "schedule_todos" ("scheduleItemId","scheduledDate");--> statement-breakpoint
CREATE UNIQUE INDEX "schedule_todos_active_goal_date_unique" ON "schedule_todos" ("learnerId","scheduledDate","goalId") WHERE "goalId" IS NOT NULL AND "cancelledAt" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "schedule_todos_active_track_date_unique" ON "schedule_todos" ("learnerId","scheduledDate","trackId") WHERE "trackId" IS NOT NULL AND "cancelledAt" IS NULL;--> statement-breakpoint
CREATE INDEX "schedule_todos_learner_date_position_idx" ON "schedule_todos" ("learnerId","scheduledDate","position");--> statement-breakpoint
CREATE INDEX "schedule_todos_goal_id_idx" ON "schedule_todos" ("goalId");--> statement-breakpoint
CREATE INDEX "schedule_todos_track_id_idx" ON "schedule_todos" ("trackId");--> statement-breakpoint
CREATE INDEX "user_roles_role_id_idx" ON "user_roles" ("roleId");--> statement-breakpoint
ALTER TABLE "activity_tracks" ADD CONSTRAINT "activity_tracks_learnerId_learners_id_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "learning_records" ADD CONSTRAINT "learning_records_learnerId_learners_id_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "learning_records" ADD CONSTRAINT "learning_records_goalId_learner_goals_id_fkey" FOREIGN KEY ("goalId") REFERENCES "learner_goals"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "learning_records" ADD CONSTRAINT "learning_records_trackId_activity_tracks_id_fkey" FOREIGN KEY ("trackId") REFERENCES "activity_tracks"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "learning_records" ADD CONSTRAINT "learning_records_scheduleTodoId_schedule_todos_id_fkey" FOREIGN KEY ("scheduleTodoId") REFERENCES "schedule_todos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "learning_records" ADD CONSTRAINT "learning_records_recordedByUserId_users_id_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "goal_groups" ADD CONSTRAINT "goal_groups_learnerId_learners_id_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "goal_groups" ADD CONSTRAINT "goal_groups_sourceTemplateId_learning_templates_id_fkey" FOREIGN KEY ("sourceTemplateId") REFERENCES "learning_templates"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "goal_groups" ADD CONSTRAINT "goal_groups_createdByUserId_users_id_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "learner_goals" ADD CONSTRAINT "learner_goals_learnerId_learners_id_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "learner_goals" ADD CONSTRAINT "learner_goals_groupId_goal_groups_id_fkey" FOREIGN KEY ("groupId") REFERENCES "goal_groups"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "learner_groups" ADD CONSTRAINT "learner_groups_ownerUserId_users_id_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "learner_members" ADD CONSTRAINT "learner_members_learnerId_learners_id_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "learner_members" ADD CONSTRAINT "learner_members_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "learner_members" ADD CONSTRAINT "learner_members_groupId_learner_groups_id_fkey" FOREIGN KEY ("groupId") REFERENCES "learner_groups"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "audit_log_template" ADD CONSTRAINT "audit_log_template_audit_log_id_audit_log_id_fkey" FOREIGN KEY ("audit_log_id") REFERENCES "audit_log"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "audit_log_template" ADD CONSTRAINT "audit_log_template_template_id_learning_templates_id_fkey" FOREIGN KEY ("template_id") REFERENCES "learning_templates"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "audit_log_template" ADD CONSTRAINT "audit_log_template_learner_id_learners_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "learners"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "audit_log_template" ADD CONSTRAINT "audit_log_template_goal_group_id_goal_groups_id_fkey" FOREIGN KEY ("goal_group_id") REFERENCES "goal_groups"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "learning_template_goals" ADD CONSTRAINT "learning_template_goals_templateId_learning_templates_id_fkey" FOREIGN KEY ("templateId") REFERENCES "learning_templates"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "learning_templates" ADD CONSTRAINT "learning_templates_ownerUserId_users_id_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_categoryId_categories_id_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_roles_id_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_permissions_id_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "daily_schedules" ADD CONSTRAINT "daily_schedules_learnerId_learners_id_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "daily_schedules" ADD CONSTRAINT "daily_schedules_createdByUserId_users_id_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_scheduleId_daily_schedules_id_fkey" FOREIGN KEY ("scheduleId") REFERENCES "daily_schedules"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_goalId_learner_goals_id_fkey" FOREIGN KEY ("goalId") REFERENCES "learner_goals"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_trackId_activity_tracks_id_fkey" FOREIGN KEY ("trackId") REFERENCES "activity_tracks"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "schedule_todos" ADD CONSTRAINT "schedule_todos_scheduleId_daily_schedules_id_fkey" FOREIGN KEY ("scheduleId") REFERENCES "daily_schedules"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "schedule_todos" ADD CONSTRAINT "schedule_todos_scheduleItemId_schedule_items_id_fkey" FOREIGN KEY ("scheduleItemId") REFERENCES "schedule_items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "schedule_todos" ADD CONSTRAINT "schedule_todos_learnerId_learners_id_fkey" FOREIGN KEY ("learnerId") REFERENCES "learners"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "schedule_todos" ADD CONSTRAINT "schedule_todos_goalId_learner_goals_id_fkey" FOREIGN KEY ("goalId") REFERENCES "learner_goals"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "schedule_todos" ADD CONSTRAINT "schedule_todos_trackId_activity_tracks_id_fkey" FOREIGN KEY ("trackId") REFERENCES "activity_tracks"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "schedule_todos" ADD CONSTRAINT "schedule_todos_createdByUserId_users_id_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_roles_id_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;