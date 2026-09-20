import { defineConfig } from "drizzle-kit"

/**
 * Drizzle Kit configuration.
 *
 * This replaces the Prisma CLI. `schema.ts` is the single source of truth for
 * the database, `drizzle/` holds the generated migrations, and
 * `scripts/db.ts` applies them (plus the SQL in `sql/`) at runtime.
 */
export default defineConfig({
    dialect: "postgresql",
    schema: "./schema.ts",
    out: "./drizzle",

    // Only the `public` schema belongs to this project. Supabase owns `auth`,
    // `storage`, `realtime`, … and a generate/push must never touch them.
    schemaFilter: ["public"],

    // The `public` tables carry RLS policies that grant Supabase's `anon`,
    // `authenticated` and `service_role` roles access; drizzle-kit must not try
    // to manage those roles.
    entities: { roles: { provider: "supabase" } },

    migrations: {
        table: "__drizzle_migrations",
        schema: "drizzle",
    },

    // `drizzle-kit` loads `.env` from the package directory, which
    // `pnpm setup:env` writes. Only the commands that talk to a database
    // (migrate/push/studio/introspect) need this.
    dbCredentials: { url: process.env.DATABASE_URL ?? "" },
})
