import { z } from "zod"
import type { Config } from "drizzle-kit"

export default {
    schema: "./db/schema/index.ts",
    out: "./db/migrations",
    driver: "pg",
    dbCredentials: {
        connectionString: z.string().parse(process.env.DATABASE_URL),
    },
} satisfies Config
