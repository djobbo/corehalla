import { defineConfig } from "drizzle-kit"

/** Schema is the source of truth; Alchemy applies `drizzle/` migrations at deploy. */
export default defineConfig({
    dialect: "sqlite",
    schema: "./schema.ts",
    out: "./drizzle",
})
