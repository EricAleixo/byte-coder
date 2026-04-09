import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
} from "drizzle-orm/pg-core";

import { postStatusEnum } from "./enums/post-status";
import { categories } from "./category.schema";
import { users } from "./user.schema";

export const posts = pgTable("posts", {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    coverImage: text("cover_image"),
    coverImagePublicId: text("cover_image_public_id"),
    readTime: varchar("read_time", { length: 20 }),

    categoryId: uuid("category_id")
        .notNull()
        .references(() => categories.id, { onDelete: "restrict" }),

    status: postStatusEnum("status").notNull().default("DRAFT"),

    authorId: uuid("author_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;