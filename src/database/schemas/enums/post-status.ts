import { pgEnum } from "drizzle-orm/pg-core";

export const postStatusEnum = pgEnum("post_status", ["DRAFT", "PUBLISHED"]);

export type PostStatus = "DRAFT" | "PUBLISHED";