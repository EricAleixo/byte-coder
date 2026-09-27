import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { courseLessons } from './course-lessons.schema';
import { courseResourceTypeEnum } from './enums/course-resource-type';

export const courseLessonResources = pgTable('course_lesson_resources', {
  id: uuid('id').primaryKey().defaultRandom(),

  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => courseLessons.id, { onDelete: 'cascade' }),

  label: varchar('label', { length: 255 }).notNull(),

  url: text('url').notNull(),

  type: courseResourceTypeEnum('type').notNull().default('DOC'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type CourseLessonResource = typeof courseLessonResources.$inferSelect;
export type NewCourseLessonResource = typeof courseLessonResources.$inferInsert;