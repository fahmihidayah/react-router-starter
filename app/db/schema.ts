import { integer, pgTable, varchar,boolean, timestamp } from "drizzle-orm/pg-core";
// Better-auth tables
export const user = pgTable("user", {
    id: varchar("id").primaryKey(),
    name: varchar("name").notNull(),
    email: varchar("email").notNull().unique(),
    emailVerified: boolean("emailVerified", ).notNull(),
    image: varchar("image"),
    createdAt: timestamp("createdAt",).notNull(),
    updatedAt: timestamp("updatedAt",).notNull(),
});

export const session = pgTable("session", {
    id: varchar("id").primaryKey(),
    expiresAt: timestamp("expiresAt",).notNull(),
    token: varchar("token").notNull().unique(),
    createdAt: timestamp("createdAt", ).notNull(),
    updatedAt: timestamp("updatedAt", ).notNull(),
    ipAddress: varchar("ipAddress"),
    userAgent: varchar("userAgent"),
    userId: varchar("userId")
        .notNull()
        .references(() => user.id,{
            onDelete: 'cascade'
        }),
});

export const account = pgTable("account", {
    id: varchar("id").primaryKey(),
    accountId: varchar("accountId").notNull(),
    providerId: varchar("providerId").notNull(),
    userId: varchar("userId")
        .notNull()
        .references(() => user.id, {
            onDelete: 'cascade'
        }),
    accessToken: varchar("accessToken"),
    refreshToken: varchar("refreshToken"),
    idToken: varchar("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", ),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", ),
    scope: varchar("scope"),
    password: varchar("password"),
    createdAt: timestamp("createdAt", ).notNull(),
    updatedAt: timestamp("updatedAt", ).notNull(),
});

export const verification = pgTable("verification", {
    id: varchar("id").primaryKey(),
    identifier: varchar("identifier").notNull(),
    value: varchar("value").notNull(),
    expiresAt: timestamp("expiresAt",).notNull(),
    createdAt: timestamp("createdAt", ),
    updatedAt: timestamp("updatedAt", ),
});

export const task = pgTable("tasks", {
    id: varchar("id").primaryKey(),
    title: varchar("title"),
    description: varchar("description"),
    createdAt: timestamp("createdAt", ),
    updatedAt: timestamp("updatedAt",),
})