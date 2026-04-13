import { pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { courses } from "./course.schema";
import { users } from "./user.schema";

export const courseEnrollments = pgTable("course_enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueEnrollment: uniqueIndex("unique_enrollment")
    .on(table.userId, table.courseId),
}));