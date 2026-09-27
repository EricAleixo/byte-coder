import { pgTable, uuid, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { courses } from './course.schema';

export const courseOutcomes = pgTable('course_outcomes', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  order: integer('order').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type CourseOutcome = typeof courseOutcomes.$inferSelect;
export type NewCourseOutcome = typeof courseOutcomes.$inferInsert;
