CREATE TYPE "public"."provider" AS ENUM('local', 'google', 'github');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider" "provider" DEFAULT 'local' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider_id" text;