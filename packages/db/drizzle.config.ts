import { defineConfig } from "drizzle-kit"

/**
 * Drizzle Kit configuration — Cloudflare D1 (SQLite).
 *
 * `schema.ts` is the single source of truth and `drizzle/` holds the generated
 * migrations. The Alchemy stack applies them to the D1 database at deploy
 * (`Cloudflare.D1.Database({ migrations })`), so there is no Node migrator and
 * no database credentials here; `db:generate` only needs the schema.
 */
export default defineConfig({
    dialect: "sqlite",
    schema: "./schema.ts",
    out: "./drizzle",
})
