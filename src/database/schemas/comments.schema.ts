import { pgTable, text, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { posts } from "./post.schema";
import { users } from "./user.schema";


export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),

  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),

  authorId: uuid("author_id")
    .references(() => users.id, { onDelete: "cascade" }).notNull(),

  anonymousName: text("anonymous_name"),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),

  parentId: uuid("parent_id")
    .references((): any => comments.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;