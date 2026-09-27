import { pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { courses } from "./course.schema";
import { courseLessons } from "./course-lessons.schema";

export const courseLessonProgress = pgTable("course_lesson_progress", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),

  lessonId: uuid("lesson_id")
    .notNull()
    .references(() => courseLessons.id, { onDelete: "cascade" }),

  completedAt: timestamp("completed_at").notNull().defaultNow(),
}, (table) => ({
  uniqueProgress: uniqueIndex("unique_lesson_progress").on(table.userId, table.lessonId),
}));

export type CourseLessonProgress = typeof courseLessonProgress.$inferSelect;
export type NewCourseLessonProgress = typeof courseLessonProgress.$inferInsert;