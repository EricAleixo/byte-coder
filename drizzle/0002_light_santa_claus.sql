CREATE TYPE "public"."user_role" AS ENUM('BASIC', 'ADMIN');--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "color" varchar(20) NOT NULL;