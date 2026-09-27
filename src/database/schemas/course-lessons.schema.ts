import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  text,
} from 'drizzle-orm/pg-core';
import { courses } from './course.schema';
import { courseVideoProviderEnum } from './enums/course-video-provider';

export const courseLessons = pgTable("course_lessons", {
  id: uuid("id").primaryKey().defaultRandom(),

  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),

  order: integer("order").notNull(),

  title: varchar("title", { length: 255 }).notNull(),

  description: text("description"),

  duration: integer("duration"), // segundos

  videoUrl: text("video_url"),

  videoProvider: courseVideoProviderEnum("video_provider"),

  createdAt: timestamp("created_at").notNull().defaultNow(),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CourseLesson = typeof courseLessons.$inferSelect;
export type NewCourseLesson = typeof courseLessons.$inferInsert;