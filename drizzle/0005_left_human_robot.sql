CREATE TABLE "course_lesson_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"label" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"type" "course_resource_type" DEFAULT 'DOC' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_lesson_resources" ADD CONSTRAINT "course_lesson_resources_lesson_id_course_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lessons"("id") ON DELETE cascade ON UPDATE no action;