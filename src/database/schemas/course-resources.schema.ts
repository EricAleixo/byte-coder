import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { courses } from './course.schema';
import { courseResourceTypeEnum } from './enums/course-resource-type';

export const courseResources = pgTable('course_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 255 }).notNull(),
  url: text('url').notNull(),
  type: courseResourceTypeEnum('type').notNull().default('DOC'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type CourseResource = typeof courseResources.$inferSelect;
export type NewCourseResource = typeof courseResources.$inferInsert;
