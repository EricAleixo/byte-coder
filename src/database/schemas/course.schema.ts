import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { courseLevelEnum } from "./enums/course-level";

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image"),
  coverImagePublicId: text("cover_image_public_id"),
  level: courseLevelEnum("level").notNull().default("BEGINNER"),
  enrolledCount: integer("enrolled_count").notNull().default(0),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;