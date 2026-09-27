ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user';
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banReason" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banExpires" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "impersonatedBy" text;
