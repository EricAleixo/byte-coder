ALTER TABLE "course_lessons" ALTER COLUMN "duration" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "course_lessons" ALTER COLUMN "duration" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "course_lessons" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "course_lessons" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "course_lessons" ADD COLUMN "video_provider" varchar(20);