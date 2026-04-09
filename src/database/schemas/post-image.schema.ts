import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { posts } from "./post.schema";

export const postImages = pgTable("post_images", {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
        .notNull()
        .references(() => posts.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    publicId: text("public_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type PostImage = typeof postImages.$inferSelect;
export type NewPostImage = typeof postImages.$inferInsert;