import { db, users } from "@/db"
import { eq } from "drizzle-orm"
import { publicProcedure } from "../../trpc"
import { z } from "zod"

export const getSingleUser = publicProcedure
    .input(z.string().optional().nullable())
    .query(async ({ input: id }) => {
        if (!id) return null

        const result = await db.select().from(users).where(eq(users.id, id))

        return result[0] || null
    })
