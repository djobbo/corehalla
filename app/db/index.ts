import * as schema from "./schema"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { z } from "zod"
export * from "./schema"

const connectionString = z.string().parse(process.env.DATABASE_URL)

const pool = new Pool({
    connectionString,
})

export const db = drizzle(pool, { schema })
