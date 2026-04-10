import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums/user-role";

export const providerEnum = pgEnum('provider', ['local', 'google', 'github']);

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash"),           // já opcional (sem .notNull())
    avatarUrl: text("avatar_url"),
    avatarPublicId: text("avatar_public_id"),
    role: userRoleEnum("role").notNull().default("BASIC"),
    provider: providerEnum("provider").notNull().default("local"), // ← novo
    providerId: text("provider_id"),                               // ← novo
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;