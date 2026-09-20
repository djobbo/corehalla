#!/usr/bin/env node
/**
 * Database tasks for `packages/db`.
 *
 * Replaces the Prisma CLI (`prisma migrate dev|deploy`, `prisma db execute`).
 * Everything runs through the same Effect PostgreSQL client the application
 * uses, so there is only one driver and one set of connection settings.
 *
 * Commands:
 *   migrate   Apply pending migrations, then run the SQL in `sql/`
 *   init      Baseline an existing database: record the migrations as already
 *             applied without running them (for databases created by Prisma)
 *   setup     Only run the SQL in `sql/`
 *
 * Usage: node --env-file-if-exists=.env scripts/db.ts <command>
 */
import * as PgClient from "@effect/sql-pg/PgClient"
import { makeWithDefaults } from "drizzle-orm/effect-postgres"
import { migrate } from "drizzle-orm/effect-postgres/migrator"
import type { MigrationConfig } from "drizzle-orm/migrator"
import * as Effect from "effect/Effect"
import * as Redacted from "effect/Redacted"
import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "..")
const migrationsFolder = join(packageDir, "drizzle")
const sqlFolder = join(packageDir, "sql")

/** Drizzle's own separator for the statements inside one migration file. */
const BREAKPOINT = "--> statement-breakpoint"

/**
 * Retire the Supabase-Auth objects before migrating.
 *
 * These were installed out-of-band (the `auth.users` foreign key and trigger,
 * the RLS policies, the realtime publication), so drizzle-kit neither owns nor
 * drops them. The cleanup is idempotent and a no-op on a plain Postgres.
 */
const CLEAN_FILES = ["legacy_supabase_auth_cleanup.sql"] as const

/** Applied in order after every migrate; each is safe to re-run. */
const SETUP_FILES = [
    "extensions.sql",
    "functions.sql",
    "backfill_discord_ids.sql",
] as const

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
    console.error(
        "DATABASE_URL is not set. Run `pnpm setup:env`, or add it to packages/db/.env.",
    )
    process.exit(1)
}

const PgLive = PgClient.layer({ url: Redacted.make(databaseUrl) })

const [command] = process.argv.slice(2)

const program = Effect.gen(function* () {
    const db = yield* makeWithDefaults({})

    /** Runs every statement of one SQL file, in order. */
    const runSqlFile = (file: string) =>
        Effect.gen(function* () {
            const contents = yield* Effect.promise(() =>
                readFile(join(sqlFolder, file), "utf8"),
            )

            for (const statement of contents.split(BREAKPOINT)) {
                const trimmed = statement.trim()

                if (trimmed.length > 0) {
                    yield* db.$client.unsafe(trimmed)
                }
            }
        })

    const setup = Effect.forEach(SETUP_FILES, runSqlFile, {
        discard: true,
    })

    switch (command) {
        case "migrate": {
            yield* Effect.forEach(CLEAN_FILES, runSqlFile, { discard: true })
            yield* migrate(db, { migrationsFolder })
            yield* setup
            return
        }
        case "init": {
            // Records the baseline migration as applied without executing it,
            // for databases that already contain this schema. The runtime
            // understands `init`; the RC's `MigrationConfig` type omits it.
            yield* migrate(db, {
                migrationsFolder,
                init: true,
            } as MigrationConfig & { init: boolean })
            return
        }
        case "setup": {
            yield* setup
            return
        }
        default: {
            return yield* Effect.fail(
                new Error(
                    `Unknown command ${command ?? "(none)"}. Expected: migrate, init, setup.`,
                ),
            )
        }
    }
})

Effect.runPromise(program.pipe(Effect.provide(PgLive))).then(
    () => process.exit(0),
    (error) => {
        console.error(error)
        process.exit(1)
    },
)
