import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { pgTable, uuid } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
})

export type User = typeof users.$inferSelect
export const insertUserSchema = createInsertSchema(users)

export type NewUser = typeof users.$inferInsert
export const selectUserSchema = createSelectSchema(users)
