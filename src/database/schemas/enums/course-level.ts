import { pgEnum } from "drizzle-orm/pg-core";

export const courseLevelEnum = pgEnum("course_level", [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);