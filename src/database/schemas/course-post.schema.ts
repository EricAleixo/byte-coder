import {
  pgTable,
  uuid,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { courses } from "./course.schema";
import { posts } from "./post.schema";

export const coursePosts = pgTable(
  "course_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    uniqueCoursePost: unique().on(t.courseId, t.postId),
    uniqueCoursePosition: unique().on(t.courseId, t.position),
  })
);

export type CoursePost = typeof coursePosts.$inferSelect;
export type NewCoursePost = typeof coursePosts.$inferInsert;